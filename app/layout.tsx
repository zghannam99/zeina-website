import type { Metadata } from "next";
import { Outfit, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AnalyticsProvider } from "@/components/ui/analytics-provider";

// Outfit is the display/body face for the warm-minimal direction — softer and
// rounder than Geist, which suited the earlier cool-grey palette.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

// Editorial serif for the About page — large and light, the quality that makes
// a page read as considered rather than loud.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Mono for the small uppercase metadata on the navigation cards.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Zeina Ghannam",
  description: "Portfolio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${instrumentSerif.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
