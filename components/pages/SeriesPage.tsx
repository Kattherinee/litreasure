"use client";

import Link from "next/link";
import styled from "styled-components";

import { useSeriesQuery } from "@/shared/api/series";
import { theme } from "@/shared/theme";
import { AuthorAvatar } from "@/shared/ui/AuthorAvatar";
import { BookResultCard } from "@/shared/ui/BookSearch/BookResultCard";
import { GenrePill } from "@/shared/ui/GenrePill";

interface ISeriesPageProps {
	id: string;
}

const noop = () => {};

const SeriesPage = ({ id }: ISeriesPageProps) => {
	const { data: series, error, isError, isLoading } = useSeriesQuery(id);

	if (isLoading) {
		return (
			<Page>
				<Content>
					<StateMessage>Загружаем серию...</StateMessage>
				</Content>
			</Page>
		);
	}

	if (isError) {
		return (
			<Page>
				<Content>
					<StateMessage>
						Не удалось загрузить серию: {error.message}
					</StateMessage>
				</Content>
			</Page>
		);
	}

	if (!series) {
		return (
			<Page>
				<Content>
					<StateMessage>Серия не найдена.</StateMessage>
				</Content>
			</Page>
		);
	}

	return (
		<Page>
			<Content>
				<BackLink href="/treasures">Мои сокровища</BackLink>
				<Hero>
					<SeriesCover $coverUrl={series.coverUrl} aria-hidden="true" />
					<HeroCopy>
						<Eyebrow>Серия</Eyebrow>
						<Title>{series.title}</Title>
						{series.authorName ? (
							<AuthorLine>
								<AuthorAvatar
									fontSize="0.8rem"
									name={series.authorName}
									photoUrl={series.authorPhotoUrl}
									size="2rem"
								/>
								{series.authorId ? (
									<AuthorLink href={`/authors/${series.authorId}`}>
										{series.authorName}
									</AuthorLink>
								) : (
									<AuthorName>{series.authorName}</AuthorName>
								)}
							</AuthorLine>
						) : null}
						<MetaRow>
							<MetaItem>
								<MetaValue>{series.bookCount ?? series.books.length}</MetaValue>
								<MetaLabel>книг в серии</MetaLabel>
							</MetaItem>
						</MetaRow>
						{series.description ? (
							<Description>{series.description}</Description>
						) : null}
					</HeroCopy>
				</Hero>

				{series.genres.length > 0 ? (
					<Section>
						<SectionTitle>Жанры серии</SectionTitle>
						<GenreList>
							{series.genres.map((genre) => (
								<GenrePill
									key={genre.id}
									fontSize="0.86rem"
									height="2rem"
									paddingBlock="0.42rem"
									paddingInline="0.78rem"
									href={`/genres/${genre.slug}`}
								>
									{genre.name}
								</GenrePill>
							))}
						</GenreList>
					</Section>
				) : null}

				<Section>
					<SectionTitle>Книги серии</SectionTitle>
					{series.books.length > 0 ? (
						<BookList>
							{series.books.map((book) => (
								<BookResultCard
									key={book.id}
									book={book}
									closeSearch={noop}
									query=""
									saveRecentSearch={noop}
								/>
							))}
						</BookList>
					) : (
						<StateMessage>В серии пока нет книг.</StateMessage>
					)}
				</Section>
			</Content>
		</Page>
	);
};

export default SeriesPage;

const Page = styled.div`
	min-height: 100dvh;
	background: ${theme.colors.background};
	padding: clamp(3rem, 5vw, 4.5rem) clamp(1.5rem, 2.78vw, 2.5rem);
`;

const Content = styled.section`
	width: min(100%, 70rem);
	margin: 0 auto;
`;

const BackLink = styled(Link)`
	display: inline-flex;
	margin-bottom: 1.5rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.9375rem;
	text-decoration: none;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.bluePrimary};
		outline: none;
	}
`;

const Hero = styled.section`
	display: grid;
	align-items: center;
	gap: clamp(1.2rem, 3vw, 2.2rem);
	grid-template-columns: minmax(8rem, 10rem) minmax(0, 1fr);
	border-radius: 1.25rem;
	background: rgb(255 255 255 / 0.5);
	padding: clamp(1.15rem, 2.45vw, 2rem);

	@media (max-width: 42rem) {
		grid-template-columns: 1fr;
	}
`;

const SeriesCover = styled.div<{ $coverUrl?: string }>`
	width: min(100%, 10rem);
	aspect-ratio: 2 / 3;
	border-radius: 0.75rem;
	background:
		linear-gradient(rgb(4 18 26 / 0.08), rgb(4 18 26 / 0.08)),
		url("${({ $coverUrl }) => $coverUrl || "/images/book-placeholder.svg"}")
			center / cover;
	box-shadow: 0 1rem 2rem rgb(4 18 26 / 0.14);
`;

const HeroCopy = styled.div`
	min-width: 0;
`;

const Eyebrow = styled.p`
	margin: 0 0 0.35rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: 0.04em;
	text-transform: uppercase;
`;

const Title = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: clamp(2.15rem, 5vw, 3.6rem);
	line-height: 1;
`;

const AuthorLine = styled.div`
	display: flex;
	align-items: center;
	gap: 0.55rem;
	margin-top: 0.8rem;
`;

const AuthorLink = styled(Link)`
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.95rem;
	text-decoration: none;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const AuthorName = styled.span`
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.95rem;
`;

const MetaRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	margin-top: 1.1rem;
`;

const MetaItem = styled.div`
	display: inline-flex;
	align-items: baseline;
	gap: 0.45rem;
	border-radius: 999px;
	background: rgb(242 239 237 / 0.82);
	padding: 0.45rem 0.75rem;
`;

const MetaValue = styled.span`
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.15rem;
	font-weight: 700;
	line-height: 1;
`;

const MetaLabel = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.82rem;
`;

const Description = styled.p`
	max-width: 44rem;
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.5;
`;

const Section = styled.section`
	margin-top: 1.5rem;
`;

const SectionTitle = styled.h2`
	margin: 0 0 0.85rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.45rem;
	line-height: 1.15;
`;

const GenreList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
`;

const BookList = styled.div`
	display: grid;
	gap: 0.35rem;
	border-radius: 1rem;
	background: rgb(255 255 255 / 0.35);
	padding: 0.45rem;
`;

const StateMessage = styled.p`
	margin: 2.5rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
`;
