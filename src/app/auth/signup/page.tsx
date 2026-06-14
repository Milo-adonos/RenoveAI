"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCheckoutSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";

function getSelectedPlanFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )selectedPlan=([^;]*)/);
  const plan = match?.[1];
  if (plan === "weekly" || plan === "monthly") return plan;
  return null;
}

function getStripeCheckoutUrl(plan: string): string {
  return `/api/stripe/checkout?plan=${plan}`;
}

function getPostSignupRedirect(): string {
  if (getCheckoutSession()) {
    const selectedPlan = localStorage.getItem("selectedPlan") || "monthly";
    return getStripeCheckoutUrl(selectedPlan);
  }
  return "/upload";
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function redirectIfAlreadySignedIn() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const plan = getSelectedPlanFromCookie();
        if (plan) {
          window.location.href = getStripeCheckoutUrl(plan);
          return;
        }
      }

      setCheckingSession(false);
    }

    redirectIfAlreadySignedIn();
  }, []);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    window.location.href = getPostSignupRedirect();
  }

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p
          className="text-muted"
          style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
        >
          Chargement...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="max-w-[390px] mx-auto w-full">
        <p className="font-hero text-[20px] font-bold text-[#A0522D] text-center">
          Renove AI
        </p>

        <h1
          className="font-hero font-bold text-[#1A1A1A] text-center mt-8 mb-2"
          style={{ fontSize: "24px" }}
        >
          Crée ton compte pour voir le résultat
        </h1>
        <p
          className="text-center mb-8"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "13px",
            color: "#8B7D6B",
          }}
        >
          Gratuit — aucune carte requise pour commencer
        </p>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full bg-card border border-muted/30 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 font-medium shadow-soft hover:shadow-card transition-shadow"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "14px",
          }}
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google →
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-muted/30" />
          <span
            className="text-muted"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "13px",
            }}
          >
            ou
          </span>
          <div className="flex-1 h-px bg-muted/30" />
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <input
            type="email"
            placeholder="ton@email.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full card border border-muted/20 p-4 focus:outline-none focus:ring-2 focus:ring-accent/30"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "14px",
            }}
          />
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full card border border-muted/20 p-4 focus:outline-none focus:ring-2 focus:ring-accent/30"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "14px",
            }}
          />

          {error && (
            <p
              className="text-red-600 text-sm text-center"
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            {loading ? "Chargement..." : "Continuer →"}
          </button>
        </form>

        <p
          className="text-center mt-6"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "13px",
            color: "#8B7D6B",
          }}
        >
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-accent font-medium">
            Me connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
