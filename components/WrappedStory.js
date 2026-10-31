"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

// Bold flat colors, one per slide - matches Spotify Wrapped's poster-like
// identity (solid saturated color blocks, not soft gradients).
const SCENES = [
  { bg: "#121212", text: "light", shape: "#1ED760" },
  { bg: "#1ED760", text: "dark", shape: "#121212" },
  { bg: "#0D72EA", text: "light", shape: "#FFC864" },
  { bg: "#E91429", text: "light", shape: "#121212" },
  { bg: "#FFC864", text: "dark", shape: "#E91429" },
  { bg: "#7B2FF7", text: "light", shape: "#1ED760" },
  { bg: "#F037A5", text: "light", shape: "#FFC864" },
  { bg: "#121212", text: "light", shape: "#0D72EA" },
];

function Shape({ color, seed }) {
  // a single bold rotated block peeking from a corner - cheap, flat, poster-y
  const corner = seed % 4;
  const pos =
    corner === 0
      ? "-top-16 -right-16"
      : corner === 1
        ? "-bottom-16 -left-16"
        : corner === 2
          ? "-top-16 -left-16"
          : "-bottom-16 -right-16";
  return (
    <div
      className={`pointer-events-none absolute ${pos} h-56 w-56 rotate-[20deg] rounded-[28%]`}
      style={{ backgroundColor: color, opacity: 0.9 }}
    />
  );
}

function Big({ kicker, value, label, textClass }) {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p key={`k-${value}`} className={`animate-rise text-sm font-bold uppercase tracking-[0.2em] ${textClass} opacity-70`}>
        {kicker}
      </p>
      <p
        key={`v-${value}`}
        className={`font-poster animate-pop mt-4 break-words text-6xl leading-none sm:text-8xl ${textClass}`}
        style={{ animationDelay: "80ms" }}
      >
        {value}
      </p>
      {label && (
        <p
          key={`l-${value}`}
          className={`animate-rise mt-5 text-xl font-semibold ${textClass} opacity-90`}
          style={{ animationDelay: "220ms" }}
        >
          {label}
        </p>
      )}
    </div>
  );
}

