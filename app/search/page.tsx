import { Suspense } from "react";

import SearchPage from "@/components/pages/SearchPage";

export const metadata = {
	title: "Поиск — Litreasure",
};

export default function SearchRoute() {
	return (
		<Suspense>
			<SearchPage />
		</Suspense>
	);
}
