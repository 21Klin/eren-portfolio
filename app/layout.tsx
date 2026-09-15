import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { BootController } from "@/components/boot/boot-controller";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eren Murtishi",
  description:
    "Founder & CEO of Egy AI — Principal Architect of Ultracognitive AI & Neurosynthetic Systems, Full-Spectrum Metastack Software, and High-Performance, Custom Liquid-Cooled Hardware Systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <BootController />
        {children}
      </body>
    </html>
  );
}
