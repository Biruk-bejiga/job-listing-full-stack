import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async session({ session, user }) {
      // Attach role and id
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role;
      }
      return session;
    }
  }
};

export default NextAuth(authOptions);
