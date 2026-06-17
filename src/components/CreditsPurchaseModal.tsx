"use client";

type CreditsPurchaseModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (plan: "credits_5" | "credits_15") => void;
  loading: boolean;
};

export function CreditsPurchaseModal({
  open,
  onClose,
  onSelectPlan,
  loading,
}: CreditsPurchaseModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-hero text-xl font-bold text-[#1A1A1A] mb-5 text-center">
          Racheter des crédits
        </h2>

        <div className="space-y-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => onSelectPlan("credits_5")}
            className="w-full font-bold transition-colors disabled:opacity-50"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "16px",
              color: "#A0522D",
              backgroundColor: "transparent",
              border: "2px solid #A0522D",
              borderRadius: "50px",
              padding: "16px",
            }}
          >
            5 crédits — 2,90€
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => onSelectPlan("credits_15")}
            className="pricing-glow-cta w-full text-white font-bold transition-colors disabled:opacity-50"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "16px",
              backgroundColor: "#A0522D",
              borderRadius: "50px",
              padding: "16px",
            }}
          >
            15 crédits — 6,90€
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 text-sm text-[#8B7D6B]"
          style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
