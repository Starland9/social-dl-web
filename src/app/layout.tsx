import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SwRegister from "../components/SwRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadataBase = new URL("https://social-dl.starland9.dev");

export const metadata: Metadata = {
  title: {
    default: "SocialDL — Téléchargeur Multi-Plateformes",
    template: "%s · SocialDL",
  },
  description:
    "SocialDL — Télécharger vidéos et audios depuis YouTube, Instagram, TikTok, Spotify, Facebook et Pinterest. Interface simple, proxy côté serveur, preview & historique.",
  keywords: [
    "SocialDL",
    "download",
    "YouTube",
    "Instagram",
    "TikTok",
    "Spotify",
    "Next.js",
    "WebApp",
  ],
  authors: [
    {
      name: "Landry Simo",
      url: "https://portfolio.starland9.dev",
    },
  ],
  creator: "Landry Simo",
  openGraph: {
    title: "SocialDL — Téléchargeur Multi-Plateformes",
    description:
      "Colle un lien, choisis la qualité, télécharge : SocialDL simplifie les téléchargements depuis YouTube, Instagram, TikTok, Spotify, Facebook et Pinterest.",
    url: "https://social-dl.starland9.dev",
    siteName: "SocialDL",
    images: [
      {
        url: "/socialdl-og.png",
        width: 1200,
        height: 630,
        alt: "SocialDL - Téléchargeur Multi-Plateformes",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialDL — Téléchargeur Multi-Plateformes",
    description:
      "Colle un lien, choisis la qualité, télécharge : SocialDL simplifie les téléchargements multi-plateformes.",
    // Optional: replace with Twitter handle if available
    site: "@Starland237",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
