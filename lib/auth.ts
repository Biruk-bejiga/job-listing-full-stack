import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import { getServerSession as nextAuthGetServerSession } from 'next-auth';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],
  session: {
    // use JWT sessions; we attach role to the session in the callback
    strategy: 'jwt'
  },
  callbacks: {
    // Persist role into the JWT and expose it on the session
    async jwt({ token, user }) {
      // When user signs in (user is present), read their role from DB and attach to token
      if (user) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: (user as any).id } });
          if (dbUser) token.role = dbUser.role;
        } catch (e) {
          // ignore
        }
      } else if (token.sub) {
        // Otherwise, keep token.role up-to-date by reading from DB
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
          if (dbUser) token.role = dbUser.role;
        } catch (e) {
          // ignore
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = (token as any).role;
      }
      return session;
    }
  },
  events: {
    // When a user is created by NextAuth (e.g. first Google sign-in), ensure they have the 'developer' role
    async createUser({ user }) {
      try {
        await prisma.user.update({ where: { id: user.id }, data: { role: 'developer' } as any });
      } catch (e) {
        // ignore errors (user may already have a role)
      }
    }
  }
};

export default NextAuth(authOptions);

export async function getServerAuthSession() {
  // Convenience wrapper for App Router server components — returns the session using authOptions
  return nextAuthGetServerSession(authOptions as any);
}
