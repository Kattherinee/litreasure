import type { Metadata } from "next";

import Providers from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Litreasure",
  description: "Starter with daisyUI, Zustand, and TanStack Query",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-theme="litreasure">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
