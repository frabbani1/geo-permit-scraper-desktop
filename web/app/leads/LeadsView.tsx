"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ManageBillingButton from "./ManageBillingButton";

type Lead = {
  permit_number: string;
  address?: string | null;
  zip: string | null;
  description: string | null;
  valuation: number | null;
  issued_date: string | null;
  contractor_name?: string | null;
};

export default function LeadsView({
  available,
  mine,
  plan,
  filters,
}: {
  available: Lead[];
  mine: Lead[];
  plan: string;
  filters: string[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"available" | "mine">("available");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [zip, setZip] = useState("");
  const [minValue, setMinValue] = useState("");
  const [keyword, setKeyword] = useState("");

  const has = (f: string) => filters.includes(f);
  const rows = tab === "available" ? available : mine;

  const shown = rows.filter((l) => {
    if (has("zip") && zip && !(l.zip ?? "").startsWith(zip.trim())) return false;
    if (has("min_value") && minValue && (l.valuation ?? 0) < Number(minValue)) return false;
    if (
      has("keyword") &&
      keyword &&
      !(l.description ?? "").toLowerCase().includes(keyword.trim().toLowerCase())
    )
      return false;
    return true;
  });

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, "\"\"")}"`;
    const withAddress = tab === "mine";
    const header = ["permit_number", "issued_date", "zip", "description", "valuation"];
    if (withAddress) header.push("address", "contact");
    const body = shown.map((l) => {
      const r: unknown[] = [l.permit_number, l.issued_date, l.zip, l.description, l.valuation];
      if (withAddress) r.push(l.address, l.contractor_name);
      return r;
    });
    const csv = [header, ...body].map((r) => r.map(esc).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = tab === "mine" ? "my-leads.csv" : "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function claim(id: string) {
    setBusy(id);
    const res = await fetch(`/api/leads/${encodeURIComponent(id)}/contact`, {
      method: "POST",
    });
    const data = await res.json();
    setBusy(null);
    if (res.ok) {
      setErrors((e) => {
        const { [id]: _removed, ...rest } = e;
        return rest;
      });
      setTab("mine");
      router.refresh();
    } else {
      setErrors((e) => ({ ...e, [id]: data.error ?? "Error" }));
    }
  }

  const tabClass = (t: string) =>
    `px-3 py-1 text-sm border ${tab === t ? "bg-white text-black" : ""}`;

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          Commercial leads <span className="text-sm font-normal opacity-60">({plan})</span>
        </h1>
        <div className="flex gap-2">
          <a href="/pricing" className="rounded-md bg-white px-3 py-1 text-black">
            Subscribe
          </a>
          <ManageBillingButton />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button className={tabClass("available")} onClick={() => setTab("available")}>
          Available ({available.length})
        </button>
        <button className={tabClass("mine")} onClick={() => setTab("mine")}>
          My leads ({mine.length})
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {has("zip") && (
          <input
            className="border bg-transparent px-2 py-1 text-sm"
            placeholder="Zip"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
        )}
        {has("min_value") && (
          <input
            className="border bg-transparent px-2 py-1 text-sm"
            placeholder="Min value ($)"
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
          />
        )}
        {has("keyword") && (
          <input
            className="border bg-transparent px-2 py-1 text-sm"
            placeholder="Keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        )}
        {has("export") && (
          <button className="border px-3 py-1 text-sm" onClick={exportCsv}>
            Export CSV
          </button>
        )}
        <span className="text-sm opacity-60">{shown.length} leads</span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Issued</th>
            <th className="p-2">{tab === "mine" ? "Address" : "Zip"}</th>
            <th className="p-2">Description</th>
            <th className="p-2">Value</th>
            <th className="p-2">{tab === "mine" ? "Contact" : ""}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((l) => (
            <tr key={l.permit_number} className="border-b align-top">
              <td className="p-2">{l.issued_date}</td>
              <td className="p-2">
                {tab === "mine" ? `${l.address ?? ""} ${l.zip ?? ""}` : l.zip}
              </td>
              <td className="p-2">{l.description}</td>
              <td className="p-2">
                ${Math.round(l.valuation ?? 0).toLocaleString()}
              </td>
              <td className="p-2">
                {tab === "mine" ? (
                  l.contractor_name ?? "n/a"
                ) : errors[l.permit_number] ? (
                  <span className="text-red-400">{errors[l.permit_number]}</span>
                ) : (
                  <button
                    className="border px-3 py-1"
                    disabled={busy === l.permit_number}
                    onClick={() => claim(l.permit_number)}
                  >
                    {busy === l.permit_number ? "Claiming..." : "Claim"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
