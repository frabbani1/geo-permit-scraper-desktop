"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(mode: "in" | "up") {
    setMsg("");
    if (!email.trim() || !password) {
      return setMsg("Enter your email and password first.");
    }
    setLoading(true);
    const supabase = createClient();
    const creds = { email: email.trim(), password };
    const { data, error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword(creds)
        : await supabase.auth.signUp(creds);
    setLoading(false);
    if (error) return setMsg(error.message);
    if (mode === "up" && !data.session) {
      return setMsg("Account created. Check your email to confirm, then sign in.");
    }
    router.push("/leads");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-neutral-700 bg-neutral-900 p-8 space-y-4">
        <h1 className="text-2xl font-bold text-white">Columbus Permit Leads</h1>
        <p className="text-sm text-neutral-400">Sign in or create an account.</p>
        <input
          className="w-full rounded-md border border-neutral-600 bg-white p-2 text-black placeholder-neutral-500"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-neutral-600 bg-white p-2 text-black placeholder-neutral-500"
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            disabled={loading}
            className="flex-1 rounded-md bg-white py-2 font-medium text-black disabled:opacity-50"
            onClick={() => submit("in")}
          >
            Sign in
          </button>
          <button
            disabled={loading}
            className="flex-1 rounded-md border border-neutral-500 py-2 font-medium text-white disabled:opacity-50"
            onClick={() => submit("up")}
          >
            Sign up
          </button>
        </div>
        {msg && <p className="text-sm text-red-400">{msg}</p>}
      </div>
    </main>
  );
}
