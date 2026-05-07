import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash || !credentials?.password) return null;
        const valid = await bcrypt.compare(String(credentials.password), hash);
        if (!valid) return null;
        return { id: "admin", name: "Admin" };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});
