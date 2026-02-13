import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { JotaiProvider } from "@/store/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ValentineOS",
  description: "A Valentine-themed Web Operating System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="valentine">
      <body className={inter.className}>
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  );
}
