import Providers from "@/providers/QuertClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "CMIS Admin Portal - Texas A&M",
  description:
    "Council for the Management of Information Systems Administration Portal",
  icons: {
    icon: "/icon.jfif",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <DashboardLayout>{children}</DashboardLayout> */}
        <Providers>{children}</Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
