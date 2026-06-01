"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

import type { IBookSort } from "@/shared/api/books";
import { useBookCardsQuery } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { BookCard } from "@/shared/ui/BookCard";
import { AppPagination } from "@/shared/ui/AppPagination";
import { BookCardSkeleton } from "@/shared/ui/Skeleton";

interface IGenrePageProps {
	slug: string;
	sort?: IBookSort;
}

const GenrePage = ({ slug, sort }: IGenrePageProps) => {
	const [page, setPage] = useState(1);
	const {
		data: booksResponse,
		error,
		isError,
		isLoading,
	} = useBookCardsQuery({ genre: slug, page, sort });
	const books = booksResponse?.items ?? [];
	const pages = booksResponse?.pages ?? 1;

	return (
		<Page>
			<Content>
				<BackLink href="/">Back to home</BackLink>
				<Title>{slug}</Title>
				<Lead>A collection of books in the {slug} genre.</Lead>

				{isLoading ? (
					<BookGrid aria-label="Loading books">
						{Array.from({ length: 12 }, (_, index) => (
							<BookItem key={index}>
								<BookCardSkeleton />
							</BookItem>
						))}
					</BookGrid>
				) : isError ? (
					<StateMessage>Could not load books: {error.message}</StateMessage>
				) : books.length === 0 ? (
					<StateMessage>No books in this genre yet.</StateMessage>
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

export default GenrePage;

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
	font-size: 3vw;
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
	--book-card-column: 8rem;

	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, var(--book-card-column));
	justify-content: start;
	margin-top: clamp(2.5rem, 5vw, 4rem);
`;

const BookItem = styled.div`
	width: fit-content;
`;
