"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { LiveCounter } from "@/components/LiveCounter";
import { getGeneration } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";

export default function PreviewPage() {
  const router = useRouter();
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const session = getGeneration();
      if (!session?.generatedUrl) {
        router.push("/upload");
        return;
      }
      setGeneratedUrl(session.generatedUrl);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", user.id)
          .single();

        if (
          profile &&
          ["active", "trialing"].includes(profile.subscription_status)
        ) {
          setIsSubscribed(true);
          router.push("/dashboard");
          return;
        }
      }

      setLoading(false);
    }

    check();
  }, [router]);

  if (loading || !generatedUrl) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">Chargement...</div>
      </main>
    );
  }

  if (isSubscribed) return null;

  return (
    <main className="min-h-screen pb-12">
      <Header />

      <div className="px-4 max-w-lg mx-auto">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card">
          <Image
            src={generatedUrl}
            alt="Rendu flouté"
            fill
            className="object-cover blur-[20px] scale-105"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white/90 text-foreground font-semibold px-4 py-2 rounded-2xl shadow">
              🔒 Débloque ton rendu
            </span>
          </div>
        </div>

        <p className="text-center mt-6 text-muted">
          Ta pièce a été redesignée — débloque le rendu HD pour le voir et le
          télécharger
        </p>

        <div className="flex justify-center mt-4">
          <LiveCounter />
        </div>

        <Link href="/pricing" className="btn-primary mt-8 inline-block">
          Débloquer mon rendu →
        </Link>

        <p className="text-xs text-muted text-center mt-3">
          Essai gratuit 3 jours — puis 4,99€/semaine ou 9,99€/mois — Annulable à
          tout moment
        </p>
      </div>
    </main>
  );
}
