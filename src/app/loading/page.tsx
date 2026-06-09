"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GENERATION_MAX_MS,
  GENERATION_POLL_INTERVAL_MS,
  GENERATION_TYPICAL_MS,
} from "@/lib/generation-config";
import { getGeneration, saveGeneration } from "@/lib/session";

const STATUS_MESSAGES = [
  "Analyse de ta pièce en cours...",
  "Détection des proportions et de la lumière...",
  "Application du style choisi...",
  "Ajout des meubles et de la décoration...",
  "Peaufinage des détails...",
  "Dernières retouches en cours...",
  "C'est presque prêt, encore un instant...",
  "Ton rendu arrive, la qualité vaut l'attente ✨",
];

const tips = [
  {
    title: "Le savais-tu ? 💡",
    text: "Tu peux redesigner n'importe quelle pièce — chambre, salon, cuisine, jardin, façade, bureau...",
  },
  {
    title: "Le savais-tu ? 💡",
    text: "Plus de 18 styles disponibles — du scandinave au tropical en passant par le luxe et le bohème.",
  },
  {
    title: "Le savais-tu ? 💡",
    text: "L'IA analyse les proportions exactes de ta pièce pour un résultat photoréaliste et cohérent.",
  },
  {
    title: "Le savais-tu ? 💡",
    text: "Tes créations sont sauvegardées dans ton dashboard et téléchargeables en HD à tout moment.",
  },
  {
    title: "Le savais-tu ? 💡",
    text: "L'option 'Laisse l'IA décider' choisit automatiquement le meilleur style pour ta pièce.",
  },
  {
    title: "Astuce déco 🛋️",
    text: "En déco, la règle des 3 : groupe toujours tes objets par 3 pour un rendu harmonieux et naturel.",
  },
  {
    title: "Astuce déco 🛋️",
    text: "Un miroir bien placé peut doubler visuellement la taille d'une pièce et apporter beaucoup de lumière.",
  },
  {
    title: "Astuce déco 🛋️",
    text: "La règle du 60-30-10 : 60% couleur dominante, 30% secondaire, 10% couleur d'accent. Parfait à chaque fois.",
  },
  {
    title: "Astuce déco 🛋️",
    text: "Les plantes augmentent le bien-être de 47% dans un espace selon une étude de l'université d'Exeter.",
  },
  {
    title: "Astuce déco 🛋️",
    text: "Un tapis trop petit est l'erreur numéro 1 en déco. Il doit toujours être plus grand que tu ne le penses.",
  },
  {
    title: "Astuce déco 🛋️",
    text: "La lumière chaude (2700K) crée une atmosphère cosy. La lumière froide (4000K) booste la concentration.",
  },
  {
    title: "Astuce déco 🛋️",
    text: "Peindre un seul mur dans une couleur forte suffit à transformer toute une pièce sans budget énorme.",
  },
  {
    title: "Le saviez-vous ? 🏠",
    text: "Une pièce bien décorée peut augmenter la valeur d'un bien immobilier de 5 à 15% selon les experts.",
  },
  {
    title: "Le saviez-vous ? 🏠",
    text: "Le home staging — mettre en valeur un intérieur avant vente — permet de vendre 3x plus vite en moyenne.",
  },
  {
    title: "Le saviez-vous ? 🏠",
    text: "Les Français dépensent en moyenne 1 800€ par an en décoration et aménagement intérieur.",
  },
  {
    title: "Le saviez-vous ? 🏠",
    text: "Le style scandinave est le plus recherché en France depuis 5 ans consécutifs sur Pinterest et Instagram.",
  },
  {
    title: "Le saviez-vous ? 🏠",
    text: "Une bonne disposition des meubles peut rendre une pièce de 12m² aussi confortable qu'une pièce de 20m².",
  },
  {
    title: "Inspiration ✨",
    text: "Le style Japandi — fusion japonais et scandinave — est la tendance déco la plus forte de 2024-2025.",
  },
  {
    title: "Inspiration ✨",
    text: "Le biophilic design — intégrer la nature dans l'intérieur — réduit le stress de 37% selon Harvard.",
  },
  {
    title: "Inspiration ✨",
    text: "La couleur de l'année 2025 selon Pantone est le Mocha Mousse — un beige chocolat chaud et élégant.",
  },
  {
    title: "Inspiration ✨",
    text: "Les murs terrasse, vert sauge et bleu canard sont les couleurs les plus tendance du moment en France.",
  },
  {
    title: "Inspiration ✨",
    text: "Le mobilier vintage et de seconde main est en plein boom — 68% des moins de 30 ans le privilégient.",
  },
];

const POLL_INTERVAL_MS = GENERATION_POLL_INTERVAL_MS;
const TICK_MS = 100;
const MAX_GENERATION_MS = GENERATION_MAX_MS;
const PATIENCE_AFTER_MS = 25_000;
const MESSAGE_INTERVAL_MS = 6_000;
const TIP_INTERVAL_MS = 6_000;
const TIP_FADE_MS = 500;
const FINISH_TRANSITION_MS = 300;

const FRIENDLY_ERROR =
  "Notre IA est très sollicitée en ce moment.\nVeux-tu réessayer ?";

