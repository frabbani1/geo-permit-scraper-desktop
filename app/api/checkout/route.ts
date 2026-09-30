import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { vertical_id, plan = "basic" } = await req.json();

  const { data: existing } = await admin
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("vertical_id", vertical_id)
    .in("status", ["active", "trialing"])
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "You already have a subscription. Use Manage billing to change plan." },
      { status: 400 }
    );
  }

  const { data: v } = await admin
    .from("verticals")
    .select("stripe_price_id, config")
    .eq("id", vertical_id)
    .single();
  const price = v?.config?.plans?.[plan]?.stripe_price_id ?? (plan === "basic" ? v?.stripe_price_id : null);
  if (!price) {
    return NextResponse.json({ error: "No price set for this plan" }, { status: 400 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer_email: user.email!,
    client_reference_id: user.id,
    metadata: { user_id: user.id, vertical_id, plan },
    subscription_data: { metadata: { user_id: user.id, vertical_id, plan } },
    success_url: `${site}/leads`,
    cancel_url: `${site}/pricing`,
  });
  return NextResponse.json({ url: session.url });
}
