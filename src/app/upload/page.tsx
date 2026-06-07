"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/Header";
import { StyleCarousel } from "@/components/StyleCarousel";
import { AI_CHOICE_STYLE } from "@/lib/styles";
import { saveGeneration } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFile(f: File) {
    if (f.size > 10 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 10 Mo)");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function getImageDimensions(
    f: File
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(f);
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        resolve({ width: 4, height: 3 });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  }

  async function handleGenerate() {
    if (!file) {
      setError("Ajoute une photo d'abord");
      return;
    }
    if (!selectedStyle && !customPrompt.trim()) {
      setError("Choisis un style ou décris ce que tu veux");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { width, height } = await getImageDimensions(file);
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `temp/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("originals")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.warn(
          "[upload] Supabase storage échoué, fallback base64:",
          uploadError.message
        );
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        saveGeneration({
          originalUrl: dataUrl,
          originalWidth: width,
          originalHeight: height,
          style: selectedStyle || undefined,
          customPrompt: customPrompt.trim() || undefined,
          timestamp: Date.now(),
        });
        router.push("/loading");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("originals")
        .getPublicUrl(path);

      console.log("[upload] Upload Supabase OK:", urlData.publicUrl);

      saveGeneration({
        originalUrl: urlData.publicUrl,
        originalPath: path,
        originalWidth: width,
        originalHeight: height,
        style: selectedStyle || undefined,
        customPrompt: customPrompt.trim() || undefined,
        timestamp: Date.now(),
      });

      router.push("/loading");
    } catch {
      setError("Erreur lors de l'upload. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen pb-12">
      <Header showLogin={false} />

      <div className="px-4 max-w-lg mx-auto">
        <h1 className="font-display text-3xl font-bold text-center mb-2">
          Upload ta photo
        </h1>
        <p className="text-muted text-center mb-8">
          Plus elle est nette, plus le résultat sera bluffant
        </p>

        {/* Upload zone */}
        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="card border-2 border-dashed border-muted/40 cursor-pointer hover:border-accent/50 transition-colors py-16 text-center"
          >
            <span className="text-4xl mb-4 block">📷</span>
            <p className="font-medium">Glisse ta photo ici ou clique pour choisir</p>
            <p className="text-xs text-muted mt-2">JPG, PNG, WEBP — Max 10 Mo</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="card relative aspect-video">
            <Image src={preview} alt="Preview" fill className="object-cover rounded-2xl" />
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="absolute top-3 right-3 bg-white/90 text-sm px-3 py-1 rounded-xl shadow"
            >
              Changer
            </button>
          </div>
        )}

        {/* Style selection */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4">Choisis un style</h2>
          <StyleCarousel
            selected={selectedStyle}
            onSelect={(s) => {
              setSelectedStyle((prev) => (prev === s ? null : s));
              setCustomPrompt("");
            }}
          />
        </div>

        {/* Custom prompt — masqué si "Laisse l'IA décider" */}
        {selectedStyle !== AI_CHOICE_STYLE && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold mb-4">
              Ou décris ce que tu veux
            </h2>
            <textarea
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
                if (e.target.value) setSelectedStyle(null);
              }}
              placeholder="Ex : Ajoute un bureau blanc avec une lampe, change la couleur des murs en vert sauge..."
              className="w-full card border border-muted/20 p-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <p className="text-xs text-muted mt-2">
              💡 Sois précis : couleur, style, mobilier pour un meilleur résultat
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm text-center mt-4">{error}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary mt-8 disabled:opacity-50"
        >
          {loading ? "Upload en cours..." : "Générer mon rendu →"}
        </button>
      </div>
    </main>
  );
}
