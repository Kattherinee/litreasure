"use client";

import styled from "styled-components";

import { useBooksQuery } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import BookCarousel from "@/shared/ui/BookCarousel/BookCarousel";

const BookCardShowcase = () => {
	const { data: books = [], error, isError, isLoading } = useBooksQuery();

	return (
		<ShowcasePage>
			<ShowcasePanel>
				{isLoading ? (
					<StateMessage>Загружаем книги...</StateMessage>
				) : isError ? (
					<StateMessage>
						Не удалось загрузить книги: {error.message}
					</StateMessage>
				) : (
					<BookCarousel books={books} />
				)}
			</ShowcasePanel>
		</ShowcasePage>
	);
};

export default BookCardShowcase;

const ShowcasePage = styled.main`
	min-height: 100dvh;
	overflow-x: clip;
	background:
		radial-gradient(
			circle at top left,
			${theme.alpha.orangeGlow},
			${theme.colors.transparent} 28%
		),
		linear-gradient(
			180deg,
			${theme.colors.backgroundTop} 0%,
			${theme.colors.background} 100%
		);
	padding: clamp(48px, 5vw, 72px) clamp(24px, 2.78vw, 40px);
`;

const ShowcasePanel = styled.section`
	margin: 0 auto;
	display: flex;
	max-width: 1240px;
	flex-direction: column;
	gap: clamp(24px, 2.22vw, 32px);
`;

const StateMessage = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;
