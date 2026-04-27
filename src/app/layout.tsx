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
  title: "ReturnLab Logistics",
  description:
    "U.S.-based returns processing and reverse logistics for e-commerce sellers.",
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
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        
        {/* NAVBAR */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            
            {/* LOGO */}
            <a href="/" className="flex items-center gap-2">
              <img
                src="/returnlab-logo-v2.jpg"
                alt="ReturnLab Logistics"
                className="h-8 w-auto"
              />
            </a>

            {/* NAV LINKS */}
            <nav className="flex gap-6 text-sm font-medium text-slate-700">
              <a href="/" className="hover:text-slate-900">
                Home
              </a>
              <a href="/pricing" className="hover:text-slate-900">
                Pricing
              </a>
              <a href="/#contact" className="hover:text-slate-900">
                Contact
              </a>
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1">{children}</main>

      </body>
    </html>
  );
}
