import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const plan = searchParams.get("plan") || "monthly";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        full_name:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name,
        avatar_url: data.user.user_metadata?.avatar_url,
      });

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", data.user.id)
        .single();

      if (profile?.subscription_status === "active") {
        return NextResponse.redirect(`${origin}/dashboard`);
      }

      return NextResponse.redirect(
        `${origin}/api/stripe/checkout?plan=${plan}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
