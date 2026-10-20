import { publicSettings, siteUrl } from "@/lib/supabase/public";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await publicSettings();
  const title =
    settings.seo_title ||
    settings.company_name ||
    "Mekfidel — Phone Repair Tools & Screens";
  const description =
    settings.seo_description ||
    "Phone repair tools, replacement screens and spare parts in Nigeria.";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: "%s | Mekfidel" },
    description,
    keywords: (settings.seo_keywords || "")
      .split(",")
      .map((word: string) => word.trim())
      .filter(Boolean),
    openGraph: {
      type: "website",
      locale: "en_NG",
      siteName: settings.company_name,
      title,
      description,
      url: siteUrl,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
