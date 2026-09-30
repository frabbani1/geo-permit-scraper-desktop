"use client";

const PLANS = [
  { id: "basic", name: "Basic", price: "$99/month", perks: ["Leads after 48 hours", "25 claims/month", "Zip filter"] },
  { id: "pro", name: "Pro", price: "$199/month", perks: ["Leads after 12 hours", "75 claims/month", "Zip, value, keyword filters"] },
  { id: "priority", name: "Priority", price: "$299/month", perks: ["Instant leads", "200 claims/month", "All filters + export"] },
];

export default function Pricing() {
  async function subscribe(plan: string) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vertical_id: "commercial", plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert(data.error);
  }
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold mb-6">Commercial leads</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.id} className="rounded-lg border p-5 space-y-3">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-lg">{p.price}</p>
            <ul className="text-sm space-y-1">
              {p.perks.map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
            <button
              className="rounded-md bg-white px-4 py-2 text-black w-full"
              onClick={() => subscribe(p.id)}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs opacity-70 text-center">
        By subscribing you agree to the <a className="underline" href="/terms">Terms</a> and{" "}
        <a className="underline" href="/privacy">Privacy Policy</a>.
      </p>
    </main>
  );
}
