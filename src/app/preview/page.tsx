"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getGeneration } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";

const TIMER_SECONDS = 10 * 60;

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

function vibrateOnClick() {
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

export default function PreviewPage() {
  const router = useRouter();
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
    }, 300);

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
          className="w-full rounded-2xl shadow-card"
          style={{ aspectRatio }}
        >
          <div style={{ position: "relative", overflow: "hidden" }}>
            <img
              src={generatedUrl}
              alt="Rendu flouté"
              style={{
                width: "100%",
                display: "block",
                userSelect: "none",
                WebkitUserSelect: "none",
                pointerEvents: "none",
              }}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                clipPath: animationDone
                  ? "inset(0 0 0% 0)"
                  : "inset(0 0 100% 0)",
                transition: skipTransition
                  ? "none"
                  : "clip-path 0.6s ease-in",
                pointerEvents: "none",
              }}
            />

            <Link
              href="/pricing"
              onClick={vibrateOnClick}
              className="absolute top-1/2 left-1/2 animate-preview-pulse bg-accent hover:bg-accent-hover text-white font-bold text-base sm:text-lg px-6 py-3.5 rounded-2xl shadow-lg transition-colors text-center whitespace-nowrap z-10"
            >
              🔒 Débloque ton rendu
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <h1 className="font-hero text-2xl sm:text-3xl font-bold text-foreground leading-snug">
            Ta pièce a été redesignée
          </h1>
          <p className="text-sm text-muted mt-3">
            ⭐⭐⭐⭐⭐ 4,8/5 — rejoins +2 300 utilisateurs satisfaits
          </p>
          <p className="font-hero text-[20px] sm:text-[22px] text-foreground mt-4 leading-relaxed">
            Débloque le rendu pour le voir et le télécharger !
          </p>
        </div>

        <Link
          href="/pricing"
          onClick={vibrateOnClick}
          className="block w-full bg-accent hover:bg-accent-hover text-white font-bold text-lg py-5 px-6 rounded-2xl text-center mt-8 transition-colors btn-preview-cta"
        >
          🔓 Voir mon rendu maintenant →
        </Link>
      </div>
    </main>
  );
}
