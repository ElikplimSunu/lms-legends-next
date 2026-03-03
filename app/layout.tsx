import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LMS Legends — Learn from the Best",
    template: "%s | LMS Legends",
  },
  description:
    "A modern e-learning platform where experts create and sell courses, and students learn through video lessons, quizzes, and certifications.",
  keywords: [
    "e-learning",
    "online courses",
    "video lessons",
    "certifications",
    "LMS",
  ],
  authors: [{ name: "LMS Legends" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LMS Legends",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
