"use client";

import { useEffect } from "react";
import { getCheckoutSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";

export default function GoToStripe() {
  useEffect(() => {
    async function redirectAfterAuth() {
      const checkout = getCheckoutSession();

      if (checkout) {
        const plan = localStorage.getItem("selectedPlan") || "discovery";
        window.location.href = `/api/stripe/checkout?plan=${plan}`;
        return;
      }

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

        if (profile?.subscription_status === "active") {
          window.location.href = "/dashboard";
          return;
        }
      }

      window.location.href = "/upload";
    }

    redirectAfterAuth();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-muted">Redirection en cours...</p>
    </main>
  );
}
