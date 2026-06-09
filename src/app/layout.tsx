import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Inter, Playfair_Display } from "next/font/google";
import { ClarityAnalytics } from "@/components/ClarityAnalytics";
import { PostHogPageView } from "@/components/PostHogPageView";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Renove AI — Redesigne ta pièce avec l'IA",
  description:
    "Prends une photo, choisis un style et l'IA redesigne ta pièce en 30 secondes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${playfair.variable} ${fraunces.variable}`}
      >
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <ClarityAnalytics />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
