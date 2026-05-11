"use client";

import styled from "styled-components";

import type { Book } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import BookCarousel from "@/shared/ui/BookCarousel/BookCarousel";

type BookSeriesBlockProps = {
	book: Book;
};

const BookSeriesBlock = ({ book }: BookSeriesBlockProps) => {
	const seriesBooks = book.series?.books ?? [];
	const alternativeEditions = seriesBooks.filter(
		(seriesBook) =>
			seriesBook.relationType === "collection" ||
			seriesBook.relationType === "omnibus" ||
			seriesBook.orderInSeries === 0,
	);
	const mainSeriesBooks = seriesBooks.filter(
		(seriesBook) => !alternativeEditions.includes(seriesBook),
	);
	const sortedMainSeriesBooks = [...mainSeriesBooks].sort(
		(firstBook, secondBook) =>
			(firstBook.orderInSeries ?? 999) - (secondBook.orderInSeries ?? 999),
	);
	const sortedAlternativeEditions = [...alternativeEditions].sort(
		(firstBook, secondBook) =>
			(firstBook.seriesLabel ?? firstBook.title).localeCompare(
				secondBook.seriesLabel ?? secondBook.title,
			),
	);

	if (
		!book.series ||
		(sortedMainSeriesBooks.length === 0 &&
			sortedAlternativeEditions.length === 0)
	) {
		return null;
	}

	return (
		<SeriesSection>
			{sortedMainSeriesBooks.length > 0 ? (
				<SeriesGroup>
					<Title>{book.series.title ?? "Книги серии"}</Title>
					<BookCarousel
						activeBookId={book.id}
						bleed={false}
						books={sortedMainSeriesBooks}
						size="compact"
					/>
				</SeriesGroup>
			) : null}

			{sortedAlternativeEditions.length > 0 ? (
				<SeriesGroup>
					<Subtitle>Альтернативные издания</Subtitle>
					<BookCarousel
						activeBookId={book.id}
						bleed={false}
						books={sortedAlternativeEditions}
						size="compact"
					/>
				</SeriesGroup>
			) : null}
		</SeriesSection>
	);
};

export default BookSeriesBlock;

const SeriesSection = styled.section`
	display: flex;
	flex-direction: column;
	gap: 2rem;
	margin-top: 1.6rem;
`;

const SeriesGroup = styled.div`
	min-width: 0;
`;

const Title = styled.h2`
	margin: 0 0 1.1rem;
	color: ${theme.colors.black};
	font-family: ${theme.fonts.serif};
	font-size: 1.75rem;
	font-weight: 500;
	line-height: 1.2;
`;

const Subtitle = styled.h3`
	margin: 0 0 1rem;
	color: ${theme.colors.black};
	font-family: ${theme.fonts.serif};
	font-size: 1.35rem;
	font-weight: 500;
	line-height: 1.2;
`;
