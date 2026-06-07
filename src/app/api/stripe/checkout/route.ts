import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe, getPriceId } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const plan = (request.nextUrl.searchParams.get("plan") || "weekly") as
      | "weekly"
      | "monthly";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/signup", request.url)
      );
    }

    const serviceClient = await createServiceClient();

    let { data: profile } = await serviceClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      await serviceClient.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });

      const { data } = await serviceClient
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();
      profile = data;
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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: getPriceId(plan),
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 3,
        metadata: { plan },
      },
      metadata: { plan, supabase_user_id: user.id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      allow_promotion_codes: true,
      locale: "fr",
    });

    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.redirect(new URL("/pricing", request.url));
  }
}
