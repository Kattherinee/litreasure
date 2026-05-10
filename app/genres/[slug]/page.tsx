import type { BookSort } from "@/shared/api/books";
import GenrePage from "@/components/pages/GenrePage";

type PageProps = {
	params: Promise<{
		slug: string;
	}>;
	searchParams: Promise<{
		sort?: string;
	}>;
};

const isBookSort = (sort?: string): sort is BookSort =>
	sort === "newest" || sort === "popular" || sort === "rating";

export default async function GenreRoute({ params, searchParams }: PageProps) {
	const { slug } = await params;
	const { sort } = await searchParams;

	return <GenrePage slug={slug} sort={isBookSort(sort) ? sort : undefined} />;
}
