import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Note: Firebase adapter requires additional setup and packages
// For now, we'll use JWT strategy without database persistence

export const authOptions: NextAuthOptions = {
  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Replace this with your own logic to validate credentials
        // For demonstration, accept a hardcoded user
        if (
          credentials &&
          credentials.email === process.env.DEMO_USER_EMAIL &&
          credentials.password === process.env.DEMO_USER_PASSWORD
        ) {
          return {
            id: "demo-user-id",
            name: "Demo User",
            email: credentials.email,
          };
        }
        // If login fails, return null
        return null;
      }
    })
  ],

  // Note: Database adapter disabled for simplicity
  // adapter: undefined,

  // Configure session strategy
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Configure JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Configure pages
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  // Configure callbacks
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }

      // Add user information to token
      if (user) {
        token.uid = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.uid as string;
        session.accessToken = token.accessToken as string;
        session.provider = token.provider as string;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    }
  },

  // Configure events
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`);
    },
    async signOut({ token }) {
      console.log(`User signed out`);
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",

  // Secret for NextAuth
  secret: process.env.NEXTAUTH_SECRET,
};
