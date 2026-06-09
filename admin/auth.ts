import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Rate-limit anti-brute-force en mémoire (instance PM2 unique). fail2ban ne voit
// pas cette route applicative, d'où ce garde-fou côté code.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; first: number }>();

function clientIp(request?: Request): string {
  const xff = request?.headers?.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "unknown";
}
function isLocked(ip: string): boolean {
  const rec = attempts.get(ip);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}
function recordFailure(ip: string): void {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) attempts.set(ip, { count: 1, first: now });
  else rec.count += 1;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials, request) => {
        const ip = clientIp(request as Request | undefined);
        if (isLocked(ip)) return null; // trop d'essais récents

        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash || !credentials?.password) return null;
        const valid = await bcrypt.compare(String(credentials.password), hash);
        if (!valid) {
          recordFailure(ip);
          return null;
        }
        attempts.delete(ip); // succès → on réinitialise le compteur
        return { id: "admin", name: "Admin" };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 h
  secret: process.env.AUTH_SECRET,
});
