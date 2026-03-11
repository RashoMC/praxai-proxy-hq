import type { Metadata } from "next";
import { Inter, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "PraxAi Proxy HQ",
  description: "AI-powered lead management and outreach dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${pixelifySans.variable} antialiased bg-slate-900 text-slate-100 min-h-screen`}
      >
        <Navbar />
        <main className="max-w-screen-2xl mx-auto px-4 py-6">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
