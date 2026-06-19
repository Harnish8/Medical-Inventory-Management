import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ 
  weight: ['400', '500', '700'], 
  subsets: ["latin"],
  variable: "--font-roboto"
});

export const metadata: Metadata = {
  title: "Kirtan Medical Store",
  description: "Web-Based Inventory & Billing Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} font-sans bg-gray-50 text-gray-900`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
