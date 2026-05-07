import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nota Admin",
  description: "Interface d'administration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full bg-zinc-50 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
