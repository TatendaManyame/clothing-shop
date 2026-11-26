
import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppwritePing from "@/components/AppwritePing";
import StoreNavbar from "@/components/StoreNavbar";
import StoreFooter from "@/components/StoreFooter";
import SiteLayout from "@/components/SiteLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VICWAV | Modern Streetwear",
    template: "%s | VICWAV",
  },
  description:
    "Discover modern streetwear and everyday essentials at VICWAV. Shop clothing designed for confidence, comfort and style.",
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
      <body className="flex min-h-full flex-col">
        <AppwritePing />

        <Suspense
          fallback={<div className="min-h-screen w-full bg-white" />}
        >
          <SiteLayout
            navbar={
              <Suspense fallback={<div className="h-20 w-full bg-white" />}>
                <StoreNavbar />
              </Suspense>
            }
            footer={<StoreFooter />}
          >
            {children}
          </SiteLayout>
        </Suspense>
      </body>
    </html>
  );
}
