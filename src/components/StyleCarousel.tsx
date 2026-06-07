"use client";

import Image from "next/image";
import {
  AI_CHOICE_STYLE,
  roomStyles,
  styleThumbnails,
} from "@/lib/styles";

interface StyleCarouselProps {
  selected: string | null;
  onSelect: (style: string) => void;
}

export function StyleCarousel({ selected, onSelect }: StyleCarouselProps) {
  const isAiChoice = selected === AI_CHOICE_STYLE;

  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
        {/* Laisse l'IA décider — première carte */}
        <button
          onClick={() => onSelect(AI_CHOICE_STYLE)}
          className={`flex-shrink-0 w-28 snap-start rounded-2xl overflow-hidden border-2 transition-all ${
            isAiChoice
              ? "border-white ring-2 ring-accent/50"
              : "border-transparent"
          }`}
        >
          <div className="relative aspect-square w-full bg-accent flex items-center justify-center">
            <span className="text-3xl" aria-hidden="true">
              ✨
            </span>
            {isAiChoice && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-accent text-xs">
                ✓
              </div>
            )}
          </div>
          <p className="text-xs font-bold py-2 px-1 text-center bg-accent text-white leading-tight">
            Laisse l&apos;IA décider
          </p>
        </button>

        {roomStyles.map((style) => (
          <button
            key={style}
            onClick={() => onSelect(style)}
            className={`flex-shrink-0 w-28 snap-start rounded-2xl overflow-hidden border-2 transition-all ${
              selected === style
                ? "border-accent ring-2 ring-accent/30"
                : "border-transparent"
            }`}
          >
            <div className="relative aspect-square w-full">
              <Image
                src={styleThumbnails[style]}
                alt={style}
                fill
                className="object-cover"
                sizes="112px"
              />
              {selected === style && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </div>
            <p className="text-xs font-semibold py-2.5 px-1.5 text-center bg-card text-foreground leading-snug">
              {style}
            </p>
          </button>
        ))}
      </div>

      {isAiChoice && (
        <p className="text-xs text-muted text-center mt-1">
          L&apos;IA choisit le meilleur style pour ta pièce
        </p>
      )}

      <p className="text-xs text-muted text-center mt-1">
        ← Défile pour voir tous les styles →
      </p>
    </div>
  );
}
