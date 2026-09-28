import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Who is calling?
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // 2. Claim as the user (the database checks subscription + limits)
  const { error } = await supabase.rpc("claim_lead", { p_permit: id });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 3. Claim succeeded, so load the lead with the admin client
  const { data: permit } = await admin
    .from("permits")
    .select("permit_number, address, description, contractor_name, vertical_id")
    .eq("permit_number", id)
    .single();
  if (!permit) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const { data: vertical } = await admin
    .from("verticals")
    .select("config")
    .eq("id", permit.vertical_id)
    .single();

  // 4. Commercial: contact is the contractor on the permit
  if (!vertical?.config?.skip_trace) {
    return NextResponse.json({
      contact: { name: permit.contractor_name, phone: null, email: null },
      address: permit.address,
    });
  }

  // 5. Homeowner verticals: placeholder until skip-trace is added
  return NextResponse.json({
    contact: { name: null, phone: null, email: null },
    address: permit.address,
    note: "Homeowner lookup not built yet",
  });
}
