"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Example {
  room: string;
  before: string;
  after: string;
  style: string;
}

export function BeforeAfterCarousel({ examples }: { examples: Example[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % examples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [examples.length]);

  const current = examples[active];

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl shadow-card bg-card">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {examples.map((ex, i) => (
            <div key={ex.room} className="w-full flex-shrink-0">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={ex.before}
                  alt={`Avant — ${ex.room}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                  priority={i === 0}
                />
                <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                  Avant
                </span>
              </div>

              <div className="h-0.5 bg-background" aria-hidden="true" />

              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={ex.after}
                  alt={`Après — ${ex.room}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                  priority={i === 0}
                />
                <span className="absolute bottom-3 right-3 bg-accent text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                  {ex.style}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted mt-4">
        {current.room} — style {current.style}
      </p>

      <div className="flex justify-center gap-2 mt-3">
        {examples.map((ex, i) => (
          <button
            key={ex.room}
            type="button"
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-accent" : "w-2 bg-muted/30"
            }`}
            aria-label={`${ex.room} — ${ex.style}`}
            aria-current={i === active ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
