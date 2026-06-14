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
        Vous êtes le propriétaire du site ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="relative w-full max-w-[320px] rounded-2xl bg-white p-7 shadow-card"
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
              className="font-hero text-[20px] font-bold text-[#1A1A1A] text-center"
            >
              Accès propriétaire
            </h2>
            <p
              className="text-center mt-1 mb-6"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "12px",
                color: "#8B7D6B",
              }}
            >
              Renove AI
            </p>

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
                className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                style={{ border: "1px solid #E8E0D8" }}
              />

              {error && (
                <p className="text-center text-sm text-[#C62828]">Code incorrect</p>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#A0522D] hover:bg-accent-hover text-white font-semibold py-3 px-6 transition-colors text-center"
              >
                Entrer →
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
