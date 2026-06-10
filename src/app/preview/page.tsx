"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getGeneration } from "@/lib/session";
import { FUNNEL } from "@/lib/funnel-events";
import { useFunnelCapture } from "@/hooks/useFunnelCapture";
import { createClient } from "@/lib/supabase/client";

const TIMER_SECONDS = 10 * 60;
const SHARP_WIDTH_PERCENT = 35;
const SHARP_HEIGHT_PERCENT = 40;
const BLUR_PX = 12;
const OVERLAY_RGBA = "rgba(0,0,0,0.3)";
const REVEAL_MS = 300;
const CURTAIN_MS = 600;

const antiScreenshotStyle: CSSProperties = {
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
};

function blurPanelStyle(
  animationDone: boolean,
  skipTransition: boolean
): CSSProperties {
  return {
    backdropFilter: `blur(${BLUR_PX}px)`,
    WebkitBackdropFilter: `blur(${BLUR_PX}px)`,
    backgroundColor: OVERLAY_RGBA,
    clipPath: animationDone ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
    transition: skipTransition ? "none" : `clip-path ${CURTAIN_MS}ms ease-in`,
    pointerEvents: "none",
  };
}

function loadImageAspectRatio(url: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
    img.onerror = () => resolve(4 / 3);
    img.src = url;
  });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function vibrateOnClick(captureFunnel: (event: string) => void) {
  captureFunnel(FUNNEL.unlockClicked);
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

export default function PreviewPage() {
  const router = useRouter();
  const captureFunnel = useFunnelCapture();
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 3);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [animationDone, setAnimationDone] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);

  const isExpired = timeLeft === 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("previewSeen");

    if (alreadySeen) {
      setSkipTransition(true);
      setAnimationDone(true);
      return;
    }

    const timer = setTimeout(() => {
      setAnimationDone(true);
      sessionStorage.setItem("previewSeen", "true");
    }, REVEAL_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function check() {
      const session = getGeneration();
      if (!session?.generatedUrl) {
        router.push("/upload");
        return;
      }

      setGeneratedUrl(session.generatedUrl);

      if (session.originalWidth && session.originalHeight) {
        setAspectRatio(session.originalWidth / session.originalHeight);
      } else if (session.originalUrl) {
        const ratio = await loadImageAspectRatio(session.originalUrl);
        setAspectRatio(ratio);
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", user.id)
          .single();

        if (
          profile &&
          profile.subscription_status === "active"
        ) {
          setIsSubscribed(true);
          router.push("/dashboard");
          return;
        }
      }

      setLoading(false);
    }

    check();
  }, [router]);

  if (loading || !generatedUrl) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">Chargement...</div>
      </main>
    );
  }

  if (isSubscribed) return null;

  return (
    <main
      className="min-h-screen pb-12"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <header className="px-5 pt-6 max-w-lg mx-auto w-full">
        <Logo />
        <div className="flex justify-center py-2">
          <p
            className={`text-[18px] font-bold px-4 py-2 rounded-[20px] ${
              isExpired
                ? "text-[#C0392B] bg-[#FFF8F3]"
                : "text-accent bg-[#FFF8F3]"
            }`}
          >
            {isExpired
              ? "⚠️ Ton rendu a expiré"
              : `⏳ Ton rendu expire dans ${formatTime(timeLeft)}`}
          </p>
        </div>
      </header>

      <div className="px-5 max-w-lg mx-auto w-full">
        <div
          className="relative w-full rounded-2xl shadow-card overflow-hidden"
          style={{ aspectRatio }}
        >
          <div
            className="absolute inset-0"
            onContextMenu={(e) => e.preventDefault()}
            style={antiScreenshotStyle}
          >
            <img
              src={generatedUrl}
              alt="Aperçu du rendu"
              className="w-full h-full object-cover"
              style={{
                ...antiScreenshotStyle,
                pointerEvents: "none",
              }}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />

            {/* Zone floutée — bande droite (65% largeur) */}
            <div
              aria-hidden="true"
              className="absolute top-0 right-0"
              style={{
                width: `${100 - SHARP_WIDTH_PERCENT}%`,
                height: "100%",
                ...blurPanelStyle(animationDone, skipTransition),
              }}
            />

            {/* Zone floutée — bande basse gauche */}
            <div
              aria-hidden="true"
              className="absolute left-0 bottom-0"
              style={{
                width: `${SHARP_WIDTH_PERCENT}%`,
                height: `${100 - SHARP_HEIGHT_PERCENT}%`,
                ...blurPanelStyle(animationDone, skipTransition),
              }}
            />

            {/* Zone visible — bordure lumineuse terracotta/dorée */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 z-10 pointer-events-none rounded-tl-2xl"
              style={{
                width: `${SHARP_WIDTH_PERCENT}%`,
                height: `${SHARP_HEIGHT_PERCENT}%`,
                border: "2px solid #C8956C",
                boxShadow:
                  "0 0 0 1px rgba(160, 82, 45, 0.5), 0 0 16px rgba(200, 149, 108, 0.65), inset 0 0 20px rgba(255, 240, 220, 0.15)",
                opacity: animationDone ? 1 : 0,
                transition: skipTransition
                  ? "none"
                  : `opacity ${CURTAIN_MS}ms ease-in`,
              }}
            />

            {/* Séparateur vertical */}
            <div
              aria-hidden="true"
              className="absolute top-0 z-10 pointer-events-none"
              style={{
                left: `${SHARP_WIDTH_PERCENT}%`,
                width: 3,
                height: "100%",
                transform: "translateX(-50%)",
                background:
                  "linear-gradient(to bottom, #A0522D 0%, rgba(160, 82, 45, 0.4) 40%, transparent 100%)",
                opacity: animationDone ? 1 : 0,
                transition: skipTransition
                  ? "none"
                  : `opacity ${CURTAIN_MS}ms ease-in`,
              }}
            />

            {/* Séparateur horizontal */}
            <div
              aria-hidden="true"
              className="absolute left-0 z-10 pointer-events-none"
              style={{
                top: `${SHARP_HEIGHT_PERCENT}%`,
                width: `${SHARP_WIDTH_PERCENT}%`,
                height: 3,
                transform: "translateY(-50%)",
                background:
                  "linear-gradient(to right, #A0522D 0%, rgba(160, 82, 45, 0.4) 50%, transparent 100%)",
                opacity: animationDone ? 1 : 0,
                transition: skipTransition
                  ? "none"
                  : `opacity ${CURTAIN_MS}ms ease-in`,
              }}
            />

            {/* Badge sur la zone floutée */}
            {animationDone && (
              <Link
                href="/pricing"
                onClick={() => vibrateOnClick(captureFunnel)}
                className="absolute z-20 animate-preview-pulse bg-accent hover:bg-accent-hover text-white font-bold text-sm sm:text-base px-5 py-3 rounded-2xl shadow-lg transition-colors text-center whitespace-nowrap"
                style={{
                  left: `${SHARP_WIDTH_PERCENT + (100 - SHARP_WIDTH_PERCENT) / 2}%`,
                  top: `${SHARP_HEIGHT_PERCENT + (100 - SHARP_HEIGHT_PERCENT) / 2}%`,
                }}
              >
                🔒 Débloque le rendu complet
              </Link>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <h1 className="font-hero text-2xl sm:text-3xl font-bold text-foreground leading-snug">
            Ta pièce a été redesignée
          </h1>
          <p className="text-sm text-muted mt-3">
            ⭐⭐⭐⭐⭐ 4,8/5 — rejoins +2 300 utilisateurs satisfaits
          </p>
          <p className="font-hero text-[18px] sm:text-[20px] text-foreground mt-4 leading-relaxed px-2">
            Tu vois le résultat — débloque tout pour le voir en HD et le
            télécharger ✨
          </p>
        </div>

        <Link
          href="/pricing"
          onClick={() => vibrateOnClick(captureFunnel)}
          className="block w-full bg-accent hover:bg-accent-hover text-white font-bold text-lg py-5 px-6 rounded-2xl text-center mt-8 transition-colors btn-preview-cta"
        >
          🔓 Voir mon rendu maintenant →
        </Link>
      </div>
    </main>
  );
}
