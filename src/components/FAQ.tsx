"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Mes photos sont-elles stockées ?",
    a: "Oui, tes photos sont stockées de manière sécurisée sur nos serveurs. Tu peux les supprimer à tout moment depuis ton dashboard.",
  },
  {
    q: "Je peux annuler quand ?",
    a: "Absolument ! Tu peux annuler ton abonnement à tout moment depuis ton espace compte, sans frais ni engagement.",
  },
  {
    q: "Ça marche pour quelle pièce ?",
    a: "Pièce, salon, cuisine, bureau… Toute pièce intérieure ! Plus la photo est nette, meilleur est le résultat.",
  },
  {
    q: "La qualité est vraiment bonne ?",
    a: "On utilise une IA de pointe pour des rendus photoréalistes en haute qualité. Des milliers d'utilisateurs sont conquis !",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="card">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between text-left font-medium"
          >
            {faq.q}
            <span className="text-accent text-xl">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <p className="mt-3 text-muted text-sm leading-relaxed">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
