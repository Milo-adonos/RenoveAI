"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Example {
  before: string;
  after: string;
  style: string;
}

export function BeforeAfterCarousel({ examples }: { examples: Example[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % examples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [examples.length]);

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {examples.map((ex) => (
          <div key={ex.style} className="w-full flex-shrink-0 px-2">
            <div className="card overflow-hidden p-0">
              {/* Avant — en haut */}
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={ex.before}
                  alt={`Avant - ${ex.style}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                <span className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                  Avant
                </span>
              </div>

              {/* Après — en bas */}
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={ex.after}
                  alt={`Après - ${ex.style}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                <span className="absolute bottom-3 right-3 bg-accent text-white text-xs px-2 py-1 rounded-lg">
                  {ex.style}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicateurs */}
      <div className="flex justify-center gap-2 mt-4">
        {examples.map((ex, i) => (
          <button
            key={ex.style}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-accent" : "w-2 bg-muted/30"
            }`}
            aria-label={`Slide ${ex.style}`}
          />
        ))}
      </div>
    </div>
  );
}
