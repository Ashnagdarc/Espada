// global.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
  }
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: string;
      PAYSTACK_SECRET_KEY: string;
      NEXT_PUBLIC_API_URL: string;
    }
  }
}
