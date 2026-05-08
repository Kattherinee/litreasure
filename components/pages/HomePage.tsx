"use client";

import Link from "next/link";
import styled from "styled-components";

import books from "@/components/book-card.mock.json";
import BookCarousel from "@/shared/ui/BookCarousel/BookCarousel";

const genres = [
	{
		slug: "fantasy",
		title: "Фэнтези",
		description: "Магия, большие путешествия и герои, которым пора взрослеть.",
	},
	{
		slug: "detective",
		title: "Детективы",
		description: "Загадки, улики и истории, где каждая деталь может решить все.",
	},
	{
		slug: "classics",
		title: "Классика",
		description: "Книги, к которым возвращаются за языком, конфликтом и глубиной.",
	},
];

const HomePage = () => {
	return (
		<Page>
			<Hero>
				<Eyebrow>litreasure</Eyebrow>
				<Title>Найди книгу, которая останется с тобой</Title>
				<Lead>
					Собирай любимые истории, открывай жанры и возвращайся к книгам,
					которые хочется перечитывать.
				</Lead>
			</Hero>

			<Section>
				<SectionHeader>
					<SectionTitle>Популярные книги</SectionTitle>
				</SectionHeader>
				<BookCarousel books={books} />
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Жанры</SectionTitle>
				</SectionHeader>
				<GenreGrid>
					{genres.map((genre) => (
						<GenreCard key={genre.slug} href={`/genres/${genre.slug}`}>
							<GenreName>{genre.title}</GenreName>
							<GenreDescription>{genre.description}</GenreDescription>
						</GenreCard>
					))}
				</GenreGrid>
			</Section>
		</Page>
	);
};

export default HomePage;

const Page = styled.main`
	min-height: 100dvh;
	overflow-x: clip;
	background:
		radial-gradient(
			circle at top left,
			rgb(254 127 45 / 0.18),
			transparent 28%
		),
		linear-gradient(180deg, #efe8e3 0%, var(--background) 100%);
	padding: clamp(3rem, 5vw, 4.5rem) clamp(1.5rem, 2.78vw, 2.5rem);
`;

const Hero = styled.section`
	margin: 0 auto;
	max-width: 77.5rem;
	padding-bottom: clamp(3rem, 7vw, 6rem);
`;

const Eyebrow = styled.p`
	margin: 0 0 0.75rem;
	color: var(--orange-dark);
	font-size: 0.875rem;
	font-weight: 700;
	letter-spacing: 0;
	text-transform: uppercase;
`;

const Title = styled.h1`
	max-width: 45rem;
	margin: 0;
	color: var(--foreground);
	font-family: var(--font-serif);
	font-size: clamp(2.75rem, 6vw, 5.5rem);
	font-weight: 600;
	line-height: 0.98;
	letter-spacing: 0;
`;

const Lead = styled.p`
	max-width: 34rem;
	margin: 1.25rem 0 0;
	color: var(--soft-foreground);
	font-size: clamp(1rem, 1.5vw, 1.25rem);
	line-height: 1.5;
`;

const Section = styled.section`
	margin: 0 auto;
	max-width: 77.5rem;

	& + & {
		margin-top: clamp(3.5rem, 7vw, 6rem);
	}
`;

const SectionHeader = styled.div`
	margin-bottom: clamp(1.25rem, 2vw, 1.75rem);
`;

const SectionTitle = styled.h2`
	margin: 0;
	font-family: var(--font-serif);
	font-size: clamp(1.75rem, 3vw, 2.5rem);
	font-weight: 600;
	line-height: 1.1;
`;

const GenreGrid = styled.div`
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(3, minmax(0, 1fr));

	@media (max-width: 48rem) {
		grid-template-columns: 1fr;
	}
`;

const GenreCard = styled(Link)`
	display: flex;
	min-height: 10rem;
	flex-direction: column;
	justify-content: flex-end;
	border: 0.0625rem solid var(--border);
	border-radius: 0.5rem;
	background: rgb(242 239 237 / 0.64);
	padding: 1.25rem;
	color: inherit;
	text-decoration: none;
	transition:
		border-color 180ms ease,
		transform 180ms ease;

	&:hover {
		border-color: var(--orange-dark);
		transform: translateY(-0.125rem);
	}
`;

const GenreName = styled.h3`
	margin: 0;
	font-family: var(--font-serif);
	font-size: 1.5rem;
	font-weight: 600;
`;

const GenreDescription = styled.p`
	margin: 0.5rem 0 0;
	color: var(--soft-foreground);
	font-size: 0.9375rem;
	line-height: 1.45;
`;
