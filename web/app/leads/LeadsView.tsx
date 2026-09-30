"use client";
import { useState } from "react";
import ManageBillingButton from "./ManageBillingButton";

type Lead = {
  permit_number: string;
  address: string | null;
  zip: string | null;
  description: string | null;
  valuation: number | null;
  issued_date: string | null;
};

export default function LeadsView({
  leads,
  plan,
  filters,
}: {
  leads: Lead[];
  plan: string;
  filters: string[];
}) {
  const [results, setResults] = useState<Record<string, string>>({});
  const [zip, setZip] = useState("");
  const [minValue, setMinValue] = useState("");
  const [keyword, setKeyword] = useState("");

  const has = (f: string) => filters.includes(f);

  const shown = leads.filter((l) => {
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
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["permit_number", "issued_date", "address", "zip", "description", "valuation"],
      ...shown.map((l) => [
        l.permit_number,
        l.issued_date,
        l.address,
        l.zip,
        l.description,
        l.valuation,
      ]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function claim(id: string) {
    const res = await fetch(`/api/leads/${encodeURIComponent(id)}/contact`, {
      method: "POST",
    });
    const data = await res.json();
    const text = res.ok
      ? `Contact: ${data.contact?.name ?? "n/a"}`
      : `Error: ${data.error}`;
    setResults((r) => ({ ...r, [id]: text }));
  }

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
            <th className="p-2">Address</th>
            <th className="p-2">Description</th>
            <th className="p-2">Value</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {shown.map((l) => (
            <tr key={l.permit_number} className="border-b align-top">
              <td className="p-2">{l.issued_date}</td>
              <td className="p-2">
                {l.address} {l.zip}
              </td>
              <td className="p-2">{l.description}</td>
              <td className="p-2">
                ${Math.round(l.valuation ?? 0).toLocaleString()}
              </td>
              <td className="p-2">
                {results[l.permit_number] ?? (
                  <button
                    className="border px-3 py-1"
                    onClick={() => claim(l.permit_number)}
                  >
                    Claim
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
