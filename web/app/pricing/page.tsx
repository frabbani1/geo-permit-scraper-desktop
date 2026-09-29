"use client";

export default function Pricing() {
  async function subscribe() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vertical_id: "commercial" }),
    });
    const text = await res.text();
    let data: { url?: string; error?: string } = {};
    try {
      data = JSON.parse(text);
    } catch {
      return alert(`Server error ${res.status}. Check the terminal.`);
    }
    if (data.url) window.location.href = data.url;
    else alert(data.error);
  }
  return (
    <main className="mx-auto max-w-sm p-8 space-y-4">
      <h1 className="text-2xl font-bold">Commercial leads</h1>
      <p>$99/month</p>
      <button className="rounded-md bg-white px-4 py-2 text-black" onClick={subscribe}>
        Subscribe
      </button>
    </main>
  );
}
