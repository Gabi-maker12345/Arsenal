import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Arsenal Gaming Hub — A tua arena, as tuas regras",
  description:
    "Plataforma social para gamers: pacotes de jogo criados pela comunidade, voz, grupos e competições. O Arsenal transforma cada sessão numa experiência só tua.",
  applicationName: "Arsenal Gaming Hub",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Arsenal Gaming Hub — A tua arena, as tuas regras",
    description:
      "Pacotes de jogo comunitários, comunidades sem atrito e competições. Entra na arena.",
    type: "website",
    locale: "pt_PT",
    url: "/",
    siteName: "Arsenal Gaming Hub",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Arsenal Gaming Hub — a tua arena, as tuas regras",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arsenal Gaming Hub",
    description:
      "Pacotes de jogo comunitários, comunidades sem atrito e competições. Entra na arena.",
    images: ["/og.jpg"],
  },
  appleWebApp: {
    capable: true,
    title: "Arsenal",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt" className={`${spaceGrotesk.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
