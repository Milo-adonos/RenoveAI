"use client";

import { isBypassAuthEnabled } from "@/lib/dev-bypass";

export function DevBypassBanner() {
  if (!isBypassAuthEnabled()) return null;

  return (
    <div className="bg-yellow-100 text-black text-sm px-4 py-2 rounded-xl mb-4 text-center">
      🛠️ Mode développement — Auth et Stripe désactivés
    </div>
  );
}
