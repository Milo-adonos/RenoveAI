"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Generation } from "@/types/database";
import { isBypassAuthEnabled, getDevBypassUser } from "@/lib/dev-bypass";
import { addDevCreation } from "@/lib/dev-creations";
import { getNextMonday, WEEKLY_LIMIT } from "@/lib/weekly-generations";

import { pollGenerationUntilDone } from "@/lib/poll-generation";
const DEV_WEEKLY_KEY = "renove_dev_weekly_used";

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
  dismissToast: () => void;
  refreshCreations: number;
  startGeneration: (input: GenerationInput) => Promise<string | null>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

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

function getDevWeeklyUsed(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(DEV_WEEKLY_KEY) || "0");
}

function incrementDevWeeklyUsed(): void {
  const next = getDevWeeklyUsed() + 1;
  localStorage.setItem(DEV_WEEKLY_KEY, String(next));
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pendingGeneration, setPendingGeneration] =
    useState<PendingGeneration | null>(null);
  const [optimisticGeneration, setOptimisticGeneration] =
    useState<Generation | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [refreshCreations, setRefreshCreations] = useState(0);

  const dismissToast = useCallback(() => setSuccessToast(false), []);

  const startGeneration = useCallback(
    async (input: GenerationInput): Promise<string | null> => {
      const aspectRatio = input.originalWidth / input.originalHeight;

      if (isBypassAuthEnabled()) {
        const devUser = getDevBypassUser();
        if (devUser?.subscription_plan === "weekly") {
          const used = getDevWeeklyUsed();
          if (used >= WEEKLY_LIMIT) {
            const reset = getNextMonday().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });
            return `Tu as atteint ta limite hebdomadaire. Reviens ${reset} ou passe au mensuel.`;
          }
        }

        setPendingGeneration({
          style: input.style,
          originalUrl: input.originalUrl,
          aspectRatio,
        });
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

          const { taskId } = data as { taskId: string };
          const generatedUrl = await pollGenerationUntilDone(
            taskId,
            generationStartedAt
          );

          addDevCreation({
            original_image_url: input.originalUrl,
            generated_image_url: generatedUrl,
            style: input.style || null,
            custom_prompt: input.customPrompt || null,
          });

          if (devUser?.subscription_plan === "weekly") {
            incrementDevWeeklyUsed();
          }

          setPendingGeneration(null);
          setRefreshCreations((n) => n + 1);
          setSuccessToast(true);
          return null;
        } catch (err) {
          setPendingGeneration(null);
          return err instanceof Error ? err.message : "Erreur de génération";
        }
      }

      const limitRes = await fetch("/api/generations/limit");
      if (limitRes.ok) {
        const limit = await limitRes.json();
        if (!limit.canGenerate) {
          const reset = new Date(limit.resetDate).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          });
          return `Tu as atteint ta limite hebdomadaire. Reviens ${reset} ou passe au mensuel.`;
        }
      }

      setPendingGeneration({
        style: input.style,
        originalUrl: input.originalUrl,
        aspectRatio,
      });
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

        const { taskId } = data as { taskId: string };
        const generatedUrl = await pollGenerationUntilDone(
          taskId,
          generationStartedAt
        );

        setPendingGeneration(null);
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
        return err instanceof Error ? err.message : "Erreur de génération";
      }
    },
    [router]
  );

  return (
    <DashboardContext.Provider
      value={{
        pendingGeneration,
        optimisticGeneration,
        successToast,
        dismissToast,
        refreshCreations,
        startGeneration,
      }}
    >
      {children}
      {successToast && <SuccessToast onDismiss={dismissToast} />}
    </DashboardContext.Provider>
  );
}
