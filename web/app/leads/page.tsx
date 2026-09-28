import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import LeadsView from "./LeadsView";

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: leads } = await admin
    .from("permits")
    .select("permit_number, address, zip, description, valuation, issued_date")
    .eq("vertical_id", "commercial")
    .order("issued_date", { ascending: false })
    .limit(50);

  return <LeadsView leads={leads ?? []} />;
}
