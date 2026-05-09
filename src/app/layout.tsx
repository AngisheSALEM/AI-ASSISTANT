import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/ui/PageTransition";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Opere | SaaS AI Agents",
  description: "Plateforme SaaS d'Agents IA professionnels pour les entreprises. Recrutez votre employe IA en 5 minutes.",
  keywords: ["AI", "agents", "SaaS", "WhatsApp", "automation", "business"],
  authors: [{ name: "Salem", url: "https://github.com/AngisheSALEM" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {/* Light mode background */}
            <div className="light-space-bg dark:hidden" />
            {/* Dark mode background */}
            <div className="deep-space-bg hidden dark:block">
              <div className="noise-overlay" />
              <div className="grid-pattern" />
              <div className="glow-circle glow-cyan" />
              <div className="glow-circle glow-blue" />
              <div className="glow-circle glow-emerald" />
            </div>
            <PageTransition>{children}</PageTransition>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
