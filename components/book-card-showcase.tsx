"use client";

import styled from "styled-components";

import books from "@/components/book-card.mock.json";
import BookCarousel from "@/shared/ui/BookCarousel/BookCarousel";

const BookCardShowcase = () => {
	return (
		<ShowcasePage>
			<ShowcasePanel>
				<BookCarousel books={books} />
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
			rgb(254 127 45 / 0.18),
			transparent 28%
		),
		linear-gradient(180deg, #efe8e3 0%, var(--background) 100%);
	padding: clamp(48px, 5vw, 72px) clamp(24px, 2.78vw, 40px);
`;

const ShowcasePanel = styled.section`
	margin: 0 auto;
	display: flex;
	max-width: 1240px;
	flex-direction: column;
	gap: clamp(24px, 2.22vw, 32px);
`;