function getProgressFromElapsed(elapsedMs: number): number {
  const t = elapsedMs / 1000;
  const typicalSec = GENERATION_TYPICAL_MS / 1000;

  if (t <= typicalSec * 0.4) {
    return (t / (typicalSec * 0.4)) * 50;
  }

  if (t <= typicalSec) {
    return 50 + ((t - typicalSec * 0.4) / (typicalSec * 0.6)) * 35;
  }

  const pulseMs = 2000;
  const phase = ((elapsedMs - GENERATION_TYPICAL_MS) % (pulseMs * 2)) / pulseMs;
  if (phase <= 1) {
    return 86 + phase * 5;
  }
  return 91 - (phase - 1) * 5;
}

function getMessageIndex(elapsedMs: number): number {
  const slot = Math.floor(elapsedMs / MESSAGE_INTERVAL_MS);
  if (slot < STATUS_MESSAGES.length) return slot;
  return (slot - STATUS_MESSAGES.length) % STATUS_MESSAGES.length;
}

export default function LoadingPage() {
  const router = useRouter();
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const abortRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const [showPatience, setShowPatience] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const fail = useCallback((detail?: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    abortRef.current = true;
    if (detail) console.error("[loading]", detail);
    setHasFailed(true);
  }, []);

  const complete = useCallback(
    (generatedUrl: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      abortRef.current = true;
      setFinishing(true);
      setProgress(100);

      setTimeout(() => {
        saveGeneration({ generatedUrl });
        router.push("/preview");
      }, FINISH_TRANSITION_MS);
    },
    [router]
  );

  useEffect(() => {
    const tick = setInterval(() => {
      if (doneRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;

      setProgress(getProgressFromElapsed(elapsed));
      setMessageIndex(getMessageIndex(elapsed));

      if (!showPatience && elapsed >= PATIENCE_AFTER_MS) {
        setShowPatience(true);
      }
    }, TICK_MS);

    return () => clearInterval(tick);
  }, [showPatience]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (doneRef.current) return;
      setTipVisible(false);
      setTimeout(() => {
        setTipIndex((i) => (i + 1) % tips.length);
        setTipVisible(true);
      }, TIP_FADE_MS);
    }, TIP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function generate() {
      const session = getGeneration();

      if (!session?.originalUrl) {
        router.push("/upload");
        return;
      }

      const timeoutId = setTimeout(() => {
        fail("La génération a pris trop de temps. Réessayez.");
      }, MAX_GENERATION_MS);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: session.originalUrl,
            style: session.style,
            customPrompt: session.customPrompt,
          }),
        });

        const data = await res.json();

        if (abortRef.current) return;

        if (!res.ok) {
          fail(data.error || data.hint || "Impossible de lancer la génération");
          return;
        }

        if (data.generatedUrl) {
          clearTimeout(timeoutId);
          complete(data.generatedUrl as string);
          return;
        }

        const { taskId } = data as { taskId: string };
        let pollIndex = 0;

        while (!abortRef.current) {
          const statusRes = await fetch(
            `/api/generate/status?taskId=${taskId}&poll=${pollIndex}`
          );
          const statusData = await statusRes.json();

          if (abortRef.current) return;

          if (!statusRes.ok) {
            fail(
              statusData.error ||
                "La génération a échoué côté serveur IA"
            );
            return;
          }

          if (statusData.state === "fail") {
            fail(statusData.error || "La génération IA a échoué");
            return;
          }

          if (typeof statusData.progress === "number") {
            setProgress((prev) => Math.max(prev, statusData.progress));
          }

          if (
            statusData.state === "success" &&
            statusData.generatedUrl
          ) {
            clearTimeout(timeoutId);
            complete(statusData.generatedUrl);
            return;
          }

          pollIndex += 1;
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
      } catch (err) {
        if (!abortRef.current) {
          fail(
            err instanceof Error
              ? err.message
              : "Erreur réseau pendant la génération"
          );
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    generate();
  }, [router, fail, complete]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <span
        className="logo-loading font-hero font-bold text-[44px] text-accent mb-10 text-center"
        style={{
          cursor: "default",
          pointerEvents: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        RenoveAI.com
      </span>

      <div className="w-full max-w-md">
        <div className="h-2 bg-muted/20 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-accent rounded-full ease-out"
            style={{
              width: `${progress}%`,
              transition: finishing
                ? `width ${FINISH_TRANSITION_MS}ms ease-out`
                : "width 100ms linear",
            }}
          />
        </div>

        {showPatience && !hasFailed && (
          <p className="text-center text-sm italic text-accent mb-4 animate-fade-in">
            Notre IA travaille sur les moindres détails de ton rendu — la qualité
            vaut l&apos;attente 🎨
          </p>
        )}

        {!hasFailed && (
          <p className="text-center text-lg font-medium mb-2 min-h-[3.5rem] flex items-center justify-center">
            {STATUS_MESSAGES[messageIndex]}
          </p>
        )}

        {hasFailed ? (
          <div className="text-center mt-4">
            <p className="text-lg font-medium text-foreground whitespace-pre-line leading-relaxed">
              {FRIENDLY_ERROR}
            </p>
            <button
              onClick={() => router.push("/upload")}
              className="mt-6 inline-flex items-center gap-1 text-accent hover:text-accent-hover font-semibold text-base transition-colors"
            >
              Réessayer →
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-accent rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            <div
              className="mt-8 bg-white rounded-2xl p-4 shadow-sm transition-opacity duration-500"
              style={{ opacity: tipVisible ? 1 : 0 }}
            >
              <p className="text-sm font-semibold text-foreground mb-2">
                {tips[tipIndex].title}
              </p>
              <p className="text-sm text-[#8B7E74] leading-relaxed">
                {tips[tipIndex].text}
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
