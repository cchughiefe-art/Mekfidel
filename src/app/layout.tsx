import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mekfidelcomms.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: {
    default:
      "Mekfidel Communication Ltd - Mobile Phones, Accessories & Repair Services",
    template: "%s | Mekfidel Communication Ltd",
  },

  description:
    "Your trusted partner for mobile phones, phone accessories, spare parts, phone screens, and repair services in Nigeria.",

  keywords: [
    "Mekfidel Communication",
    "mobile phones Nigeria",
    "phone accessories",
    "phone screens",
    "phone spare parts",
    "phone repair Nigeria",
    "mobile phone wholesale",
    "phone retail Nigeria",
    "Lagos phone store",
  ],

  authors: [
    {
      name: "Mekfidel Communication Ltd",
    },
  ],

  creator: "Mekfidel Communication Ltd",
  publisher: "Mekfidel Communication Ltd",

  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Mekfidel Communication Ltd",
    title:
      "Mekfidel Communication Ltd - Mobile Phones, Accessories & Repair Services",
    description:
      "Buy mobile phones, accessories, spare parts and get professional repair services from Mekfidel Communication Ltd.",
    url: baseUrl,
  },

  twitter: {
    card: "summary_large_image",
    title: "Mekfidel Communication Ltd",
    description:
      "Your trusted partner for mobile phones, accessories, and repair services.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
