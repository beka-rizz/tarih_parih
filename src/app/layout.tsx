import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "Tarih Parih — Қазақстан тарихы",
  description:
    "Қазақстан тарихы бойынша тесттер мен карточкалар. Тесттен кейін әлсіз тақырыптарды талдау.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0369a1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="kk"
      className={`${notoSans.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-slate-50 font-sans text-slate-900 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
