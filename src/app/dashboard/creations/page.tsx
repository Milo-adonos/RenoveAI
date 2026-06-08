"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getGeneration, clearGeneration } from "@/lib/session";
import type { Generation } from "@/types/database";
import { getStyleLabel } from "@/lib/styles";
import { useDashboard } from "@/contexts/DashboardContext";
import { isBypassAuthEnabled } from "@/lib/dev-bypass";
import { addDevCreation, getDevCreations } from "@/lib/dev-creations";

function useAspectRatio(url: string): number {
  const [ratio, setRatio] = useState(4 / 3);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setRatio(img.naturalWidth / img.naturalHeight);
    img.onerror = () => setRatio(4 / 3);
    img.src = url;
  }, [url]);

  return ratio;
}

function CreationCard({
  gen,
  onViewOriginal,
}: {
  gen: Generation;
  onViewOriginal: (url: string) => void;
}) {
  const aspectRatio = useAspectRatio(gen.original_image_url);
  const dateStr = new Date(gen.created_at).toLocaleDateString("fr-FR");
  const styleSlug = (gen.style || "rendu").toLowerCase().replace(/\s+/g, "-");

  async function downloadImage() {
    const res = await fetch(gen.generated_image_url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `renoveai-${styleSlug}-${dateStr.replace(/\//g, "-")}.jpg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="card p-0 overflow-hidden flex flex-col">
      <div className="relative w-full" style={{ aspectRatio }}>
        <Image
          src={gen.generated_image_url}
          alt={gen.style || "Création"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-2 bg-gradient-to-t from-black/50 to-transparent">
          <span className="text-white/90 text-xs">{dateStr}</span>
          {gen.style && (
            <span className="bg-accent text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {getStyleLabel(gen.style)}
            </span>
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={downloadImage}
          className="w-full bg-accent hover:bg-accent-hover text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
        >
          ⬇ Télécharger
        </button>
        <button
          type="button"
          onClick={() => onViewOriginal(gen.original_image_url)}
          className="w-full border border-accent text-accent font-medium text-sm py-2.5 rounded-xl hover:bg-accent/5 transition-colors"
        >
          Voir l&apos;original
        </button>
      </div>
    </div>
  );
}

function PendingCard({ aspectRatio }: { aspectRatio: number }) {
  return (
    <div className="card p-0 overflow-hidden animate-pulse">
      <div
        className="w-full bg-accent/10 flex items-center justify-center"
        style={{ aspectRatio }}
      >
        <p className="text-accent font-medium text-sm px-4 text-center">
          En cours de génération...
        </p>
      </div>
    </div>
  );
}

export default function CreationsPage() {
  const { pendingGeneration, refreshCreations } = useDashboard();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOriginal, setViewOriginal] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (isBypassAuthEnabled()) {
        const session = getGeneration();
        if (session?.generatedUrl && session?.originalUrl) {
          addDevCreation({
            original_image_url: session.originalUrl,
            generated_image_url: session.generatedUrl,
            style: session.style || null,
            custom_prompt: session.customPrompt || null,
          });
          clearGeneration();
        }
        setGenerations(getDevCreations());
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

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
  }, [refreshCreations]);

  if (loading) {
    return <div className="animate-pulse text-muted">Chargement...</div>;
  }

  const hasContent = generations.length > 0 || pendingGeneration;

  return (
    <div>
      <h1 className="font-hero text-2xl font-bold mb-6">Mes créations</h1>

      {!hasContent ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
            <span className="text-3xl text-accent">✦</span>
          </div>
          <p className="text-muted mb-6">Aucune création pour l&apos;instant</p>
          <Link href="/dashboard/new" className="btn-primary max-w-xs mx-auto">
            Créer ma première pièce →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingGeneration && (
            <PendingCard aspectRatio={pendingGeneration.aspectRatio} />
          )}
          {generations.map((gen) => (
            <CreationCard
              key={gen.id}
              gen={gen}
              onViewOriginal={setViewOriginal}
            />
          ))}
        </div>
      )}

      {viewOriginal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
          onClick={() => setViewOriginal(null)}
          role="presentation"
        >
          <button
            type="button"
            onClick={() => setViewOriginal(null)}
            className="absolute top-4 right-4 z-10 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X size={28} strokeWidth={2} />
          </button>
          <div
            className="relative w-full max-w-4xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={viewOriginal}
              alt="Original"
              width={1600}
              height={1200}
              className="w-full h-auto max-h-[90vh] object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
