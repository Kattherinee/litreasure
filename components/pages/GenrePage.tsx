"use client";

import Link from "next/link";
import styled from "styled-components";

import { useBooksQuery } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { BookCard } from "@/shared/ui/BookCard";

const genreCopy: Record<string, { title: string; description: string }> = {
	fantasy: {
		title: "Фэнтези",
		description:
			"Истории о мирах, где магия меняет правила, а выбор героя двигает сюжет.",
	},
	detective: {
		title: "Детективы",
		description:
			"Книги для тех, кто любит распутывать мотивы, искать улики и сомневаться в очевидном.",
	},
	classics: {
		title: "Классика",
		description:
			"Произведения, которые выдерживают время и каждый раз открываются немного иначе.",
	},
};

type GenrePageProps = {
	slug: string;
};

const GenrePage = ({ slug }: GenrePageProps) => {
	const { data: books = [], error, isError, isLoading } = useBooksQuery();
	const genre = genreCopy[slug] ?? {
		title: "Жанр",
		description: "Подборка книг в выбранном жанре.",
	};
	const genreBooks = books.filter((book) => book.genres?.includes(slug));

	return (
		<Page>
			<Content>
				<BackLink href="/">На главную</BackLink>
				<Title>{genre.title}</Title>
				<Lead>{genre.description}</Lead>

				{isLoading ? (
					<StateMessage>Загружаем книги...</StateMessage>
				) : isError ? (
					<StateMessage>
						Не удалось загрузить книги: {error.message}
					</StateMessage>
				) : genreBooks.length === 0 ? (
					<StateMessage>В этом жанре пока нет книг.</StateMessage>
				) : (
					<BookGrid>
						{genreBooks.map((book) => (
							<BookItem key={book.id}>
								<BookCard book={book} />
							</BookItem>
						))}
					</BookGrid>
				)}
			</Content>
		</Page>
	);
};

export default GenrePage;

const Page = styled.main`
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
	display: grid;
	gap: clamp(1.5rem, 3vw, 2.5rem);
	grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
	margin-top: clamp(2.5rem, 5vw, 4rem);
`;

const BookItem = styled.div``;
