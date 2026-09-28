import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SITE, fullTitle } from "@/lib/site/config";
import "./globals.css";

const display = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-aa-display",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-aa-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: fullTitle,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_PK",
    title: fullTitle,
    description: SITE.description,
    images: [{ url: SITE.defaultOgImage, width: 1076, height: 671, alt: `${SITE.name} campus` }],
  },
  twitter: {
    card: "summary_large_image",
    title: fullTitle,
    description: SITE.description,
    images: [SITE.defaultOgImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#163024",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
