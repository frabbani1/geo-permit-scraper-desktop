"use client";
import { useEffect, useState } from "react";

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const reset = () => setLoading(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error || "Could not open billing portal");
    } catch {
      alert("Could not reach the server. Try again.");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="rounded border px-3 py-1 text-sm"
    >
      {loading ? "Opening..." : "Manage subscription"}
    </button>
  );
}
