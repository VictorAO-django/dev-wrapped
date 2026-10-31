import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      // repo scope: GitHub's classic OAuth apps have no read-only private-repo
      // scope, so this technically grants read+write on private repos. We only
      // ever read with it - documented in the README for transparency.
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
