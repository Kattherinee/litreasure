"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

import type { IBookSort } from "@/shared/api/books";
import { useBookCardsQuery } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { BookCard } from "@/shared/ui/BookCard";
import { BookCardSkeleton } from "@/shared/ui/Skeleton";

interface ICatalogPageProps {
	slug: string;
}

const catalogTitle: Record<IBookSort, string> = {
	newest: "Новинки",
	popular: "Популярное",
	rating: "Лучшие по рейтингу",
};

const isBookSort = (slug: string): slug is IBookSort =>
	slug === "newest" || slug === "popular" || slug === "rating";

const CatalogPage = ({ slug }: ICatalogPageProps) => {
	const sort = isBookSort(slug) ? slug : "newest";
	const [page, setPage] = useState(1);
	const {
		data: booksResponse,
		error,
		isError,
		isLoading,
	} = useBookCardsQuery({ page, sort });
	const books = booksResponse?.items ?? [];
	const pages = booksResponse?.pages ?? 1;
	const canGoPrev = page > 1;
	const canGoNext = page < pages;

	return (
		<Page>
			<Content>
				<BackLink href="/">На главную</BackLink>
				<Title>{catalogTitle[sort]}</Title>
				<Lead>Книжная выдача по фильтру {sort}.</Lead>

				{isLoading ? (
					<BookGrid aria-label="Загружаем книги">
						{Array.from({ length: 12 }, (_, index) => (
							<BookItem key={index}>
								<BookCardSkeleton />
							</BookItem>
						))}
					</BookGrid>
				) : isError ? (
					<StateMessage>
						Не удалось загрузить книги: {error.message}
					</StateMessage>
				) : books.length === 0 ? (
					<StateMessage>Здесь пока нет книг.</StateMessage>
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
							<Pagination>
								<PageButton
									disabled={!canGoPrev}
									type="button"
									onClick={() => setPage((current) => Math.max(1, current - 1))}
								>
									Назад
								</PageButton>
								<PageState>
									{page} / {pages}
								</PageState>
								<PageButton
									disabled={!canGoNext}
									type="button"
									onClick={() =>
										setPage((current) => Math.min(pages, current + 1))
									}
								>
									Вперёд
								</PageButton>
							</Pagination>
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
	background: ${theme.colors.background};
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
	--book-card-column: 12rem;

	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, var(--book-card-column));
	justify-content: start;
	margin-top: clamp(2.5rem, 5vw, 4rem);
`;

const BookItem = styled.div`
	width: fit-content;
`;

const Pagination = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	margin-top: 2rem;
`;

const PageButton = styled.button`
	border: 0.0625rem solid ${theme.colors.orangeDark};
	border-radius: 62.4375rem;
	background: ${theme.colors.transparent};
	padding: 0.55rem 1rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	font-size: 0.95rem;
	font-weight: 700;

	&:not(:disabled):hover,
	&:not(:disabled):focus-visible {
		background: ${theme.colors.orangePrimary};
		border-color: ${theme.colors.orangePrimary};
		color: ${theme.colors.white};
		outline: none;
	}

	&:disabled {
		cursor: default;
		opacity: 0.45;
	}
`;

const PageState = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.4;
`;
