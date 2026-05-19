import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BRND — Your brand journey, in minutes",
  description:
    "Generate a complete brand or a complete campaign — voice, visuals, persona, applied mockups — built by Gemini, rendered by Nano Banana.",
  metadataBase: new URL("https://brnd.app"),
  openGraph: {
    title: "BRND",
    description: "Your brand journey, in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${GeistSans.variable} ${mono.variable}`}
    >
      <body className="grain">{children}</body>
    </html>
  );
}
