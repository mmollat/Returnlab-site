import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.returnlablogistics.com"),
  title: {
    default: "ReturnLab Logistics",
    template: "%s | ReturnLab Logistics",
  },
  description:
    "U.S.-based return processing, product inspection, inventory storage, supplier receiving, and reverse logistics support for cross-border sellers.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ReturnLab Logistics",
    description:
      "U.S.-based return processing, product inspection, inventory storage, supplier receiving, and reverse logistics support for cross-border sellers.",
    url: "/",
    siteName: "ReturnLab Logistics",
    images: [
      {
        url: "/returnlab-conveyor-hero.png",
        width: 1600,
        height: 900,
        alt: "ReturnLab Logistics return processing facility hero image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReturnLab Logistics",
    description:
      "U.S.-based return processing, product inspection, inventory storage, supplier receiving, and reverse logistics support for cross-border sellers.",
    images: ["/returnlab-conveyor-hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#050505] text-white">
        {children}
      </body>
    </html>
  );
}
