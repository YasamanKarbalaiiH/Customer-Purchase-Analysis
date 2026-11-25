import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const myFont = localFont({
  src: "./font/Vazirmatn-Regular.woff2",
  display: "swap",
  variable: "--font-main",
});

export const metadata: Metadata = {
  title: "Customer Purchase Analysis",
  description: "Customer Purchase Analysis Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={myFont.variable}>{children}</body>
    </html>
  );
}
