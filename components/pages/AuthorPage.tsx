"use client";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import AuthModal, { type IAuthModalMode } from "@/components/pages/AuthModal";
import {
	ResultsBadge as BaseResultsBadge,
	ResultsNumber as TotalNumber,
	ResultsText as TotalText,
} from "@/components/pages/AuthorsFilters";
import {
	useAuthorQuery,
	useSaveAuthorMutation,
	useUnsaveAuthorMutation,
} from "@/shared/api/authors";
import {
	useSaveSeriesMutation,
	useUnsaveSeriesMutation,
} from "@/shared/api/series";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { BookCard } from "@/shared/ui/BookCard";
import { GenrePill } from "@/shared/ui/GenrePill";
import { BookCardSkeleton, SkeletonBlock } from "@/shared/ui/Skeleton";

interface IAuthorPageProps {
	id: string;
}

const AuthorPage = ({ id }: IAuthorPageProps) => {
	const [authModalMode, setAuthModalMode] = useState<IAuthModalMode | null>(null);
	const [authorSavedOverride, setAuthorSavedOverride] = useState<
		boolean | null
	>(null);
	const [savedSeriesOverrides, setSavedSeriesOverrides] = useState<
		Record<string, boolean>
	>({});
	const [isBioExpanded, setIsBioExpanded] = useState(false);
	const [canExpandBio, setCanExpandBio] = useState(false);
	const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>(
		{},
	);
	const bioRef = useRef<HTMLParagraphElement | null>(null);
	const { data: author, error, isError, isLoading } = useAuthorQuery(id);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const saveAuthorMutation = useSaveAuthorMutation();
	const unsaveAuthorMutation = useUnsaveAuthorMutation();
	const saveSeriesMutation = useSaveSeriesMutation();
	const unsaveSeriesMutation = useUnsaveSeriesMutation();
	const isAuthorSavePending =
		saveAuthorMutation.isPending || unsaveAuthorMutation.isPending;
	const isSeriesSavePending =
		saveSeriesMutation.isPending || unsaveSeriesMutation.isPending;
	const isAuthorSaved = authorSavedOverride ?? author?.isSaved ?? false;

	const getIsSeriesSaved = (seriesId: string, initialValue?: boolean) =>
		savedSeriesOverrides[seriesId] ?? initialValue ?? false;

	useEffect(() => {
		const bioNode = bioRef.current;

		if (!bioNode) {
			return;
		}

		const updateBioOverflow = () => {
			if (isBioExpanded) {
				return;
			}

			setCanExpandBio(bioNode.scrollHeight > bioNode.clientHeight + 1);
		};

		updateBioOverflow();

		const resizeObserver = new ResizeObserver(updateBioOverflow);
		resizeObserver.observe(bioNode);

		return () => {
			resizeObserver.disconnect();
		};
	}, [author?.bio, isBioExpanded]);

	const requestAuth = () => {
		setAuthModalMode("login");
	};

	const toggleSeriesExpanded = (seriesId: string) => {
		setExpandedSeries((currentState) => ({
			...currentState,
			[seriesId]: !currentState[seriesId],
		}));
	};

	const handleToggleAuthorSave = async () => {
		if (!author) {
			return;
		}

		if (!isAuthenticated) {
			requestAuth();
			return;
		}

		const wasSaved = isAuthorSaved;
		setAuthorSavedOverride(!wasSaved);

		try {
			if (wasSaved) {
				await unsaveAuthorMutation.mutateAsync(author.id);
			} else {
				await saveAuthorMutation.mutateAsync(author.id);
			}
		} catch {
			setAuthorSavedOverride(wasSaved);
		}
	};

	const handleToggleSeriesSave = async (
		seriesId: string,
		initialValue?: boolean,
	) => {
		if (!isAuthenticated) {
			requestAuth();
			return;
		}

		const wasSaved = getIsSeriesSaved(seriesId, initialValue);
		setSavedSeriesOverrides((currentState) => ({
			...currentState,
			[seriesId]: !wasSaved,
		}));

		try {
			if (wasSaved) {
				await unsaveSeriesMutation.mutateAsync(seriesId);
			} else {
				await saveSeriesMutation.mutateAsync(seriesId);
			}
		} catch {
			setSavedSeriesOverrides((currentState) => ({
				...currentState,
				[seriesId]: wasSaved,
			}));
		}
	};

	if (isLoading) {
		return (
			<Page>
				<Content>
					<SkeletonBlock $height="2rem" $width="8rem" />
					<Hero>
						<SkeletonBlock $height="9rem" $radius="50%" $width="9rem" />
						<HeroCopy>
							<SkeletonBlock $height="3rem" $width="min(100%, 28rem)" />
							<SkeletonBlock $height="1rem" $width="min(100%, 36rem)" />
							<SkeletonBlock $height="1rem" $width="min(100%, 30rem)" />
						</HeroCopy>
					</Hero>
					<BookGrid>
						{Array.from({ length: 6 }, (_, index) => (
							<BookCardSkeleton key={index} />
						))}
					</BookGrid>
				</Content>
			</Page>
		);
	}

	if (isError) {
		return (
			<Page>
				<Content>
					<StateMessage>Не удалось загрузить автора: {error.message}</StateMessage>
				</Content>
			</Page>
		);
	}

	if (!author) {
		return (
			<Page>
				<Content>
					<StateMessage>Автор не найден.</StateMessage>
				</Content>
			</Page>
		);
	}

	return (
		<Page>
			<Content>
				<BackLink href="/authors">К авторам</BackLink>
				<Hero>
					<AuthorPhoto $photoUrl={author.photoUrl}>
						{author.photoUrl ? null : author.name.charAt(0).toUpperCase()}
					</AuthorPhoto>
					<HeroCopy>
						<TitleRow>
							<Title>{author.name}</Title>
							{isAuthorSaved ? (
								<SavedActionButton
									aria-label="Убрать автора из сохраненных"
									disabled={isAuthorSavePending}
									title="Убрать из сохраненных"
									type="button"
									onClick={() => void handleToggleAuthorSave()}
								>
									<BookmarkIcon aria-hidden="true" />
									<span>{isAuthorSavePending ? "Сохраняем..." : "Вы подписаны"}</span>
								</SavedActionButton>
							) : (
								<SaveActionButton
									disabled={isAuthorSavePending}
									type="button"
									onClick={() => void handleToggleAuthorSave()}
								>
									{isAuthorSavePending ? "Сохраняем..." : "Подписаться"}
								</SaveActionButton>
							)}
						</TitleRow>
						<Facts>
							<TotalBadge aria-label={`Всего книг автора: ${author.bookCount}`}>
								<TotalNumber>{author.bookCount}</TotalNumber>
								<TotalText>всего книг</TotalText>
							</TotalBadge>
							{author.topGenres && author.topGenres.length > 0 ? (
								<GenreChips aria-label="Жанры автора">
									{author.topGenres.map((genre) => (
										<AuthorGenrePill key={genre.id} href={`/genres/${genre.slug}`}>
											{genre.name}
										</AuthorGenrePill>
									))}
								</GenreChips>
							) : null}
						</Facts>
						{author.bio ? (
							<BioWrap>
								<Bio ref={bioRef} $isExpanded={isBioExpanded}>
									{author.bio}
								</Bio>
								{canExpandBio || isBioExpanded ? (
									<BioToggle
										$isExpanded={isBioExpanded}
										type="button"
										onClick={() =>
											setIsBioExpanded((currentState) => !currentState)
										}
									>
										{isBioExpanded ? "Свернуть" : "Показать больше"}
									</BioToggle>
								) : null}
							</BioWrap>
						) : null}
					</HeroCopy>
				</Hero>

				{author.series.length > 0 ? (
					<Section>
						<SectionHeader>
							<SectionTitle>Серии</SectionTitle>
							<SectionStats>
								<TotalBadge aria-label={`Всего серий: ${author.series.length}`}>
									<TotalNumber>{author.series.length}</TotalNumber>
									<TotalText>всего</TotalText>
								</TotalBadge>
								<SectionHint>книги можно пролистать горизонтально</SectionHint>
							</SectionStats>
						</SectionHeader>
						<SeriesList>
							{author.series.map((series) => {
								const isExpanded = expandedSeries[series.id] ?? false;
								const canExpandSeries = series.books.length > 8;
								const visibleBooks = isExpanded
									? series.books
									: series.books.slice(0, 8);

								return (
									<SeriesCard key={series.id}>
										<SeriesHeader>
											<SeriesCopy>
												<SeriesTitle>{series.title}</SeriesTitle>
												<SeriesMeta
													aria-label={`Всего книг в серии: ${series.books.length}`}
												>
													<TotalNumber>{series.books.length}</TotalNumber>
													<TotalText>всего</TotalText>
												</SeriesMeta>
											</SeriesCopy>
										{getIsSeriesSaved(series.id, series.isSaved) ? (
											<SavedActionButton
												aria-label="Убрать серию из сохраненных"
												disabled={isSeriesSavePending}
												title="Убрать из сохраненных"
												type="button"
												onClick={() =>
													void handleToggleSeriesSave(
														series.id,
														series.isSaved,
													)
												}
											>
												<BookmarkIcon aria-hidden="true" />
											</SavedActionButton>
										) : (
											<SaveActionButton
												disabled={isSeriesSavePending}
												type="button"
												onClick={() =>
													void handleToggleSeriesSave(
														series.id,
														series.isSaved,
													)
												}
											>
												{isSeriesSavePending ? "Сохраняем..." : "Подписаться"}
											</SaveActionButton>
										)}
										</SeriesHeader>
										<SeriesBooksRail $isExpanded={isExpanded}>
											{visibleBooks.map((book) => (
												<BookCard
													key={book.id}
													book={{
														...book,
														author: author.name,
														relationType: book.seriesRelationType,
													}}
												/>
											))}
										</SeriesBooksRail>
										{canExpandSeries ? (
											<SeriesExpandButton
												$isExpanded={isExpanded}
												type="button"
												onClick={() => toggleSeriesExpanded(series.id)}
											>
												<span>
													{isExpanded
														? "Свернуть серию"
														: `Показать всю серию (+${series.books.length - visibleBooks.length})`}
												</span>
												<KeyboardArrowDownIcon aria-hidden="true" />
											</SeriesExpandButton>
										) : null}
									</SeriesCard>
								);
							})}
						</SeriesList>
					</Section>
				) : null}

				{author.books.length > 0 ? (
					<Section>
						<SectionHeader>
							<SectionTitle>Книги</SectionTitle>
							<TotalBadge aria-label={`Всего книг: ${author.books.length}`}>
								<TotalNumber>{author.books.length}</TotalNumber>
								<TotalText>всего</TotalText>
							</TotalBadge>
						</SectionHeader>
						<BookGrid>
							{author.books.map((book) => (
								<BookCard
									key={book.id}
									book={{
										...book,
										author: author.name,
										relationType: book.seriesRelationType,
									}}
								/>
							))}
						</BookGrid>
					</Section>
				) : null}
				{authModalMode ? (
					<AuthModal
						mode={authModalMode}
						redirectOnSuccess={false}
						onClose={() => setAuthModalMode(null)}
						onModeChange={setAuthModalMode}
					/>
				) : null}
			</Content>
		</Page>
	);
};

