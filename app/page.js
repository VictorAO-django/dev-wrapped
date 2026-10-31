"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import WrappedStory from "@/components/WrappedStory";

export default function Home() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleWrap() {
    setLoading(true);
    setError("");
    setStats(null);
    try {
      const res = await fetch("/api/wrap");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch your stats.");
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-12 sm:py-16">
      <header className="animate-rise text-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
          🤖 Powered by Gemma, via the Gemini API
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          GitHub{" "}
          <span className="bg-gradient-to-r from-[#ff4d94] to-[#7c5cff] bg-clip-text text-transparent">
            Wrapped
          </span>
        </h1>
        <p className="mt-3 text-white/60">
          Your coding year, wrapped up — then roasted by AI.
        </p>
      </header>

      <div
        className="animate-rise mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm"
        style={{ animationDelay: "80ms" }}
      >
        {status === "loading" && <p className="text-sm text-white/50">Loading…</p>}

        {status === "unauthenticated" && (
          <>
            <p className="mb-4 text-sm text-white/70">
              Sign in to generate <span className="font-semibold text-white">your own</span> wrap —
              this reads your public <span className="text-white/90">and private</span> repos
              (read-only) so your stats are the full picture, not just what's public.
            </p>
            <button
              onClick={() => signIn("github")}
              className="w-full rounded-xl bg-gradient-to-r from-[#ff4d94] to-[#7c5cff] px-5 py-3 font-display text-sm font-semibold text-white transition hover:brightness-110"
            >
              Sign in with GitHub
            </button>
          </>
        )}

        {status === "authenticated" && (
          <>
            <div className="mb-4 flex items-center justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={session.user.image}
                alt=""
                className="h-9 w-9 rounded-full border border-white/20"
              />
              <p className="text-sm text-white/70">
                Signed in as <span className="font-semibold text-white">{session.user.name}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleWrap}
                disabled={loading}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#ff4d94] to-[#7c5cff] px-5 py-3 font-display text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Wrapping…" : "Wrap it 🎀"}
              </button>
              <button
                onClick={() => signOut()}
                className="rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5"
              >
                Sign out
              </button>
            </div>
          </>
        )}

        {error && <p className="mt-3 text-sm text-[#ff8ab6]">{error}</p>}
      </div>

      {!stats && (
        <footer className="mt-10 text-center text-xs text-white/30">
          Open source · GitHub OAuth (read-only) + Gemma (Gemini API)
        </footer>
      )}

      {stats && <WrappedStory stats={stats} onRestart={() => setStats(null)} />}
    </div>
  );
}
