"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getGeneration, saveGeneration } from "@/lib/session";
import { getPromptForStyle } from "@/lib/styles";

const messages = [
  "Analyse de ta pièce...",
  "Détection des proportions...",
  "Application du style...",
  "Finalisation du rendu...",
  "Presque prêt...",
];

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 8, 90));
    }, 500);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    async function generate() {
      const session = getGeneration();
      console.log("[loading] Session récupérée:", {
        hasOriginalUrl: !!session?.originalUrl,
        urlType: session?.originalUrl?.startsWith("data:")
          ? "base64"
          : session?.originalUrl?.startsWith("http")
            ? "url"
            : "vide/inconnu",
        style: session?.style,
        urlLength: session?.originalUrl?.length,
      });

      if (!session?.originalUrl) {
        console.error("[loading] originalUrl manquant — redirect /upload");
        router.push("/upload");
        return;
      }

      const prompt = getPromptForStyle(session.style, session.customPrompt);
      console.log("[loading] Prompt:", prompt.slice(0, 80));

      try {
        console.log("[loading] Appel /api/generate...");
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: session.originalUrl,
            prompt,
            style: session.style,
            customPrompt: session.customPrompt,
          }),
        });

        const data = await res.json();
        console.log("[loading] Réponse API:", res.status, data);

        if (!res.ok) {
          const msg = data.hint
            ? `${data.error} — ${data.hint}`
            : data.error || "Generation failed";
          throw new Error(msg);
        }

        setProgress(100);
        saveGeneration({ generatedUrl: data.generatedUrl });
        router.push("/preview");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de génération");
      }
    }

    generate();
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <Logo className="mb-12" />

      <div className="w-full max-w-md">
        <div className="h-2 bg-muted/20 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-center text-lg font-medium mb-2">
          {error || messages[messageIndex]}
        </p>

        {!error && (
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {error && (
          <button
            onClick={() => router.push("/upload")}
            className="btn-primary mt-6"
          >
            Réessayer
          </button>
        )}
      </div>
    </main>
  );
}
