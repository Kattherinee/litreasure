import type { Metadata } from "next";

import Providers from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
	title: "Litreasure",
	description: "Starter with Zustand and TanStack Query",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
	}>) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
