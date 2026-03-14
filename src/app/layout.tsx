import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EcoEat - Cứu thực phẩm, nhận deal ngon",
  description: "Ứng dụng giải cứu thực phẩm dư thừa, giảm lãng phí và bảo vệ môi trường",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-[#FFFDF8] text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
