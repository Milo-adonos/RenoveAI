import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { activateSubscriptionFromSession } from "@/lib/activate-subscription";
import { stripe } from "@/lib/stripe";

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
    const sessionUserId =
      session.metadata?.userId || session.metadata?.supabase_user_id;

    if (sessionUserId !== user.id) {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }

    await activateSubscriptionFromSession(session);

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
