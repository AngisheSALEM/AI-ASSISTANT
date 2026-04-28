import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentia-Kin | SaaS AI Agents",
  description: "Plateforme SaaS d'Agents IA professionnels pour les entreprises de Kinshasa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
