import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import App from "./app";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HEFC - Dashboard",
  icons: "/assets/logo/logo-small-hospital.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-text`}>
        <App>{children}</App>
      </body>
    </html>
  );
}
