import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { BootController } from "@/components/boot/boot-controller";
import { ParticleBackground } from "@/components/background/particle-field";
import { ScrollZoneController } from "@/components/background/scroll-zone-controller";
import { CustomCursor } from "@/components/cursor/custom-cursor";
import { TerminalWidget } from "@/components/terminal/terminal-widget";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { BootStatusProvider } from "@/lib/boot-status";
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
      className={`${jetbrainsMono.variable} ${inter.variable} h-full scroll-smooth antialiased motion-reduce:scroll-auto`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionConfig reducedMotion="user">
          <BootStatusProvider>
            <ParticleBackground />
            <ScrollZoneController />
            <BootController />
            <CustomCursor />
            <TerminalWidget />
            <SiteNav />
            {children}
            <SiteFooter />
          </BootStatusProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
