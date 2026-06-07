"use client";

import { useEffect, useState } from "react";
import { getSocialProofCount } from "@/lib/social-proof";

export function LiveCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(getSocialProofCount());
  }, []);

  if (count === null) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-muted">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="opacity-0">1 000 pièces redesignées aujourd&apos;hui</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      {count.toLocaleString("fr-FR")} pièces redesignées aujourd&apos;hui
    </span>
  );
}