function Duo({ kicker, items, textClass }) {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className={`animate-rise mb-6 text-sm font-bold uppercase tracking-[0.2em] ${textClass} opacity-70`}>
        {kicker}
      </p>
      <div className="flex w-full max-w-sm gap-4">
        {items.map((item, i) => (
          <div key={item.label} className="animate-rise flex-1" style={{ animationDelay: `${i * 120}ms` }}>
            <p className={`font-poster text-5xl ${textClass}`}>{item.value}</p>
            <p className={`mt-2 text-sm font-semibold ${textClass} opacity-80`}>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingList({ kicker, items, textClass, accentBg, badgeTextClass }) {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
      <p className={`animate-rise mb-6 text-center text-sm font-bold uppercase tracking-[0.2em] ${textClass} opacity-70`}>
        {kicker}
      </p>
      <div className="w-full max-w-sm space-y-3">
        {items.map((item, i) => (
          <div
            key={item.title}
            className="animate-rise flex items-center gap-4 rounded-2xl bg-black/15 px-4 py-3 backdrop-blur-sm"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span
              className={`font-poster flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${badgeTextClass}`}
              style={{ backgroundColor: accentBg }}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className={`truncate font-display text-base font-semibold ${textClass}`}>{item.title}</p>
              {item.subtitle && (
                <p className={`truncate text-sm ${textClass} opacity-70`}>{item.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WrappedStory({ stats, onRestart }) {
  const firstName = stats.name.split(" ")[0];

  const slides = useMemo(() => {
    const s = [
      {
        kind: "big",
        kicker: `Hey ${firstName} 👋`,
        value: "Your GitHub year,",
        label: "wrapped.",
      },
      {
        kind: "big",
        kicker: "Member since",
        value: stats.memberSince,
        label: `That's ${stats.yearsOnGitHub} year${stats.yearsOnGitHub === 1 ? "" : "s"} of commits`,
      },
      stats.firstRepoName && {
        kind: "big",
        kicker: "Where it all started",
        value: stats.firstRepoName,
        label: `created in ${stats.firstRepoYear}`,
      },
      {
        kind: "big",
        kicker: "You shipped work across",
        value: stats.totalRepos ?? stats.publicRepos,
        label: "repositories",
      },
      stats.commitsThisYear != null && {
        kind: "big",
        kicker: `In ${new Date().getFullYear()} alone, you made`,
        value: stats.commitsThisYear.toLocaleString(),
        label: "commits",
      },
      stats.longestStreak != null &&
        stats.longestStreak > 0 && {
          kind: "big",
          kicker: "Your longest streak:",
          value: stats.longestStreak,
          label: `day${stats.longestStreak === 1 ? "" : "s"} in a row, no breaks`,
        },
      {
        kind: "big",
        kicker: "And earned",
        value: stats.totalStars.toLocaleString(),
        label: "stars total",
      },
      stats.totalForks > 0 && {
        kind: "big",
        kicker: "Other developers forked your work",
        value: stats.totalForks.toLocaleString(),
        label: stats.totalForks === 1 ? "time" : "times",
      },
      {
        kind: "big",
        kicker: "You're followed by",
        value: stats.followers.toLocaleString(),
        label: stats.followers === 1 ? "developer" : "developers",
      },
      stats.topLanguages.length > 0 && {
        kind: "list",
        kicker: "Your top languages",
        items: stats.topLanguages.map((l) => ({ title: l })),
      },
      stats.topRepos.length > 0 && {
        kind: "list",
        kicker: "Your most-loved projects",
        items: stats.topRepos.map((r) => ({
          title: r.name,
          subtitle: `★ ${r.stars.toLocaleString()} stars`,
        })),
      },
      (stats.pullRequestsOpened != null || stats.issuesOpened != null) && {
        kind: "duo",
        kicker: "You collaborated too",
        items: [
          { value: stats.pullRequestsOpened ?? "—", label: "pull requests opened" },
          { value: stats.issuesOpened ?? "—", label: "issues opened" },
        ],
      },
      stats.authenticated &&
        stats.privateRepos > 0 && {
          kind: "big",
          kicker: "Including",
          value: stats.privateRepos,
          label: "private repos only you can see",
        },
      { kind: "persona" },
      { kind: "summary" },
    ].filter(Boolean);
    return s;
  }, [stats, firstName]);

  const [index, setIndex] = useState(0);
  const [persona, setPersona] = useState("");
  const [personaLoading, setPersonaLoading] = useState(false);
  const [personaError, setPersonaError] = useState("");

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const current = slides[index];

  useEffect(() => {
    if (current?.kind === "persona" && !persona && !personaLoading) {
      setPersonaLoading(true);
      setPersonaError("");
      fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to generate persona.");
          setPersona(data.text);
        })
        .catch((err) => setPersonaError(err.message))
        .finally(() => setPersonaLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const scene = SCENES[index % SCENES.length];
  const textClass = scene.text === "dark" ? "text-[#121212]" : "text-white";

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ backgroundColor: scene.bg }}>
      <Shape color={scene.shape} seed={index} />

      {/* progress bar */}
      <div className="relative z-20 flex gap-1.5 p-4">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 overflow-hidden rounded-full"
            style={{ backgroundColor: scene.text === "dark" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.25)" }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: i <= index ? "100%" : "0%",
                backgroundColor: scene.text === "dark" ? "#121212" : "#fff",
              }}
            />
          </div>
        ))}
      </div>

      {/* tap zones */}
      <button aria-label="Previous" onClick={goPrev} className="absolute left-0 top-0 z-10 h-full w-1/3 cursor-default" />
      <button aria-label="Next" onClick={goNext} className="absolute right-0 top-0 z-10 h-full w-2/3 cursor-default" />

      <div className="pointer-events-none relative flex flex-1 flex-col">
        {current.kind === "persona" ? (
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className={`text-sm font-bold uppercase tracking-[0.2em] ${textClass} opacity-70`}>
              ✨ Your AI-generated persona
            </p>
            {personaLoading && (
              <p className={`font-display mt-6 animate-pulse text-2xl ${textClass} opacity-80`}>
                Gemma is thinking…
              </p>
            )}
            {personaError && <p className="mt-6 text-[#ffd1dc]">{personaError}</p>}
            {persona && (
              <p className={`animate-rise mt-6 max-w-md text-xl font-medium leading-relaxed ${textClass}`}>
                {persona}
              </p>
            )}
          </div>
        ) : current.kind === "summary" ? (
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stats.avatarUrl} alt={stats.login} className={`h-20 w-20 rounded-full border-2 ${scene.text === "dark" ? "border-black/30" : "border-white/30"}`} />
            <h2 className={`font-poster mt-4 text-2xl ${textClass}`}>{stats.name}</h2>
            <p className={`${textClass} opacity-70`}>@{stats.login}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl bg-black/15 p-3">
                <p className={`font-poster text-2xl ${textClass}`}>{stats.totalStars.toLocaleString()}</p>
                <p className={`text-xs uppercase ${textClass} opacity-70`}>Stars</p>
              </div>
              <div className="rounded-xl bg-black/15 p-3">
                <p className={`font-poster text-2xl ${textClass}`}>{stats.totalRepos ?? stats.publicRepos}</p>
                <p className={`text-xs uppercase ${textClass} opacity-70`}>Repos</p>
              </div>
            </div>
            <button
              onClick={onRestart}
              className="relative z-20 pointer-events-auto mt-8 rounded-full bg-white px-8 py-3 font-poster text-sm text-[#121212] transition hover:scale-105"
            >
              DONE
            </button>
          </div>
        ) : current.kind === "list" ? (
          <RankingList
            kicker={current.kicker}
            items={current.items}
            textClass={textClass}
            accentBg={scene.text === "dark" ? "#121212" : "#fff"}
            badgeTextClass={scene.text === "dark" ? "text-white" : "text-[#121212]"}
          />
        ) : current.kind === "duo" ? (
          <Duo kicker={current.kicker} items={current.items} textClass={textClass} />
        ) : (
          <Big kicker={current.kicker} value={current.value} label={current.label} textClass={textClass} />
        )}
      </div>

      {index < slides.length - 1 && current.kind !== "summary" && (
        <p className={`relative z-10 pb-6 text-center text-xs font-semibold ${textClass} opacity-50`}>
          Tap right to continue →
        </p>
      )}
    </div>
  );
}
