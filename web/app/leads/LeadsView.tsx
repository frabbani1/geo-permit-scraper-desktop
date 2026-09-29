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

export default function LeadsView({ leads }: { leads: Lead[] }) {
  const [results, setResults] = useState<Record<string, string>>({});

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
        <h1 className="text-2xl font-bold">Commercial leads</h1>
        <div className="flex gap-2">
          <a href="/pricing" className="rounded-md bg-white px-3 py-1 text-black">
            Subscribe
          </a>
          <ManageBillingButton />
        </div>
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
          {leads.map((l) => (
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
