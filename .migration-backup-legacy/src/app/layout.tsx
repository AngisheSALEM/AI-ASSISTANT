import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/ui/PageTransition";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Opere | SaaS AI Agents",
  description: "Plateforme SaaS d'Agents IA professionnels pour les entreprises de Kinshasa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="deep-space-bg dark:block hidden">
              <div className="noise-overlay" />
              <div className="glow-circle glow-violet" />
              <div className="glow-circle glow-blue" />
            </div>
            <PageTransition>{children}</PageTransition>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