export default AuthorPage;

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

	&:hover {
		text-decoration: underline;
	}
`;

const Hero = styled.section`
	display: grid;
	align-items: center;
	gap: clamp(1rem, 2.2vw, 1.75rem);
	grid-template-columns: 7rem minmax(0, 1fr);
	border-radius: 1.25rem;
	background: ${theme.colors.white};
	padding: clamp(1.15rem, 2.45vw, 2rem);

	@media (max-width: 38rem) {
		grid-template-columns: 1fr;
	}
`;

const AuthorPhoto = styled.span<{ $photoUrl?: string }>`
	display: inline-flex;
	width: 7rem;
	height: 7rem;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: ${({ $photoUrl }) =>
		$photoUrl
			? `url("${$photoUrl}") center / cover no-repeat`
			: theme.colors.surface};
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.serif};
	font-size: 2.5rem;
	font-weight: 600;
`;

const HeroCopy = styled.div`
	min-width: 0;
`;

const TitleRow = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1rem;

	@media (max-width: 38rem) {
		flex-direction: column;
	}
`;

const Title = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: clamp(1.85rem, 3.1vw, 3rem);
	font-weight: 600;
	line-height: 1;
`;

const SaveActionButton = styled.button`
	display: inline-flex;
	flex: 0 0 auto;
	align-items: center;
	justify-content: center;
	border: 0.0625rem solid ${theme.colors.orangeLight};
	border-radius: 999rem;
	background: ${theme.colors.orangeLight};
	padding: 0.68rem 1.15rem;
	box-shadow: 0 0.55rem 1.15rem rgb(218 142 91 / 0.18);
	color: ${theme.colors.invertedText};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
	font-weight: 700;
	line-height: 1.2;
	transition:
		background 180ms ease,
		color 180ms ease;

	&:hover,
	&:focus-visible {
		background: ${theme.colors.bluePrimary};
		border-color: ${theme.colors.bluePrimary};
		color: ${theme.colors.invertedText};
		outline: none;
		box-shadow: 0 0.65rem 1.35rem rgb(35 61 77 / 0.18);
	}

	&:disabled {
		cursor: progress;
		opacity: 0.72;
	}
