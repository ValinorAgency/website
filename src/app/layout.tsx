import BackgroundCanvas from "@/components/BackgroundCanvas"
import CustomCursor from "@/components/CustomCursor"
import FloatingActions from "@/components/FloatingActions"
import LoadingOverlay from "@/components/LoadingOverlay"
import { getOrganizationJsonLd, serializeJsonLd } from "@/lib/organization-json-ld"
import { getSiteUrl } from "@/lib/site-url"
import type { Metadata } from "next"
import { Cinzel, DM_Sans, Inter, Lora } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  style: ["normal", "italic"],
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "600"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500"],
});

const siteTitle = "Valinor Agency | Diseño y desarrollo web a medida";
const siteDescription =
  "Creamos sitios web, tiendas online, aplicaciones y dashboards para empresas, profesionales y emprendimientos de Argentina.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteTitle,
    template: "%s | Valinor Agency",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "Valinor Agency",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`h-full antialiased ${inter.variable} ${lora.variable} ${dmSans.variable} ${cinzel.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(getOrganizationJsonLd()) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--page-background)] text-[var(--ink)]">
        <LoadingOverlay />
        <BackgroundCanvas />
        <CustomCursor />
        {children}
        <FloatingActions />
      </body>
    </html>
  );
}
