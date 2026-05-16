"use client";

import Link from "next/link";
import styled from "styled-components";

import { useCollectionQuery } from "@/shared/api/collections";
import { theme } from "@/shared/theme";
import { BookCard } from "@/shared/ui/BookCard";
import { BookCardSkeleton } from "@/shared/ui/Skeleton";

interface ICollectionPageProps {
	id: string;
}

const CollectionPage = ({ id }: ICollectionPageProps) => {
	const {
		data: collection,
		error,
		isError,
		isLoading,
	} = useCollectionQuery(id);

	return (
		<Page>
			<Content>
				<BackLink href="/collections">К подборкам</BackLink>

				{isLoading ? (
					<>
						<TitleSkeleton />
						<BookGrid aria-label="Загружаем книги подборки">
							{Array.from({ length: 10 }, (_, index) => (
								<BookItem key={index}>
									<BookCardSkeleton />
								</BookItem>
							))}
						</BookGrid>
					</>
				) : isError ? (
					<StateMessage>
						Не удалось загрузить подборку: {error.message}
					</StateMessage>
				) : collection ? (
					<>
						<Kicker>
							{collection.isPublic
								? "Публичная подборка"
								: "Приватная подборка"}
						</Kicker>
						<Title>{collection.title}</Title>
						<Lead>{collection.description || "Без описания."}</Lead>
						<Meta>
							<span>
								Автор: {collection.owner.name || collection.owner.username}
							</span>
							<span>
								{collection.bookCount} {collection.bookCount}
							</span>
						</Meta>

						{collection.books.length === 0 ? (
							<StateMessage>В этой подборке пока нет книг.</StateMessage>
						) : (
							<BookGrid>
								{collection.books.map((book) => (
									<BookItem key={book.id}>
										<BookCard book={book} />
									</BookItem>
								))}
							</BookGrid>
						)}
					</>
				) : null}
			</Content>
		</Page>
	);
};

export default CollectionPage;

const Page = styled.div`
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

const Kicker = styled.p`
	margin: 0 0 0.75rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.8rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	line-height: 1.2;
	text-transform: uppercase;
`;

const Title = styled.h1`
	max-width: 58rem;
	margin: 0;
	font-family: ${theme.fonts.serif};
	font-size: clamp(2.75rem, 6vw, 5rem);
	font-weight: 600;
	line-height: 1;
	overflow-wrap: anywhere;
`;

const Lead = styled.p`
	max-width: 48rem;
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1.125rem;
	line-height: 1.55;
`;

const Meta = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1.25rem;
	margin-top: 1rem;
	color: ${theme.colors.lightText};
	font-size: 0.95rem;
	line-height: 1.4;
`;

const StateMessage = styled.p`
	margin: 2.5rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;

const BookGrid = styled.div`
	--book-card-column: 12rem;

	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, var(--book-card-column));
	justify-content: start;
	margin-top: clamp(2.5rem, 5vw, 4rem);
`;

const BookItem = styled.div`
	width: fit-content;
`;

const TitleSkeleton = styled.div`
	width: min(100%, 38rem);
	height: clamp(3rem, 7vw, 5rem);
	border-radius: 0.7rem;
	background: linear-gradient(
		135deg,
		rgb(242 239 237 / 0.72),
		rgb(211 202 196 / 0.72)
	);
`;
