import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "FamilyMind AI — Интерактивная нейрокарта семьи и окружения",
  description:
    "Интерактивная майнд-карта семьи и окружения в стиле графа связей нейросети с встроенным ИИ-ассистентом для рекомендаций и автодополнения данных.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-[#060913] text-slate-100 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
