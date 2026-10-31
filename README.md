# GitHub Wrapped 🎁

Your GitHub year, wrapped Spotify-Wrapped-style — then roasted by AI.

Sign in with your own GitHub account and get a full-screen, tap-through story of your
coding year: repos, commits, your longest contribution streak, stars, forks, top
languages, your most-loved projects, pull requests and issues — including your
**private** repos, since only you can generate your own wrap. It ends with an
AI-generated "developer persona" written by **Gemma**, via the Gemini API.

## Features

- 🔐 **Sign in with GitHub** — no username lookup for other people; you can only
  wrap your own account
- 📊 **Public *and* private repo stats** — repos, stars, forks received, top
  languages, top 3 most-starred projects, first-ever repo
- 🔥 **Real contribution streak** — longest streak and total contributions,
  pulled from GitHub's GraphQL API (the same data behind the green activity graph)
- 🤝 **Collaboration stats** — pull requests and issues opened
- ✨ **AI-generated persona** — a short, witty "developer persona" written by
  **Gemma 4**, accessed through the Gemini API
- 🎨 A full-screen, tap-to-advance story UI (bold flat colors, poster-style
  typography) rather than a static dashboard

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + React
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Auth.js (NextAuth v5)](https://authjs.dev/) with the GitHub OAuth provider
- [`@google/genai`](https://www.npmjs.com/package/@google/genai) — the official SDK
  used to call Gemma via the Gemini API

## How it works / privacy

- All GitHub data is fetched **server-side**, using the signed-in user's own OAuth
  access token — it is never exposed to the browser.
- The Gemini API key lives only in a server-side environment variable and is never
  sent to the client.
- **Scope disclosure**: GitHub's classic OAuth apps have no read-only scope for
  private repositories — the only option is `repo`, which technically grants
  read **and** write access. This app only ever *reads* data with it (profile,
  repos, commit/PR/issue counts, contribution calendar). Nothing is ever created,
  modified, or deleted on your GitHub account.

## Getting started

### 1. Clone and install

```bash
git clone <this-repo-url>
cd github-wrapped-next
npm install
```

### 2. Register a GitHub OAuth App

Go to **[github.com/settings/developers](https://github.com/settings/developers)**
→ OAuth Apps → New OAuth App, and set:

- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

Copy the generated **Client ID**, then generate and copy a **Client Secret**.

### 3. Get a Gemini API key

Go to **[aistudio.google.com](https://aistudio.google.com/)** → "Get API key" →
"Create API key". Free tier, no billing required.

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` with your real values:

```
GEMINI_API_KEY=your_gemini_api_key
AUTH_SECRET=generate_your_own_random_secret   # node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_GITHUB_ID=your_github_oauth_client_id
AUTH_GITHUB_SECRET=your_github_oauth_client_secret
```

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with GitHub, and hit
**Wrap it**.

## Project structure

```
app/
  api/
    auth/[...nextauth]/   Auth.js route handler
    wrap/                 fetches the signed-in user's GitHub stats (server-side)
    persona/              calls Gemma (Gemini API) to generate the AI persona
  page.js                 sign-in screen + entry point
  layout.js, globals.css  fonts, theme tokens, base styles
components/
  WrappedStory.js         the full-screen tap-through story experience
  Providers.js            Auth.js SessionProvider wrapper
lib/
  github.js               all GitHub REST + GraphQL data fetching/aggregation
auth.js                   Auth.js configuration (GitHub provider, scopes, callbacks)
```

## License

MIT — see [LICENSE](./LICENSE).
