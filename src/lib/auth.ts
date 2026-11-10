import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getEnv } from "@/lib/env";

const env = getEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  providers: [
    ...(env.GITHUB_ID && env.GITHUB_SECRET
      ? [
          GitHub({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
          }),
        ]
      : []),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Instant Credentials provider for quick login / demo
    Credentials({
      name: "Akun Instan (Email)",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Nama", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const name = credentials?.name as string | undefined;

        if (!email) return null;

        return {
          id: `user-${Buffer.from(email).toString("base64").slice(0, 10)}`,
          email: email.toLowerCase().trim(),
          name: name?.trim() || email.split("@")[0],
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
