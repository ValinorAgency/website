import BackgroundCanvas from "@/components/BackgroundCanvas"
import CustomCursor from "@/components/CustomCursor"
import LoadingOverlay from "@/components/LoadingOverlay"
import type { Metadata } from "next"
import { DM_Sans, Inter, Lora } from "next/font/google"
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

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Valinor Agency",
    template: "%s | Valinor Agency",
  },
  description:
    "Landing premium para Valinor Agency: diseño web de alto impacto y agentes de IA a medida para equipos que necesitan verse serios y convertir mejor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`h-full antialiased ${inter.variable} ${lora.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col bg-[var(--page-background)] text-[var(--ink)]">
        <LoadingOverlay />
        <BackgroundCanvas />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
