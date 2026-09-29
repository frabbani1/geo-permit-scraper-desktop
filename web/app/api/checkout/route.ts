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

  const { vertical_id } = await req.json();
  const { data: v } = await admin
    .from("verticals")
    .select("stripe_price_id")
    .eq("id", vertical_id)
    .single();
  if (!v?.stripe_price_id) {
    return NextResponse.json({ error: "No price set" }, { status: 400 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: v.stripe_price_id, quantity: 1 }],
    customer_email: user.email!,
    client_reference_id: user.id,
    metadata: { user_id: user.id, vertical_id },
    subscription_data: { metadata: { user_id: user.id, vertical_id } },
    success_url: `${site}/leads`,
    cancel_url: `${site}/pricing`,
  });
  return NextResponse.json({ url: session.url });
}
