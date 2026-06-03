"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

import type { IBookSort } from "@/shared/api/books";
import { useBookCardsQuery } from "@/shared/api/books";
import { useRecomendationsForYouBooksQuery } from "@/shared/api/recomendations/recomendations.hooks";
import { theme } from "@/shared/theme";
import { BookCard } from "@/shared/ui/BookCard";
import { AppPagination } from "@/shared/ui/AppPagination";
import { BookCardSkeleton } from "@/shared/ui/Skeleton";

interface ICatalogPageProps {
	slug: string;
}

const catalogTitle: Record<IBookSort, string> = {
	newest: "New Releases",
	popular: "Popular",
	rating: "Top Rated",
};

const FOR_YOU_CATALOG_TITLE = "Recommended for You";

const isBookSort = (slug: string): slug is IBookSort =>
	slug === "newest" || slug === "popular" || slug === "rating";

const CatalogPage = ({ slug }: ICatalogPageProps) => {
	const isForYouCatalog = slug === "for-you";
	const sort = isBookSort(slug) ? slug : "newest";
	const [page, setPage] = useState(1);

	const {
		data: booksResponse,
		error,
		isError,
		isLoading,
	} = useBookCardsQuery({ page, sort }, { enabled: !isForYouCatalog });

	const {
		data: forYouBooksResponse,
		error: forYouError,
		isError: isForYouError,
		isLoading: isForYouLoading,
	} = useRecomendationsForYouBooksQuery({ page }, { enabled: isForYouCatalog });

	const response = isForYouCatalog ? forYouBooksResponse : booksResponse;
	const currentError = isForYouCatalog ? forYouError : error;
	const currentIsError = isForYouCatalog ? isForYouError : isError;
	const currentIsLoading = isForYouCatalog ? isForYouLoading : isLoading;

	const books = response?.items ?? [];
	const pages = response?.pages ?? 1;

	return (
		<Page>
			<Content>
				<BackLink href="/">Back to home</BackLink>
				<Title>
					{isForYouCatalog ? FOR_YOU_CATALOG_TITLE : catalogTitle[sort]}
				</Title>
				<Lead>
					{isForYouCatalog
						? "Personalized selection based on your preferences."
						: `Book list filtered by ${sort}.`}
				</Lead>

				{currentIsLoading ? (
					<BookGrid aria-label="Loading books">
						{Array.from({ length: 12 }, (_, index) => (
							<BookItem key={index}>
								<BookCardSkeleton />
							</BookItem>
						))}
					</BookGrid>
				) : currentIsError ? (
					<StateMessage>
						Failed to load books: {currentError?.message ?? "Unknown error"}
					</StateMessage>
				) : books.length === 0 ? (
					<StateMessage>No books here yet.</StateMessage>
				) : (
					<>
						<BookGrid>
							{books.map((book) => (
								<BookItem key={book.id}>
									<BookCard book={book} />
								</BookItem>
							))}
						</BookGrid>
						{pages > 1 ? (
							<AppPagination count={pages} page={page} onChange={setPage} />
						) : null}
					</>
				)}
			</Content>
		</Page>
	);
};

export default CatalogPage;

const Page = styled.div`
	min-height: 100dvh;
	padding: clamp(3rem, 5vw, 4.5rem) clamp(1.5rem, 2.78vw, 2.5rem);
`;

const Content = styled.section`
	margin: 0 auto;
	max-width: 77.5rem;
`;

const BackLink = styled(Link)`
	display: inline-flex;
	margin-bottom: 1.5rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.9375rem;
	text-decoration: none;

	&:hover {
		text-decoration: underline;
	}
`;

const Title = styled.h1`
	margin: 0;
	font-family: ${theme.fonts.serif};
	font-size: clamp(2.75rem, 6vw, 5rem);
	font-weight: 600;
	line-height: 1;
`;

const Lead = styled.p`
	max-width: 40rem;
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1.125rem;
	line-height: 1.55;
`;

const StateMessage = styled.p`
	margin: 2.5rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;

const BookGrid = styled.div`
	--book-card-column: 11rem;

	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, var(--book-card-column));
	justify-content: center;
	justify-items: center;
	margin-top: clamp(2.5rem, 5vw, 4rem);
`;

const BookItem = styled.div`
	width: fit-content;
`;
