import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";

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

  const { error } = await supabase.rpc("claim_lead", { p_permit: id });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: permit } = await admin
    .from("permits")
    .select("address, contractor_name")
    .eq("permit_number", id)
    .single();
  if (!permit) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({
    contact: { name: permit.contractor_name },
    address: permit.address,
  });
}
