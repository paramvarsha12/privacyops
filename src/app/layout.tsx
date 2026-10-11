import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PrivacyOps - Map Your Data, Understand Its Blast Radius",
  description: "Developer-first privacy operations platform for data discovery, lineage, and automated privacy actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-zinc-50`}>
        {children}
      </body>
    </html>
  );
}
