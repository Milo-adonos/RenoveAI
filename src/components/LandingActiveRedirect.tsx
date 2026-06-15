"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function LandingActiveRedirect() {
  useEffect(() => {
    async function redirectIfSubscribed() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.subscription_status === "active") {
        window.location.replace("/dashboard");
      }
    }

    redirectIfSubscribed();
  }, []);

  return null;
}
