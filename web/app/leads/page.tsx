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

  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .eq("vertical_id", "commercial")
    .in("status", ["active", "trialing"])
    .maybeSingle();
  const plan = sub?.plan ?? "basic";

  const { data: vert } = await admin
    .from("verticals")
    .select("config")
    .eq("id", "commercial")
    .single();
  const delayHours = Number(vert?.config?.plans?.[plan]?.delay_hours ?? 0);
  const cutoff = new Date(Date.now() - delayHours * 3600 * 1000).toISOString();

  const { data: leads } = await admin
    .from("permits")
    .select("permit_number, address, zip, description, valuation, issued_date")
    .eq("vertical_id", "commercial")
    .lte("ingested_at", cutoff)
    .order("issued_date", { ascending: false })
    .limit(50);

  return <LeadsView leads={leads ?? []} />;
}
