"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getGeneration } from "@/lib/session";
import { FUNNEL } from "@/lib/funnel-events";
import { useFunnelCapture } from "@/hooks/useFunnelCapture";
import { createClient } from "@/lib/supabase/client";

const BLUR_PX = 6;

const antiScreenshotStyle: CSSProperties = {
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
};

function loadImageAspectRatio(url: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
    img.onerror = () => resolve(4 / 3);
    img.src = url;
  });
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

        if (profile && profile.subscription_status === "active") {
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
      className="min-h-screen"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <header className="px-5 pt-6 max-w-lg mx-auto w-full">
        <Logo />
      </header>

      <div className="px-5 max-w-lg mx-auto w-full">
        <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1A1A1A] text-center pb-3">
          Ta pièce a été redesignée
        </h1>

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

            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                backdropFilter: `blur(${BLUR_PX}px)`,
                WebkitBackdropFilter: `blur(${BLUR_PX}px)`,
              }}
            />

            <Link
              href="/pricing"
              onClick={() => vibrateOnClick(captureFunnel)}
              className="absolute top-1/2 left-1/2 z-10 animate-preview-pulse bg-[#A0522D] hover:bg-accent-hover text-white font-bold text-sm sm:text-base px-5 py-3 rounded-2xl shadow-lg transition-colors text-center whitespace-nowrap"
            >
              🔒 Débloque le rendu complet
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
