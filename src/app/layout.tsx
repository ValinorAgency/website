import BackgroundCanvas from "@/components/BackgroundCanvas"
import CustomCursor from "@/components/CustomCursor"
import FloatingActions from "@/components/FloatingActions"
import LoadingOverlay from "@/components/LoadingOverlay"
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

export const metadata: Metadata = {
  title: {
    default: "Valinor Agency | Diseño y desarrollo web",
    template: "%s | Valinor Agency",
  },
  description:
    "Diseñamos sitios web, ecommerce, aplicaciones y dashboards a medida para presentar, vender y gestionar mejor tu negocio.",
  openGraph: {
    title: "Valinor Agency | Diseño y desarrollo de soluciones web",
    description:
      "Sitios institucionales, landing pages, ecommerce, aplicaciones web y dashboards diseñados alrededor de objetivos concretos.",
    type: "website",
    locale: "es_AR",
    siteName: "Valinor Agency",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`h-full antialiased ${inter.variable} ${lora.variable} ${dmSans.variable} ${cinzel.variable}`}>
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
