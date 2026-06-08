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
  variant?: "default" | "compact";
}

export function StyleCarousel({
  selected,
  onSelect,
  variant = "default",
}: StyleCarouselProps) {
  const isAiChoice = selected === AI_CHOICE_STYLE;
  const isCompact = variant === "compact";

  const cardWidth = isCompact ? "w-[100px]" : "w-28";
  const imageHeight = isCompact ? "h-[100px]" : "aspect-square w-full";
  const labelClass = isCompact
    ? "text-[11px] font-semibold py-1.5 px-1 text-center bg-card text-foreground leading-tight"
    : "text-xs font-semibold py-2.5 px-1.5 text-center bg-card text-foreground leading-snug";

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <div
        className={`flex gap-3 overflow-x-auto pb-2 scrollbar-hide w-full max-w-full ${
          isCompact ? "snap-x snap-mandatory" : "snap-x snap-mandatory pb-4 -mx-4 px-4"
        }`}
        style={isCompact ? { scrollSnapType: "x mandatory" } : undefined}
      >
        <button
          type="button"
          onClick={() => onSelect(AI_CHOICE_STYLE)}
          className={`flex-shrink-0 ${cardWidth} snap-start rounded-2xl overflow-hidden border-2 transition-all ${
            isAiChoice
              ? "border-white ring-2 ring-accent/50"
              : "border-transparent"
          }`}
          style={{ scrollSnapAlign: "start" }}
        >
          <div
            className={`relative ${imageHeight} w-full bg-accent flex items-center justify-center`}
          >
            <span className="text-2xl" aria-hidden="true">
              ✨
            </span>
            {isAiChoice && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-accent text-xs">
                ✓
              </div>
            )}
          </div>
          <p
            className={`${labelClass} ${
              isAiChoice ? "bg-accent text-white" : ""
            }`}
          >
            Laisse l&apos;IA décider
          </p>
        </button>

        {roomStyles.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => onSelect(style)}
            className={`flex-shrink-0 ${cardWidth} snap-start rounded-2xl overflow-hidden border-2 transition-all ${
              selected === style
                ? "border-accent ring-2 ring-accent/30"
                : "border-transparent"
            }`}
            style={{ scrollSnapAlign: "start" }}
          >
            <div className={`relative ${imageHeight} w-full`}>
              <Image
                src={styleThumbnails[style]}
                alt={style}
                fill
                className="object-cover"
                sizes="100px"
              />
              {selected === style && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </div>
            <p className={labelClass}>{style}</p>
          </button>
        ))}
      </div>

      {isAiChoice && !isCompact && (
        <p className="text-xs text-muted text-center mt-1">
          L&apos;IA choisit le meilleur style pour ta pièce
        </p>
      )}

      {!isCompact && (
        <p className="text-xs text-muted text-center mt-1">
          ← Défile pour voir tous les styles →
        </p>
      )}
    </div>
  );
}
