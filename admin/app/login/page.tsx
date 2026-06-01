"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const result = await signIn("credentials", { password, redirect: false });

    if (result?.error) {
      setError("Mot de passe incorrect");
      setLoading(false);
    } else {
      router.push("/projects");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm space-y-6 p-8 bg-white rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Nota Admin</h1>
          <p className="text-sm text-zinc-500 mt-1">Connexion requise</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            autoFocus
            required
            className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-60 transition-colors"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
