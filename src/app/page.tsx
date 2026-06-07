import Link from "next/link";
import { Header } from "@/components/Header";
import { LiveCounter } from "@/components/LiveCounter";
import { BeforeAfterCarousel } from "@/components/BeforeAfterCarousel";
import { FAQ } from "@/components/FAQ";
import { SupportContact } from "@/components/SupportContact";
import { beforeAfterExamples } from "@/lib/styles";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header landing />

      {/* Hero */}
      <section className="px-5 pt-4 pb-0 max-w-2xl mx-auto text-center">
        <div className="mb-5">
          <LiveCounter />
        </div>
        <h1 className="font-hero text-[36px] sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-5 text-foreground">
          Ta pièce mérite
          <br />
          <span className="text-accent relative inline-block">
            mieux
            <svg
              className="absolute -bottom-1 left-0 w-full h-3 text-accent"
              viewBox="0 0 120 12"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M2 8C20 2 40 10 60 6C80 2 100 10 118 4"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            {" "}que ça.
          </span>
        </h1>
        <p className="text-muted text-base sm:text-lg mb-8 leading-relaxed px-1">
          Prends une photo, choisis un style et l&apos;IA redesigne ta pièce en
          30 secondes.
        </p>
        <Link href="/upload" className="btn-primary block w-full">
          Rénover ma pièce →
        </Link>
      </section>

      {/* Before/After */}
      <section className="px-5 pt-6 pb-10 max-w-lg mx-auto w-full">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-center mb-6">
          Avant / Après
        </h2>
        <BeforeAfterCarousel examples={beforeAfterExamples} />
      </section>

      {/* How it works */}
      <section className="px-5 py-10 max-w-2xl mx-auto w-full">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-center mb-6">
          Prêt en 30 secondes
        </h2>
        <div className="space-y-4">
          {[
            {
              n: 1,
              icon: "📸",
              title: "Upload ta photo",
              desc: "Prends ta pièce en photo, plus c'est net, plus le résultat est bluffant",
            },
            {
              n: 2,
              icon: "🎨",
              title: "Choisis ton style",
              desc: "Défile parmi nos styles ou décris ce que tu veux changer",
            },
            {
              n: 3,
              icon: "⚡",
              title: "L'IA génère",
              desc: "En quelques secondes, ta pièce est transformée",
            },
            {
              n: 4,
              icon: "⬇️",
              title: "Télécharge",
              desc: (
                <>
                  Sauvegarde ton rendu{" "}
                  <span className="whitespace-nowrap">en HD et partage-le</span>
                </>
              ),
            },
          ].map((step) => (
            <div key={step.n} className="card flex gap-4 items-start p-5">
              <span className="text-2xl flex-shrink-0">{step.icon}</span>
              <div className="min-w-0">
                <h3 className="font-semibold text-base">
                  {step.n}. {step.title}
                </h3>
                <p className="text-muted text-sm mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-5 py-10 max-w-2xl mx-auto w-full">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-center mb-6">
          Tarifs
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card border-2 border-accent relative">
            <span className="absolute -top-3 left-4 bg-accent text-white text-xs px-3 py-1 rounded-full">
              LE PLUS POPULAIRE
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-muted line-through text-lg">9,99€</span>
              <span className="text-3xl font-bold text-accent">4,99€</span>
              <span className="text-muted text-sm">/semaine</span>
            </div>
            <p className="text-sm text-muted mt-4">
              🛡️ Satisfait ou remboursé 7 jours
            </p>
          </div>
          <div className="card border border-muted/20">
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-accent">9,99€</span>
              <span className="text-muted text-sm">/mois</span>
            </div>
            <p className="text-sm text-muted mt-4">
              🛡️ Satisfait ou remboursé 7 jours
            </p>
          </div>
        </div>
        <Link href="/upload" className="btn-primary block w-full mt-6">
          Commencer maintenant →
        </Link>
      </section>

      {/* FAQ */}
      <section className="px-5 py-10 max-w-2xl mx-auto w-full">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-center mb-6">
          FAQ
        </h2>
        <FAQ />
      </section>

      {/* Final CTA */}
      <section className="px-5 py-14 max-w-2xl mx-auto text-center w-full">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6">
          Alors, on rénove ?
        </h2>
        <Link href="/upload" className="btn-primary block w-full">
          Rénover ma pièce →
        </Link>
        <div className="mt-8">
          <SupportContact />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 border-t border-muted/20 text-center text-sm text-muted">
        <p className="font-display text-accent font-bold text-lg mb-4">
          Renove AI
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <span>Mentions légales</span>
          <span>CGU</span>
          <span>Confidentialité</span>
          <span>Contact</span>
        </div>
        <p className="mt-4">© 2026 Renove AI — renoveai.com</p>
      </footer>
    </main>
  );
}
