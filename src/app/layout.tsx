import type { Metadata, Viewport } from "next";
import { Inter, Dancing_Script, Montserrat, Libre_Caslon_Text } from "next/font/google";
import "./globals.css";
import { JotaiProvider } from "@/store/provider";

const inter = Inter({ subsets: ["latin"] });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const libreCaslon = Libre_Caslon_Text({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-libre-caslon" });

export const metadata: Metadata = {
  title: "ValentineOS",
  description: "A Valentine-themed Web Operating System",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="valentine">
      <body className={`${inter.className} ${dancingScript.variable} ${montserrat.variable} ${libreCaslon.variable}`}>
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  );
}
