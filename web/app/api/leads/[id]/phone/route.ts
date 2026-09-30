import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";

// Returns null on a Google error, and { phone: null } when there is simply no match
async function lookupPlace(name: string) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.displayName,places.nationalPhoneNumber,places.websiteUri",
      },
      body: JSON.stringify({ textQuery: `${name} Columbus OH`, maxResultCount: 1 }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const p = data.places?.[0];
    return { phone: p?.nationalPhoneNumber ?? null, website: p?.websiteUri ?? null };
  } catch {
    return null;
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // The database checks: subscription, claimed first, monthly phone limit
  const { error } = await supabase.rpc("reveal_phone", { p_permit: id });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: cached } = await admin
    .from("lead_contacts")
    .select("phones, website")
    .eq("permit_number", id)
    .maybeSingle();
  if (cached) {
    return NextResponse.json({ phone: cached.phones?.[0] ?? null, website: cached.website ?? null });
  }

  const { data: permit } = await admin
    .from("permits")
    .select("contractor_name")
    .eq("permit_number", id)
    .single();
  if (!permit?.contractor_name) {
    return NextResponse.json({ phone: null, website: null });
  }

  const found = await lookupPlace(permit.contractor_name);
  if (!found) {
    // Google failed: give the view back so the user isn't charged
    await admin.from("lead_phone_views").delete().eq("user_id", user.id).eq("permit_number", id);
    return NextResponse.json({ error: "Lookup failed, try again" }, { status: 502 });
  }

  await admin.from("lead_contacts").insert({
    permit_number: id,
    name: permit.contractor_name,
    phones: found.phone ? [found.phone] : [],
    emails: [],
    website: found.website,
    fetched_at: new Date().toISOString(),
  });
  return NextResponse.json(found);
}
