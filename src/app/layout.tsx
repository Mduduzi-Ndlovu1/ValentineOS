import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { JotaiProvider } from "@/store/provider";

const inter = Inter({ subsets: ["latin"] });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script" });

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
      <body className={`${inter.className} ${dancingScript.variable}`}>
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  );
}
