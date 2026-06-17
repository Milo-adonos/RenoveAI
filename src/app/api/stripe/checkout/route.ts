import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  getAppUrl,
  getCheckoutConfig,
  parseCheckoutPlan,
  stripe,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";

async function createCheckoutSession(
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
  planParam: string,
  origin: string
) {
  const plan = parseCheckoutPlan(planParam);
  if (!plan) {
    throw new Error(`Invalid plan: ${planParam}`);
  }

  const config = getCheckoutConfig(plan);
  if (!config?.priceId) {
    throw new Error(`Missing Stripe price for plan: ${plan}`);
  }

  const serviceClient = await createServiceClient();

  let { data: profile } = await serviceClient
    .from("profiles")
    .select("stripe_customer_id, subscription_plan")
    .eq("id", user.id)
    .single();

  if (!profile) {
    await serviceClient.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name:
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        null,
      avatar_url: (user.user_metadata?.avatar_url as string) || null,
    });
    const { data } = await serviceClient
      .from("profiles")
      .select("stripe_customer_id, subscription_plan")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  if (
    (plan === "credits_5" || plan === "credits_15") &&
    profile?.subscription_plan !== "pro"
  ) {
    throw new Error("Credit packs require an active Pro subscription");
  }

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await serviceClient
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const baseUrl = getAppUrl() || origin;
  const metadata = {
    plan,
    userId: user.id,
    supabase_user_id: user.id,
  };

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: config.mode,
    payment_method_types: ["card"],
    line_items: [{ price: config.priceId, quantity: 1 }],
    metadata,
    success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    allow_promotion_codes: true,
    locale: "fr",
  };

  if (config.mode === "subscription") {
    sessionParams.subscription_data = { metadata };
  }

  return stripe.checkout.sessions.create(sessionParams);
}

export async function GET(request: NextRequest) {
  const plan = request.nextUrl.searchParams.get("plan") || "discovery";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth/signup", request.url));
    }

    const stripeSession = await createCheckoutSession(
      user,
      plan,
      request.nextUrl.origin
    );

    if (!stripeSession.url) {
      throw new Error("Stripe session URL missing");
    }

    return NextResponse.redirect(stripeSession.url);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.redirect(new URL("/pricing", request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const plan = body?.plan as string;

    const stripeSession = await createCheckoutSession(
      user,
      plan,
      request.nextUrl.origin
    );

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Checkout POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 400 }
    );
  }
}