`;

const SavedActionButton = styled.button`
	display: inline-flex;
	flex: 0 0 auto;
	align-items: center;
	justify-content: center;
	gap: 0.45rem;
	border: 0.0625rem solid rgb(218 142 91 / 0.6);
	border-radius: 999rem;
	background: rgb(218 142 91 / 0.14);
	padding: 0.62rem 1rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
	font-weight: 700;
	line-height: 1.2;
	transition:
		background 180ms ease,
		color 180ms ease,
		transform 180ms ease;

	svg {
		width: 1.05rem;
		height: 1.05rem;
	}

	&:hover,
	&:focus-visible {
		background: rgb(218 142 91 / 0.2);
		color: ${theme.colors.orangeDark};
		outline: none;
		transform: translateY(-0.0625rem);
	}

	&:disabled {
		cursor: progress;
		opacity: 0.72;
		transform: none;
	}
`;

const Facts = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.55rem;
	margin-top: 0.95rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.95rem;
	line-height: 1.4;
`;

const GenreChips = styled.div`
	display: inline-flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.4rem;
`;

const AuthorGenrePill = styled(GenrePill)`
	min-height: 2rem;
	padding: 0.42rem 0.78rem;
	font-size: 0.84rem;
	font-weight: 700;
`;

const BioWrap = styled.div`
	position: relative;
	max-width: 42rem;
`;

