"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const OWNER_ACCESS_CODE = "Tuterenoveliamichou?2617!";

export function OwnerAccess() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function openModal() {
    setCode("");
    setError(false);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setCode("");
    setError(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code === OWNER_ACCESS_CODE) {
      closeModal();
      router.push("/admin");
      return;
    }
    setError(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="mt-3 block w-full cursor-pointer border-0 bg-transparent p-0"
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: "10px",
          color: "#C4B8AC",
        }}
      >
        Propriétaire de Renove AI
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="relative w-full max-w-[340px] rounded-2xl bg-white p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="owner-access-title"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2
              id="owner-access-title"
              className="font-hero text-lg font-bold text-foreground text-center mb-5"
            >
              Accès propriétaire
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(false);
                }}
                placeholder="Code d'accès"
                autoComplete="off"
                className="w-full text-center border border-muted/30 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />

              {error && (
                <p className="text-center text-sm text-[#C0392B]">Code incorrect</p>
              )}

              <button type="submit" className="btn-primary">
                Entrer
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
