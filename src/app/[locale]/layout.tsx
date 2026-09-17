import BackgroundCanvas from "@/components/BackgroundCanvas"
import CustomCursor from "@/components/CustomCursor"
import FloatingActions from "@/components/FloatingActions"
import LoadingOverlay from "@/components/LoadingOverlay"
import { getOrganizationJsonLd, serializeJsonLd } from "@/lib/organization-json-ld"
import { getSiteUrl } from "@/lib/site-url"
import { routing } from "@/i18n/routing"
import type { Metadata } from "next"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Cinzel, DM_Sans, Inter, Lora } from "next/font/google"
import "../globals.css"

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const siteTitle = t("title");
  const siteDescription = t("description");
  const path = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: siteTitle,
      template: "%s | Valinor Agency",
    },
    description: siteDescription,
    alternates: {
      canonical: path,
      languages: {
        es: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: path,
      siteName: "Valinor Agency",
      locale: locale === "en" ? "en_US" : "es_AR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "metadata" });
  const jsonLd = getOrganizationJsonLd(t("description"));

  return (
    <html lang={locale} className={`h-full antialiased ${inter.variable} ${lora.variable} ${dmSans.variable} ${cinzel.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--page-background)] text-[var(--ink)]">
        <NextIntlClientProvider>
          <LoadingOverlay />
          <BackgroundCanvas />
          <CustomCursor />
          {children}
          <FloatingActions />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
