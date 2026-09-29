import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("WEBHOOK SIGNATURE ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    console.log("WEBHOOK EVENT:", event.type);

    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.client_reference_id ?? s.metadata?.user_id;
      const vertical = s.metadata?.vertical_id;
      console.log("SESSION:", { userId, vertical, sub: s.subscription });
      if (!userId || !vertical) throw new Error("Missing user_id or vertical in session");

      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          vertical_id: vertical,
          stripe_customer_id: s.customer as string,
          stripe_subscription_id: s.subscription as string,
          status: "active",
        },
        { onConflict: "user_id,vertical_id" }
      );
      if (error) throw error;
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: sub.status })
        .eq("stripe_subscription_id", sub.id);
      if (error) throw error;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("WEBHOOK HANDLER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
