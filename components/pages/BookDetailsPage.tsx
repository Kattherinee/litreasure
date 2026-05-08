"use client";

import Link from "next/link";
import styled from "styled-components";

import books from "@/components/book-card.mock.json";
import type { BookCardData } from "@/shared/ui/BookCard";

type BookDetailsPageProps = {
	slug: string;
};

const getBook = (slug: string): BookCardData =>
	books.find((book) => book.id === slug) ?? books[0];

const BookDetailsPage = ({ slug }: BookDetailsPageProps) => {
	const book = getBook(slug);

	return (
		<Page>
			<Content>
				<BackLink href="/genres/fantasy">Назад к жанру</BackLink>

				<BookLayout>
					<CoverWrap>
						<Cover src={book.imageUrl} alt={`Обложка «${book.Name}»`} />
					</CoverWrap>

					<BookInfo>
						<Author>{book.Author}</Author>
						<Title>{book.Name}</Title>
						<Rating>Рейтинг {book.rating} из 5</Rating>
						<Description>
							Страница книги с основной информацией, рейтингом и местом для
							будущего описания, отзывов и действий пользователя.
						</Description>
						<ActionRow>
							<ActionButton type="button">Добавить в коллекцию</ActionButton>
							<SecondaryLink href="/">Продолжить поиск</SecondaryLink>
						</ActionRow>
					</BookInfo>
				</BookLayout>
			</Content>
		</Page>
	);
};

export default BookDetailsPage;

const Page = styled.main`
	min-height: 100dvh;
	background:
		linear-gradient(90deg, rgb(35 61 77 / 0.08), transparent 42%),
		var(--background);
	padding: clamp(3rem, 5vw, 4.5rem) clamp(1.5rem, 2.78vw, 2.5rem);
`;

const Content = styled.section`
	margin: 0 auto;
	max-width: 77.5rem;
`;

const BackLink = styled(Link)`
	display: inline-flex;
	margin-bottom: 1.5rem;
	color: var(--orange-dark);
	font-size: 0.9375rem;
	text-decoration: none;

	&:hover {
		text-decoration: underline;
	}
`;

const BookLayout = styled.div`
	display: grid;
	align-items: start;
	gap: clamp(2rem, 5vw, 5rem);
	grid-template-columns: minmax(14rem, 22rem) minmax(0, 1fr);

	@media (max-width: 48rem) {
		grid-template-columns: 1fr;
	}
`;

const CoverWrap = styled.div`
	overflow: hidden;
	width: min(100%, 22rem);
	border: 0.0625rem solid var(--border);
	border-radius: 0.5rem;
	background: var(--surface);
`;

const Cover = styled.img`
	display: block;
	width: 100%;
	aspect-ratio: 0.68;
	object-fit: cover;
`;

const BookInfo = styled.div`
	padding-top: clamp(0rem, 2vw, 2rem);
`;

const Author = styled.p`
	margin: 0 0 0.75rem;
	color: var(--orange-dark);
	font-size: 1rem;
	font-weight: 700;
`;

const Title = styled.h1`
	max-width: 42rem;
	margin: 0;
	font-family: var(--font-serif);
	font-size: clamp(2.75rem, 6vw, 5rem);
	font-weight: 600;
	line-height: 1;
`;

const Rating = styled.p`
	margin: 1.25rem 0 0;
	color: var(--foreground);
	font-size: 1rem;
	font-weight: 700;
`;

const Description = styled.p`
	max-width: 36rem;
	margin: 1.25rem 0 0;
	color: var(--soft-foreground);
	font-size: 1.125rem;
	line-height: 1.55;
`;

const ActionRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-top: 2rem;
`;

const ActionButton = styled.button`
	border: 0;
	border-radius: 62.4375rem;
	background: var(--blue-primary);
	padding: 0.875rem 1.25rem;
	color: var(--lightText);
	cursor: pointer;
	font: inherit;
	font-weight: 700;
`;

const SecondaryLink = styled(Link)`
	display: inline-flex;
	align-items: center;
	color: var(--orange-dark);
	font-weight: 700;
	text-decoration: none;

	&:hover {
		text-decoration: underline;
	}
`;
