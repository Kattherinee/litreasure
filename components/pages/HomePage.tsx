"use client";

import styled from "styled-components";

import { useBooksQuery } from "@/shared/api/books";
import type { Book } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { BookOfTheWeekSlider } from "@/shared/ui/BookOfTheWeekSlider";
import { BookSliderSection } from "@/shared/ui/BookSliderSection";
import { GenreCarousel } from "@/shared/ui/GenreCarousel";
import type { GenreCarouselItem } from "@/shared/ui/GenreCarousel";

const genrePills: GenreCarouselItem[] = [
	{ slug: "fantasy", title: "Фэнтези" },
	{ slug: "fantastic", title: "Фантастика" },
	{ slug: "romance", title: "Романтика" },
	{ slug: "contemporary-prose", title: "Современная проза" },
	{ slug: "classics", title: "Классическая литература" },
	{ slug: "young-adult", title: "Young adult" },
	{ slug: "detective", title: "Детективы" },
	{ slug: "non-fiction", title: "Нон-фикшн" },
	{ slug: "adventure", title: "Приключения" },
	{ slug: "history", title: "История" },
];

const byGenre = (books: Book[], genre: string) =>
	books.filter((book) => book.genres?.includes(genre));

const HomePage = () => {
	const { data: books = [], error, isError, isLoading } = useBooksQuery();
	const fantasyBooks = byGenre(books, "fantasy");
	const classicsBooks = byGenre(books, "classics");
	const bookSections = [
		{
			title: "Популярное",
			href: "/genres/fantasy",
			books: fantasyBooks.length > 0 ? fantasyBooks : books,
		},
		{
			title: "Классика для полки",
			href: "/genres/classics",
			books: classicsBooks.length > 0 ? classicsBooks : [...books].reverse(),
		},
	];

	return (
		<Page>
			<CatalogHero>
				<CatalogHeroInner>
					<HeroCopy>
						<PageKicker>Litreasure</PageKicker>
						<PageTitle>Книжная лента</PageTitle>
					</HeroCopy>
					<HeroText>
						Подборки, жанры и карточки книг, которые удобно просматривать и
						сохранять в свою коллекцию.
					</HeroText>
				</CatalogHeroInner>
			</CatalogHero>

			<GenreCarousel genres={genrePills} />

			<Feed>
				{isLoading ? (
					<StateMessage>Загружаем книги...</StateMessage>
				) : isError ? (
					<StateMessage>
						Не удалось загрузить книги: {error.message}
					</StateMessage>
				) : books.length === 0 ? (
					<StateMessage>Пока нет книг для отображения.</StateMessage>
				) : (
					<>
						<BookSliderSection
							title={bookSections[0].title}
							href={bookSections[0].href}
							books={bookSections[0].books}
						/>
						<BookOfTheWeekSlider />
						<BookSliderSection
							title={bookSections[1].title}
							href={bookSections[1].href}
							books={bookSections[1].books}
						/>
					</>
				)}
			</Feed>
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
			${theme.alpha.orangeGlow},
			${theme.colors.transparent} 28%
		),
		linear-gradient(
			180deg,
			${theme.colors.backgroundTop} 0%,
			${theme.colors.background} 100%
		);
	padding-bottom: clamp(3rem, 5vw, 4.5rem);
`;

const CatalogHero = styled.section`
	background:
		radial-gradient(
			circle at 76% 18%,
			${theme.alpha.orangeGlow},
			${theme.colors.transparent} 28%
		),
		linear-gradient(
			135deg,
			${theme.colors.bluePrimary} 0%,
			${theme.colors.foreground} 100%
		);
`;

const CatalogHeroInner = styled.div`
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(18rem, 26rem);
	align-items: center;
	gap: clamp(2rem, 4vw, 4rem);
	width: min(calc(100% - 3rem), 77.5rem);
	margin: 0 auto;
	padding: clamp(2.25rem, 4.5vw, 4rem) 0 clamp(2.5rem, 4.5vw, 3.5rem);

	@media (max-width: 48rem) {
		grid-template-columns: 1fr;
		gap: 1.25rem;
		padding-bottom: 3.5rem;
	}
`;

const HeroCopy = styled.div`
	min-width: 0;
`;

const PageKicker = styled.p`
	margin: 0 0 0.75rem;
	color: ${theme.colors.orangePrimary};
	font-family: ${theme.fonts.sans};
	font-size: 0.8125rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	line-height: 1.2;
	text-transform: uppercase;
`;

const PageTitle = styled.h1`
	margin: 0;
	color: ${theme.colors.invertedText};
	font-family: ${theme.fonts.serif};
	font-size: clamp(3rem, 5vw, 4.5rem);
	font-weight: 600;
	line-height: 0.96;
`;

const HeroText = styled.p`
	max-width: 28rem;
	margin: 0;
	color: ${theme.colors.invertedText};
	font-family: ${theme.fonts.sans};
	font-size: 1rem;
	font-weight: 400;
	line-height: 1.55;
	opacity: 0.82;
`;

const Feed = styled.div`
	display: grid;
	gap: clamp(3rem, 5vw, 4.75rem);
	margin-top: clamp(2.25rem, 3.5vw, 3rem);
`;

const StateMessage = styled.p`
	width: min(calc(100% - 3rem), 77.5rem);
	margin: 0 auto;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 1rem;
	line-height: 1.5;
`;
