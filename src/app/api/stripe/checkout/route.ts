import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { stripe, getPriceId } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const plan = (request.nextUrl.searchParams.get("plan") || "monthly") as
    | "weekly"
    | "monthly";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth/signup", request.url));
    }

    const serviceClient = await createServiceClient();

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

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

    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: getPriceId(plan), quantity: 1 }],
      subscription_data: {
        metadata: { plan, supabase_user_id: user.id },
      },
      metadata: { plan, supabase_user_id: user.id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      allow_promotion_codes: true,
      locale: "fr",
    });

    if (!stripeSession.url) {
      throw new Error("Stripe session URL missing");
    }

    return NextResponse.redirect(stripeSession.url);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.redirect(new URL("/pricing", request.url));
  }
}
