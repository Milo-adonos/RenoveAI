"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Ça marche pour quelle pièce ?",
    a: "Renove AI fonctionne pour n'importe quel espace : chambre, salon, cuisine, bureau, salle de bain, jardin, façade... Même une pièce complètement vide. Tu prends en photo ce que tu veux transformer et l'IA s'occupe du reste.",
  },
  {
    q: "Est-ce que je peux annuler mon abonnement ?",
    a: "Oui, à tout moment et sans justification. Tu gères ton abonnement directement depuis ton espace 'Mon compte'. L'annulation prend effet immédiatement et tu n'es plus prélevé.",
  },
  {
    q: "Mes photos sont-elles stockées ?",
    a: "Tes photos et tes créations sont sauvegardées dans ton dashboard personnel et accessibles uniquement par toi. Tu peux les télécharger ou les supprimer à tout moment.",
  },
  {
    q: "La qualité du rendu est vraiment bonne ?",
    a: "On utilise une IA de pointe spécialisée en design d'intérieur pour des rendus photoréalistes en haute qualité. Le résultat ressemble à une vraie photo après rénovation, pas à un rendu 3D basique.",
  },
  {
    q: "Combien de temps prend la génération ?",
    a: "La génération prend entre 20 et 40 secondes selon la complexité de ta pièce et le style choisi. Un peu de patience — le résultat vaut l'attente ✨",
  },
  {
    q: "Est-ce que je peux choisir un style précis ?",
    a: "Oui. Tu as accès à 18 styles différents — moderne, scandinave, cosy, industriel, tropical, japonais, luxe et bien d'autres. Tu peux aussi décrire librement ce que tu veux changer ou laisser l'IA choisir le meilleur style pour toi.",
  },
  {
    q: "Est-ce que la structure de ma pièce change ?",
    a: "Non, jamais. L'IA conserve exactement les dimensions, les murs, les fenêtres et les portes de ta pièce. Seuls les meubles, la décoration, les couleurs et les matériaux changent.",
  },
  {
    q: "Comment fonctionne le remboursement ?",
    a: "Si dans les 7 jours tu n'es pas satisfait de tes rendus, on te rembourse intégralement sans question et sans délai. Contacte-nous à renoveia.support@gmail.com",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.q}
            className="bg-white rounded-xl overflow-hidden"
            style={{ borderRadius: 12 }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between text-left font-medium p-4 gap-3"
            >
              <span>{faq.q}</span>
              <span
                className="text-accent text-xl font-bold flex-shrink-0 transition-transform duration-300"
                aria-hidden
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
            >
              <p className="px-4 pb-4 text-muted text-sm leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
