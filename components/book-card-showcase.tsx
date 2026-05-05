"use client";

import styled from "styled-components";

import books from "@/components/book-card.mock.json";
import { BookCard } from "@/shared/ui/BookCard";
import { InputField } from "@/shared/ui/InputField";

const BookCardShowcase = () => {
	return (
		<ShowcasePage>
			<ShowcasePanel>
				<ShowcaseContent>
					<ShowcaseGrid>
						{books.map((book) => (
							<ShowcaseItem key={book.id}>
								<BookCard book={book} />
							</ShowcaseItem>
						))}
					</ShowcaseGrid>

					<InputPreview aria-label="Состояния поля ввода">
						<InputPreviewItem>
							<InputField />
						</InputPreviewItem>
					</InputPreview>
				</ShowcaseContent>
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
	max-width: 1240px;
	flex-direction: column;
	gap: clamp(24px, 2.22vw, 32px);
`;

const ShowcaseContent = styled.div`
	display: grid;
	align-items: start;
	gap: clamp(32px, 4vw, 64px);

	@media (min-width: 1120px) {
		grid-template-columns: minmax(0, 1fr) minmax(360px, 446px);
	}
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

const InputPreview = styled.div`
	display: flex;
	width: min(100%, 446px);
	flex-direction: column;
	gap: 8px;
	padding: 8px 0;
`;

const InputPreviewItem = styled.label`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;