const Bio = styled.p<{ $isExpanded: boolean }>`
	max-width: 42rem;
	margin: 1rem 0 0;
	overflow: hidden;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.6;
	overflow-wrap: anywhere;
	${({ $isExpanded }) =>
		$isExpanded
			? ""
			: `
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 4;
			`}
`;

const BioToggle = styled.button<{ $isExpanded: boolean }>`
	position: ${({ $isExpanded }) => ($isExpanded ? "static" : "absolute")};
	right: 0;
	bottom: 0.08rem;
	display: block;
	border: 0;
	background: linear-gradient(
		90deg,
		rgb(255 255 255 / 0),
		${theme.colors.white} 3rem,
		${theme.colors.white}
	);
	margin-top: ${({ $isExpanded }) => ($isExpanded ? "0.45rem" : "0")};
	margin-left: ${({ $isExpanded }) => ($isExpanded ? "auto" : "0")};
	padding: 0 0 0 3.6rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 0.95rem;
	line-height: 1.6;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangePrimary};
		outline: none;
	}
`;

const Section = styled.section`
	margin-top: 2rem;
`;

const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;

	@media (max-width: 42rem) {
		align-items: flex-start;
		flex-direction: column;
		gap: 0.25rem;
	}
`;

const SectionTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.75rem;
	font-weight: 600;
	line-height: 1.2;
`;

const SectionHint = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
	line-height: 1.35;
`;

const SectionStats = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 0.65rem;
	flex-wrap: wrap;
	justify-content: flex-end;
`;

const TotalBadge = styled(BaseResultsBadge)`
	min-height: 2.25rem;
`;

const SeriesList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
`;

const SeriesCard = styled.section`
	border: 0.0625rem solid rgb(218 142 91 / 0.16);
	border-radius: 1rem;
	background: rgb(242 239 237 / 0.58);
	padding: 1rem;
`;

const SeriesHeader = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
`;

const SeriesCopy = styled.div`
	min-width: 0;
`;

const SeriesTitle = styled.h3`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.35rem;
	font-weight: 500;
	line-height: 1.2;
`;

const SeriesMeta = styled(TotalBadge)`
	width: fit-content;
	margin: 0.25rem 0 0;
	min-height: 2rem;
	padding: 0.36rem 0.7rem;
`;

const SeriesBooksRail = styled.div<{ $isExpanded: boolean }>`
	display: flex;
	flex-wrap: ${({ $isExpanded }) => ($isExpanded ? "wrap" : "nowrap")};
	gap: 1rem;
	overflow-x: ${({ $isExpanded }) => ($isExpanded ? "visible" : "auto")};
	overflow-y: visible;
	padding: 0.15rem 0 0.55rem;
	scrollbar-color: ${theme.colors.orangeLight} rgb(242 239 237 / 0.72);
	scrollbar-width: thin;

	& > * {
		flex: 0 0 auto;
	}
`;

const SeriesExpandButton = styled.button<{ $isExpanded: boolean }>`
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	border: 0.0625rem solid rgb(237 160 108 / 0.42);
	border-radius: 62.4375rem;
	background: rgb(242 239 237 / 0.78);
	margin-top: 0.55rem;
	padding: 0.42rem 0.78rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 0.86rem;
	font-weight: 700;
	line-height: 1;

	svg {
		width: 1.1rem;
		height: 1.1rem;
		transform: rotate(${({ $isExpanded }) => ($isExpanded ? "180deg" : "0")});
		transition: transform 160ms ease;
	}

	&:hover,
	&:focus-visible {
		background: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
		outline: none;
	}
`;

const BookGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
`;

const StateMessage = styled.p`
	margin: 2.5rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;
