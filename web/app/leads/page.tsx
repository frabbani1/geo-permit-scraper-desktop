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
  const planCfg = vert?.config?.plans?.[plan];
  const delayHours = Number(planCfg?.delay_hours ?? 0);
  const filters: string[] = planCfg?.filters ?? ["zip"];
  const phoneLimit = Number(planCfg?.monthly_claim_limit ?? vert?.config?.monthly_claim_limit ?? 50);
  const maxClaims = Number(vert?.config?.max_claims_per_lead ?? 1);
  const cutoff = new Date(Date.now() - delayHours * 3600 * 1000).toISOString();

  const { data: mineRows } = await admin
    .from("lead_claims")
    .select("permit_number")
    .eq("user_id", user.id);
  const claimedIds = (mineRows ?? []).map((c) => c.permit_number as string);
  const claimedSet = new Set(claimedIds);

  const { data: viewRows } = await admin
    .from("lead_phone_views")
    .select("permit_number, viewed_at")
    .eq("user_id", user.id);
  const viewedSet = new Set((viewRows ?? []).map((r) => r.permit_number as string));
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const phoneUsed = (viewRows ?? []).filter((r) => new Date(r.viewed_at) >= monthStart).length;

  const { data: pool } = await admin
    .from("permits")
    .select("permit_number, zip, description, valuation, issued_date, claim_count")
    .eq("vertical_id", "commercial")
    .lte("ingested_at", cutoff)
    .order("issued_date", { ascending: false })
    .limit(claimedIds.length + 200);

  const available = (pool ?? [])
    .filter((p) => !claimedSet.has(p.permit_number) && (p.claim_count ?? 0) < maxClaims)
    .slice(0, 200)
    .map((p) => ({
      permit_number: p.permit_number,
      zip: p.zip,
      description: p.description,
      valuation: p.valuation,
      issued_date: p.issued_date,
    }));

  let mine: any[] = [];
  if (claimedIds.length > 0) {
    const { data } = await admin
      .from("permits")
      .select("permit_number, address, zip, description, valuation, issued_date, contractor_name")
      .in("permit_number", claimedIds)
      .order("issued_date", { ascending: false });

    const viewedIds = claimedIds.filter((x) => viewedSet.has(x));
    const { data: cons } = viewedIds.length
      ? await admin
          .from("lead_contacts")
          .select("permit_number, phones, website")
          .in("permit_number", viewedIds)
      : { data: [] as any[] };
    const byId = new Map((cons ?? []).map((c: any) => [c.permit_number, c]));

    mine = (data ?? []).map((m) => {
      const revealed = viewedSet.has(m.permit_number);
      const c: any = byId.get(m.permit_number);
      return {
        ...m,
        revealed,
        phone: revealed ? c?.phones?.[0] ?? null : null,
        website: revealed ? c?.website ?? null : null,
      };
    });
  }

  return (
    <LeadsView
      available={available}
      mine={mine}
      plan={plan}
      filters={filters}
      phoneUsed={phoneUsed}
      phoneLimit={phoneLimit}
    />
  );
}
