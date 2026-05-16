import type { Metadata } from "next";

import Providers from "@/app/providers";
import { Header } from "@/shared/ui/Header";

import "./globals.css";

export const metadata: Metadata = {
	title: "Litreasure",
	description:
		"Discover your next favorite book with Litreasure - your personalized book recommendation platform. Explore curated collections, find hidden gems, and dive into a world of literary treasures tailored just for you.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<Providers>
					<Header />
					<main>{children}</main>
				</Providers>
			</body>
		</html>
	);
}
