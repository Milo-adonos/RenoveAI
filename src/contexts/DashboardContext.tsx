"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Generation } from "@/types/database";
import { isBypassAuthEnabled, getDevBypassUser } from "@/lib/dev-bypass";
import { addDevCreation } from "@/lib/dev-creations";
import { PRO_CREDITS } from "@/lib/credits";
import {
  clearCheckoutSession,
  getCheckoutSession,
  getGeneration,
} from "@/lib/session";

import { resolveGenerationResponse } from "@/lib/poll-generation";
const DEV_CREDITS_KEY = "renove_dev_credits_used";

export type PendingGeneration = {
  style?: string;
  originalUrl: string;
  aspectRatio: number;
};

type GenerationInput = {
  originalUrl: string;
  originalPath?: string;
  originalWidth: number;
  originalHeight: number;
  style?: string;
  customPrompt?: string;
};

type DashboardContextValue = {
  pendingGeneration: PendingGeneration | null;
  optimisticGeneration: Generation | null;
  successToast: boolean;
  generatingToast: boolean;
  dismissToast: () => void;
  refreshCreations: number;
  startGeneration: (input: GenerationInput) => Promise<string | null>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function GeneratingToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-accent text-white px-6 py-3 rounded-2xl shadow-lg">
      ✨ Ton rendu est en cours de création...
    </div>
  );
}

function SuccessToast({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-accent text-white px-6 py-3 rounded-2xl shadow-lg">
      ✨ Ton rendu est prêt !
    </div>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
}

function getDevCreditsUsed(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(DEV_CREDITS_KEY) || "0");
}

function incrementDevCreditsUsed(): void {
  const next = getDevCreditsUsed() + 1;
  localStorage.setItem(DEV_CREDITS_KEY, String(next));
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingGeneration, setPendingGeneration] =
    useState<PendingGeneration | null>(null);
  const [optimisticGeneration, setOptimisticGeneration] =
    useState<Generation | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [generatingToast, setGeneratingToast] = useState(false);
  const [refreshCreations, setRefreshCreations] = useState(0);
  const postCheckoutStartedRef = useRef(false);

  const dismissToast = useCallback(() => {
    setSuccessToast(false);
    setGeneratingToast(false);
  }, []);

  const startGeneration = useCallback(
    async (input: GenerationInput): Promise<string | null> => {
      const aspectRatio = input.originalWidth / input.originalHeight;

      if (isBypassAuthEnabled()) {
        const devUser = getDevBypassUser();
        if (devUser?.subscription_plan === "discovery") {
          const used = getDevCreditsUsed();
          if (used >= 5) {
            return "Tu n'as plus de crédits.";
          }
        }

        setPendingGeneration({
          style: input.style,
          originalUrl: input.originalUrl,
          aspectRatio,
        });
        setGeneratingToast(true);
        router.push("/dashboard/creations");

        try {
          const generationStartedAt = Date.now();
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: input.originalUrl,
              style: input.style,
              customPrompt: input.customPrompt,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Generation failed");

          const generatedUrl = await resolveGenerationResponse(
            data,
            generationStartedAt
          );

          addDevCreation({
            original_image_url: input.originalUrl,
            generated_image_url: generatedUrl,
            style: input.style || null,
            custom_prompt: input.customPrompt || null,
          });

          if (devUser?.subscription_plan === "discovery") {
            incrementDevCreditsUsed();
          }

          setPendingGeneration(null);
          setGeneratingToast(false);
          setRefreshCreations((n) => n + 1);
          setSuccessToast(true);
          return null;
        } catch (err) {
          setPendingGeneration(null);
          setGeneratingToast(false);
          return err instanceof Error ? err.message : "Erreur de génération";
        }
      }

      const limitRes = await fetch("/api/generations/limit");
      if (limitRes.ok) {
        const limit = await limitRes.json();
        if (!limit.canGenerate) {
          if (limit.plan === "discovery") {
            return "Tu n'as plus de crédits. Passe au Pro pour continuer.";
          }
          if (limit.plan === "pro") {
            const reset = limit.resetDate
              ? new Date(limit.resetDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "";
            return `Tu as utilisé tes ${PRO_CREDITS} crédits ce mois.${reset ? ` Renouvellement le ${reset}.` : ""}`;
          }
          return "Tu n'as plus de crédits.";
        }
      }

      setPendingGeneration({
        style: input.style,
        originalUrl: input.originalUrl,
        aspectRatio,
      });
      setGeneratingToast(true);
      router.push("/dashboard/creations");

      try {
        const generationStartedAt = Date.now();
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: input.originalUrl,
            style: input.style,
            customPrompt: input.customPrompt,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");

        const generatedUrl = await resolveGenerationResponse(
          data,
          generationStartedAt
        );

        setPendingGeneration(null);
        setGeneratingToast(false);
        setOptimisticGeneration({
          id: `optimistic-${Date.now()}`,
          user_id: "pending",
          original_image_url: input.originalUrl,
          generated_image_url: generatedUrl,
          style: input.style || null,
          custom_prompt: input.customPrompt || null,
          created_at: new Date().toISOString(),
        });
        setSuccessToast(true);

        void fetch("/api/generations/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalUrl: input.originalUrl,
            generatedUrl,
            style: input.style,
            customPrompt: input.customPrompt,
            originalPath: input.originalPath,
            asyncCompletion: !data.sync,
          }),
        })
          .then(async (saveRes) => {
            if (!saveRes.ok) {
              console.error(
                "[dashboard] Sauvegarde en arrière-plan échouée:",
                await saveRes.text()
              );
              return;
            }
            setOptimisticGeneration(null);
            setRefreshCreations((n) => n + 1);
          })
          .catch((err) => {
            console.error("[dashboard] Sauvegarde en arrière-plan:", err);
          });

        return null;
      } catch (err) {
        setPendingGeneration(null);
        setGeneratingToast(false);
        return err instanceof Error ? err.message : "Erreur de génération";
      }
    },
    [router]
  );

  useEffect(() => {
    if (postCheckoutStartedRef.current) return;
    if (searchParams.get("success") !== "true") return;

    const checkout = getCheckoutSession();
    if (!checkout) return;

    postCheckoutStartedRef.current = true;

    const session = getGeneration();
    const style =
      checkout.selectedStyle === "custom"
        ? session?.style
        : checkout.selectedStyle;

    clearCheckoutSession();

    void startGeneration({
      originalUrl: checkout.originalImageUrl,
      originalPath: session?.originalPath,
      originalWidth: session?.originalWidth ?? 1600,
      originalHeight: session?.originalHeight ?? 1200,
      style: style || undefined,
      customPrompt: session?.customPrompt,
    });
  }, [searchParams, startGeneration]);

  return (
    <DashboardContext.Provider
      value={{
        pendingGeneration,
        optimisticGeneration,
        successToast,
        generatingToast,
        dismissToast,
        refreshCreations,
        startGeneration,
      }}
    >
      {children}
      {generatingToast && !successToast && (
        <GeneratingToast onDismiss={dismissToast} />
      )}
      {successToast && <SuccessToast onDismiss={dismissToast} />}
    </DashboardContext.Provider>
  );
}
