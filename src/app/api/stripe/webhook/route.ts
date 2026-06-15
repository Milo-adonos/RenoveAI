import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaymentFailed,
  handleInvoicePaymentSucceeded,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from "@/lib/stripe-webhook-handlers";

export const dynamic = "force-dynamic";

/**
 * Endpoint: POST /api/stripe/webhook
 *
 * Événements à activer dans Stripe Dashboard → Webhooks :
 * - checkout.session.completed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      try {
        await handleCheckoutSessionCompleted(
          supabase,
          event.data.object as Stripe.Checkout.Session
        );
      } catch (error) {
        console.error("[webhook] checkout.session.completed error:", error);
      }
      break;
    }

    case "customer.subscription.updated": {
      try {
        await handleSubscriptionUpdated(
          supabase,
          event.data.object as Stripe.Subscription
        );
      } catch (error) {
        console.error("[webhook] customer.subscription.updated error:", error);
      }
      break;
    }

    case "customer.subscription.deleted": {
      try {
        await handleSubscriptionDeleted(
          supabase,
          event.data.object as Stripe.Subscription
        );
      } catch (error) {
        console.error("[webhook] customer.subscription.deleted error:", error);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      try {
        await handleInvoicePaymentSucceeded(
          supabase,
          event.data.object as Stripe.Invoice
        );
      } catch (error) {
        console.error("[webhook] invoice.payment_succeeded error:", error);
      }
      break;
    }

    case "invoice.payment_failed": {
      try {
        await handleInvoicePaymentFailed(
          supabase,
          event.data.object as Stripe.Invoice
        );
      } catch (error) {
        console.error("[webhook] invoice.payment_failed error:", error);
      }
      break;
    }

    default:
      console.log(`[webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
