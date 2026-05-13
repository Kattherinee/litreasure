"use client";

import styled from "styled-components";

import { useBookQuery } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import BookSliderSection from "@/shared/ui/BookSliderSection/BookSliderSection";

import BookDetailContent from "./book-details/BookDetailContent";

type BookDetailsPageProps = {
	slug: string;
};

const BookDetailsPage = ({ slug }: BookDetailsPageProps) => {
	const { data: book, error, isError, isLoading } = useBookQuery(slug);

	if (isLoading) {
		return (
			<Page>
				<StateMessage>Загружаем книгу...</StateMessage>
			</Page>
		);
	}

	if (isError) {
		return (
			<Page>
				<StateMessage>Не удалось загрузить книгу: {error.message}</StateMessage>
			</Page>
		);
	}

	if (!book) {
		return (
			<Page>
				<StateMessage>Книга не найдена.</StateMessage>
			</Page>
		);
	}

	return (
		<Page>
			<BookDetailContent book={book} />
			<RelatedSection>
				<BookSliderSection
					genre={book.genres[0]}
					limit={20}
					sort="rating"
					title="Вам понравится"
				/>
			</RelatedSection>
		</Page>
	);
};

export default BookDetailsPage;

const Page = styled.div`
	--book-detail-width: 76.75rem;

	min-height: 100dvh;
	overflow-x: hidden;
	background: ${theme.colors.background};
	padding-bottom: 7rem;
`;

const StateMessage = styled.p`
	width: min(calc(100% - 3rem), var(--book-detail-width));
	margin: 0 auto;
	padding-top: 5rem;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;

const RelatedSection = styled.section`
	margin-top: 5rem;
`;
