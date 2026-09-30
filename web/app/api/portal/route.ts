import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account found" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    if (!site) {
      return NextResponse.json({ error: "NEXT_PUBLIC_SITE_URL is not set" }, { status: 500 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${site}/leads`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("PORTAL ERROR:", err);
    return NextResponse.json({ error: err?.message ?? "Portal error" }, { status: 500 });
  }
}
