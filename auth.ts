import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare, hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password required");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }

          const passwordMatch = await compare(
            credentials.password as string,
            user.password
          );

          if (!passwordMatch) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/auth/auth-code-error",
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.role = user.role || 'customer';
          token.id = user.id!;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        throw error;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        throw error;
      }
    },
  },
  events: {
    async signOut() {
      // This ensures the session is fully cleared
      console.log('User signed out');
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

// Helper function to verify passwords
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Helper function to get current user
export async function getCurrentUser() {
  const { getServerSession } = await import("next-auth/next");
  const session = await getServerSession(authOptions);
  return session?.user;
}
