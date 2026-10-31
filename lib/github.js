// Authenticated: the signed-in user's OWN stats, including private repos.
// Uses /user (not /users/:username) and /user/repos with affiliation=owner,
// which only returns data the access token's owner is allowed to see.
export async function fetchAuthenticatedStats(accessToken) {
  const authHeaders = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
  };

  const userRes = await fetch("https://api.github.com/user", { headers: authHeaders });
  if (!userRes.ok) {
    throw new Error("Failed to load your GitHub profile. Try signing in again.");
  }
  const user = await userRes.json();

  // repos pagination must happen before the stuff that depends on `user.login`,
  // but is otherwise independent of the other calls below - run everything
  // else in parallel so we don't stack up latency serially.
  const reposPromise = fetchAllOwnedRepos(authHeaders);
  const [
    allRepos,
    commitsThisYear,
    pullRequestsOpened,
    issuesOpened,
    streak,
  ] = await Promise.all([
    reposPromise,
    fetchCommitCount(user.login, authHeaders),
    fetchSearchCount(`author:${user.login}+type:pr`, authHeaders),
    fetchSearchCount(`author:${user.login}+type:issue`, authHeaders),
    fetchContributionStreak(accessToken, user.login),
  ]);

  const privateRepoCount = allRepos.filter((r) => r.private).length;

  return summarizeRepos(user, allRepos, {
    privateRepoCount,
    commitsThisYear,
    pullRequestsOpened,
    issuesOpened,
    streak,
  });
}

async function fetchAllOwnedRepos(authHeaders) {
  const allRepos = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(
      `https://api.github.com/user/repos?affiliation=owner&per_page=100&page=${page}`,
      { headers: authHeaders }
    );
    if (!res.ok) break;
    const batch = await res.json();
    allRepos.push(...batch);
    if (batch.length < 100) break;
  }
  return allRepos;
}

// Commit search API, scoped to this calendar year.
async function fetchCommitCount(login, headers) {
  const year = new Date().getFullYear();
  try {
    const res = await fetch(
      `https://api.github.com/search/commits?q=author:${login}+author-date:>=${year}-01-01&per_page=1`,
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.total_count === "number" ? data.total_count : null;
  } catch {
    return null;
  }
}

// Generic issue-search-based counter, used for both PRs and issues.
async function fetchSearchCount(query, headers) {
  try {
    const res = await fetch(
      `https://api.github.com/search/issues?q=${query}&per_page=1`,
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.total_count === "number" ? data.total_count : null;
  } catch {
    return null;
  }
}

// Longest contribution streak + total contributions over the last year.
// This data (the green contribution calendar) only exists via GraphQL -
// there is no REST equivalent. Uses the same OAuth token.
async function fetchContributionStreak(accessToken, login) {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { login } }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return null;

    const days = calendar.weeks.flatMap((w) => w.contributionDays);
    let longest = 0;
    let current = 0;
    for (const day of days) {
      if (day.contributionCount > 0) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }

    return {
      totalContributions: calendar.totalContributions,
      longestStreak: longest,
    };
  } catch {
    return null;
  }
}

function summarizeRepos(
  user,
  repos,
  { privateRepoCount, commitsThisYear, pullRequestsOpened, issuesOpened, streak }
) {
  const langCounts = {};
  let totalStars = 0;
  let totalForks = 0;

  for (const repo of repos) {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
  }

  const topRepos = [...repos]
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 3)
    .map((r) => ({
      name: r.name,
      stars: r.stargazers_count || 0,
      description: r.description,
    }));

  const firstRepo = repos.length
    ? [...repos].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0]
    : null;

  const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
  const createdYear = new Date(user.created_at).getFullYear();
  const yearsOnGitHub = new Date().getFullYear() - createdYear;

  return {
    login: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    publicRepos: repos.length - privateRepoCount,
    privateRepos: privateRepoCount,
    totalRepos: repos.length,
    followers: user.followers,
    yearsOnGitHub: Math.max(yearsOnGitHub, 0),
    memberSince: createdYear,
    totalStars,
    totalForks,
    commitsThisYear,
    pullRequestsOpened,
    issuesOpened,
    longestStreak: streak?.longestStreak ?? null,
    totalContributions: streak?.totalContributions ?? null,
    topLanguages: sortedLangs.slice(0, 5).map(([name]) => name),
    topRepos,
    firstRepoName: firstRepo?.name ?? null,
    firstRepoYear: firstRepo ? new Date(firstRepo.created_at).getFullYear() : null,
    // WrappedStory still checks this flag to decide whether to show the
    // private-repos slide; always true since this app only ever wraps the
    // signed-in user's own account.
    authenticated: true,
  };
}
