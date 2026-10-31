import { GoogleGenAI } from "@google/genai";

// Gemma 4, accessed through the Gemini API (per ai.google.dev/gemma/docs/core/gemma_on_gemini_api)
const MODEL = "gemma-4-26b-a4b-it";

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing GEMINI_API_KEY. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  const stats = await request.json();

  const topRepo = stats.topRepos?.[0];

  const prompt = `You are a witty, playful dev-culture commentator. Based on this GitHub profile data, write a short (3-4 sentence), funny, lighthearted "developer persona" roast. Be clever and specific, never mean-spirited.

Username: ${stats.login}
Member since: ${stats.memberSince} (${stats.yearsOnGitHub} years on GitHub)
First repo: ${stats.firstRepoName ?? "unknown"} (${stats.firstRepoYear ?? "?"})
Public repos: ${stats.publicRepos}
Total stars earned: ${stats.totalStars}
Forks received: ${stats.totalForks ?? "unknown"}
Followers: ${stats.followers}
Commits this year: ${stats.commitsThisYear ?? "unknown"}
Longest contribution streak: ${stats.longestStreak ?? "unknown"} days
Pull requests opened: ${stats.pullRequestsOpened ?? "unknown"}
Issues opened: ${stats.issuesOpened ?? "unknown"}
Top languages: ${stats.topLanguages?.join(", ") || "none listed"}
Most-starred repo: ${topRepo ? `${topRepo.name} (${topRepo.stars} stars)${topRepo.description ? ` — "${topRepo.description}"` : ""}` : "none yet"}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return Response.json({ text: response.text?.trim() || "No response generated." });
  } catch (err) {
    return Response.json(
      { error: err?.message || "Failed to generate persona." },
      { status: 500 }
    );
  }
}
