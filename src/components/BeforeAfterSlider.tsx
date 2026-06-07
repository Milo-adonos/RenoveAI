"use client";

import Image from "next/image";
import { useState } from "react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  style: string;
}

export function BeforeAfterSlider({ before, after, style }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[3/2] w-full select-none">
        <Image src={after} alt={`Après - ${style}`} fill className="object-cover" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image src={before} alt={`Avant - ${style}`} fill className="object-cover" />
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
            <span className="text-xs text-muted">⟷</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          aria-label="Comparer avant et après"
        />
        <span className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
          Avant
        </span>
        <span className="absolute top-3 right-3 bg-accent text-white text-xs px-2 py-1 rounded-lg">
          {style}
        </span>
      </div>
    </div>
  );
}
