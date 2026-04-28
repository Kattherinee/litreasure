"use client";

import styled from "styled-components";

import BookCard from "@/components/bookCard";
import books from "@/components/book-card.mock.json";

const BookCardShowcase = () => {
	return (
		<ShowcasePage>
			<ShowcasePanel>
				<ShowcaseGrid>
					{books.map((book) => (
						<ShowcaseItem key={book.id}>
							<BookCard book={book} />
						</ShowcaseItem>
					))}
				</ShowcaseGrid>
			</ShowcasePanel>
		</ShowcasePage>
	);
};

export default BookCardShowcase;

const ShowcasePage = styled.main`
	min-height: 100vh;
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
	max-width: 980px;
	flex-direction: column;
	gap: clamp(24px, 2.22vw, 32px);
`;

const ShowcaseGrid = styled.div`
	display: grid;
	align-items: start;
	justify-content: start;
	gap: clamp(32px, 3.33vw, 48px);

	@media (min-width: 768px) {
		grid-template-columns: repeat(
			3,
			minmax(clamp(160px, 13.125vw, 189px), max-content)
		);
	}
`;

const ShowcaseItem = styled.div`
	display: flex;
	flex-direction: column;
	padding: clamp(16px, 1.39vw, 20px);
	background: transparent;
	box-shadow: none;
`;
