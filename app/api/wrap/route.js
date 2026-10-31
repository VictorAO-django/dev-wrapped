import { auth } from "@/auth";
import { fetchAuthenticatedStats } from "@/lib/github";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const stats = await fetchAuthenticatedStats(session.accessToken);
    return Response.json(stats);
  } catch (err) {
    return Response.json(
      { error: err?.message || "Failed to fetch your GitHub stats." },
      { status: 500 }
    );
  }
}
