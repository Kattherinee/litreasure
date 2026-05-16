"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

import { useAuthorsQuery } from "@/shared/api/authors";
import { theme } from "@/shared/theme";
import { SkeletonBlock } from "@/shared/ui/Skeleton";

const AuthorsPage = () => {
	const [page, setPage] = useState(1);
	const {
		data: authorsResponse,
		error,
		isError,
		isLoading,
	} = useAuthorsQuery({ limit: 20, page });
	const authors = authorsResponse?.items ?? [];
	const pages = authorsResponse?.pages ?? 1;
	const total = authorsResponse?.total ?? 0;
	const canGoPrev = page > 1;
	const canGoNext = page < pages;

	return (
		<Page>
			<Content>
				<Title>Авторы</Title>
				<Lead>Публичные авторы и ваши личные авторские записи.</Lead>

				{isLoading ? (
					<AuthorGrid aria-label="Загружаем авторов">
						{Array.from({ length: 8 }, (_, index) => (
							<AuthorSkeleton key={index} />
						))}
					</AuthorGrid>
				) : isError ? (
					<StateMessage>Не удалось загрузить авторов: {error.message}</StateMessage>
				) : authors.length === 0 ? (
					<StateMessage>Авторов пока нет.</StateMessage>
				) : (
					<>
						<ListSummary>
							Найдено авторов: {total}. Страница {page} из {pages}.
						</ListSummary>
						<AuthorGrid>
							{authors.map((author) => (
								<AuthorCard key={author.id} href={`/authors/${author.id}`}>
									<AuthorPhoto
										$photoUrl={author.photoUrl}
										aria-hidden={!author.photoUrl}
									>
										{author.photoUrl ? null : getInitials(author.name)}
									</AuthorPhoto>
									<AuthorMeta>
										<AuthorName>{author.name}</AuthorName>
										<AuthorFacts>
											<span>{author.bookCount} книг</span>
											{author.mainGenre ? (
												<span>{author.mainGenre.name}</span>
											) : null}
										</AuthorFacts>
										{author.bio ? <AuthorBio>{author.bio}</AuthorBio> : null}
									</AuthorMeta>
								</AuthorCard>
							))}
						</AuthorGrid>
						{pages > 1 ? (
							<Pagination>
								<PageButton
									disabled={!canGoPrev}
									type="button"
									onClick={() => setPage((current) => Math.max(1, current - 1))}
								>
									Назад
								</PageButton>
								<PageState>
									{page} / {pages}
								</PageState>
								<PageButton
									disabled={!canGoNext}
									type="button"
									onClick={() =>
										setPage((current) => Math.min(pages, current + 1))
									}
								>
									Вперёд
								</PageButton>
							</Pagination>
						) : null}
					</>
				)}
			</Content>
		</Page>
	);
};

export default AuthorsPage;

const getInitials = (value: string) =>
	value
		.split(/[\s._-]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");

const AuthorSkeleton = () => (
	<SkeletonCard>
		<SkeletonBlock $height="5rem" $radius="50%" $width="5rem" />
		<SkeletonColumn>
			<SkeletonBlock $height="1.45rem" $width="12rem" />
			<SkeletonBlock $height="1rem" $width="8rem" />
			<SkeletonBlock $height="1rem" $width="100%" />
		</SkeletonColumn>
	</SkeletonCard>
);

const Page = styled.div`
	min-height: 100dvh;
	background: ${theme.colors.background};
	padding: clamp(3rem, 5vw, 4.5rem) clamp(1.5rem, 2.78vw, 2.5rem);
`;

const Content = styled.section`
	width: min(100%, ${theme.layout.contentMaxWidth});
	margin: 0 auto;
`;

const Title = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
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

const ListSummary = styled.p`
	margin: 2rem 0 1rem;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.4;
`;

const AuthorGrid = styled.div`
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
	margin-top: 2rem;
`;

const AuthorCard = styled(Link)`
	display: grid;
	align-items: center;
	gap: 1rem;
	grid-template-columns: 5rem minmax(0, 1fr);
	border-radius: 1rem;
	background: ${theme.colors.white};
	padding: 1rem;
	color: inherit;
	text-decoration: none;
	transition:
		box-shadow 180ms ease,
		transform 180ms ease;

	&:hover,
	&:focus-visible {
		box-shadow: 0 0.75rem 1.5rem rgb(4 18 26 / 0.08);
		outline: none;
		transform: translateY(-0.0625rem);
	}
`;

const AuthorPhoto = styled.span<{ $photoUrl?: string }>`
	display: inline-flex;
	width: 5rem;
	height: 5rem;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: ${({ $photoUrl }) =>
		$photoUrl
			? `url("${$photoUrl}") center / cover no-repeat`
			: theme.colors.surface};
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.serif};
	font-size: 1.35rem;
	font-weight: 600;
`;

const AuthorMeta = styled.span`
	display: flex;
	min-width: 0;
	flex-direction: column;
	gap: 0.35rem;
`;

const AuthorName = styled.span`
	overflow: hidden;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.25rem;
	font-weight: 600;
	line-height: 1.15;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const AuthorFacts = styled.span`
	display: flex;
	flex-wrap: wrap;
	gap: 0.45rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.82rem;
	line-height: 1.3;
`;

const AuthorBio = styled.span`
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	color: ${theme.colors.softForeground};
	font-size: 0.9rem;
	line-height: 1.4;
`;

const SkeletonCard = styled.div`
	display: grid;
	align-items: center;
	gap: 1rem;
	grid-template-columns: 5rem minmax(0, 1fr);
	border-radius: 1rem;
	background: ${theme.colors.white};
	padding: 1rem;
`;

const SkeletonColumn = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`;

const StateMessage = styled.p`
	margin: 2.5rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;

const Pagination = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	margin-top: 2rem;
`;

const PageButton = styled.button`
	border: 0.0625rem solid ${theme.colors.orangeDark};
	border-radius: 62.4375rem;
	background: ${theme.colors.transparent};
	padding: 0.55rem 1rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	font-size: 0.95rem;
	font-weight: 700;

	&:not(:disabled):hover,
	&:not(:disabled):focus-visible {
		background: ${theme.colors.orangePrimary};
		border-color: ${theme.colors.orangePrimary};
		color: ${theme.colors.white};
		outline: none;
	}

	&:disabled {
		cursor: default;
		opacity: 0.45;
	}
`;

const PageState = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.4;
`;
