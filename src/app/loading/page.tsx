"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCheckoutSession,
  getGeneration,
} from "@/lib/session";

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

const FAKE_LOADING_MS = 10_000;
const TICK_MS = 100;
const MESSAGE_INTERVAL_MS = 6_000;
const TIP_INTERVAL_MS = 6_000;
const TIP_FADE_MS = 500;
const FINISH_TRANSITION_MS = 300;

function getProgressFromElapsed(elapsedMs: number): number {
  return Math.min(100, (elapsedMs / FAKE_LOADING_MS) * 100);
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

  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    const checkout = getCheckoutSession();
    const session = getGeneration();

    if (!checkout?.originalImageUrl && !session?.originalUrl) {
      router.push("/upload");
    }
  }, [router]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (doneRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const nextProgress = getProgressFromElapsed(elapsed);

      setProgress(nextProgress);
      setMessageIndex(getMessageIndex(elapsed));

      if (elapsed >= FAKE_LOADING_MS) {
        doneRef.current = true;
        setFinishing(true);
        setProgress(100);

        setTimeout(() => {
          router.push("/pricing");
        }, FINISH_TRANSITION_MS);
      }
    }, TICK_MS);

    return () => clearInterval(tick);
  }, [router]);

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

        <p className="text-center text-lg font-medium mb-2 min-h-[3.5rem] flex items-center justify-center">
          {STATUS_MESSAGES[messageIndex]}
        </p>

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
      </div>
    </main>
  );
}
