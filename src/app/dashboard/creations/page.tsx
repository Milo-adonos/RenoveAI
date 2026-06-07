"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getGeneration, clearGeneration } from "@/lib/session";
import type { Generation } from "@/types/database";
import { getStyleLabel } from "@/lib/styles";

export default function CreationsPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOriginal, setViewOriginal] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Save pending generation from session after payment
      const session = getGeneration();
      if (session?.generatedUrl && session?.originalUrl) {
        await fetch("/api/generations/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalUrl: session.originalUrl,
            generatedUrl: session.generatedUrl,
            style: session.style,
            customPrompt: session.customPrompt,
            originalPath: session.originalPath,
          }),
        });
        clearGeneration();
      }

      const { data } = await supabase
        .from("generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setGenerations(data || []);
      setLoading(false);
    }

    load();
  }, []);

  async function downloadImage(url: string, filename: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (loading) {
    return <div className="animate-pulse text-muted">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Mes créations</h1>
        <Link href="/upload" className="btn-primary !w-auto px-6 py-3 hidden md:inline-block">
          + Nouvelle création
        </Link>
      </div>

      {generations.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl mb-4 block">🖼️</span>
          <p className="text-muted mb-6">
            Aucune création pour l&apos;instant — commence maintenant !
          </p>
          <Link href="/upload" className="btn-primary max-w-xs mx-auto">
            + Nouvelle création
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {generations.map((gen) => (
            <div key={gen.id} className="card p-3">
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                <Image
                  src={gen.generated_image_url}
                  alt={gen.style || "Création"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <p className="text-xs text-muted">
                {new Date(gen.created_at).toLocaleDateString("fr-FR")}
              </p>
              {gen.style && (
                <p className="text-sm font-medium truncate">
                  {getStyleLabel(gen.style)}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() =>
                    downloadImage(gen.generated_image_url, `renove-${gen.id}.jpg`)
                  }
                  className="flex-1 text-xs bg-accent/10 text-accent py-2 rounded-xl"
                >
                  ⬇️ Télécharger
                </button>
                <button
                  onClick={() => setViewOriginal(gen.original_image_url)}
                  className="flex-1 text-xs bg-background text-muted py-2 rounded-xl"
                >
                  👁️ Original
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewOriginal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setViewOriginal(null)}
        >
          <div className="relative max-w-2xl w-full aspect-video">
            <Image
              src={viewOriginal}
              alt="Original"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
