import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { activateSubscriptionFromSession } from "@/lib/activate-subscription";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.supabase_user_id !== user.id) {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }

    const activated = await activateSubscriptionFromSession(session);
    if (!activated) {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }

    const response = NextResponse.redirect(
      new URL("/dashboard/creations?success=true", request.url)
    );
    response.cookies.set("selectedPlan", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("Stripe success handler error:", error);
    return NextResponse.redirect(new URL("/pricing", request.url));
  }
}
