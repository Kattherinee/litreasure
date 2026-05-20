"use client";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

import AuthModal, { type IAuthModalMode } from "@/components/pages/AuthModal";
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

	const requestAuth = () => {
		setAuthModalMode("login");
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
								</SavedActionButton>
							) : (
								<SaveActionButton
									disabled={isAuthorSavePending}
									type="button"
									onClick={() => void handleToggleAuthorSave()}
								>
									{isAuthorSavePending ? "Сохраняем..." : "Сохранить автора"}
								</SaveActionButton>
							)}
						</TitleRow>
						<Facts>
							<span>{author.bookCount} книг</span>
							{author.mainGenre ? (
								<Link href={`/genres/${author.mainGenre.slug}`}>
									{author.mainGenre.name}
								</Link>
							) : null}
						</Facts>
						{author.bio ? <Bio>{author.bio}</Bio> : null}
					</HeroCopy>
				</Hero>

				{author.series.length > 0 ? (
					<Section>
						<SectionTitle>Серии</SectionTitle>
						<SeriesList>
							{author.series.map((series) => (
								<SeriesCard key={series.id}>
									<SeriesHeader>
										<SeriesTitle>{series.title}</SeriesTitle>
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
												{isSeriesSavePending ? "Сохраняем..." : "Сохранить серию"}
											</SaveActionButton>
										)}
									</SeriesHeader>
									<BookGrid>
										{series.books.map((book) => (
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
								</SeriesCard>
							))}
						</SeriesList>
					</Section>
				) : null}

				{author.books.length > 0 ? (
					<Section>
						<SectionTitle>Книги</SectionTitle>
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
	width: min(100%, ${theme.layout.contentMaxWidth});
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
	gap: 1.5rem;
	grid-template-columns: 9rem minmax(0, 1fr);
	border-radius: 1.25rem;
	background: ${theme.colors.white};
	padding: clamp(1rem, 3vw, 2rem);

	@media (max-width: 38rem) {
		grid-template-columns: 1fr;
	}
`;

const AuthorPhoto = styled.span<{ $photoUrl?: string }>`
	display: inline-flex;
	width: 9rem;
	height: 9rem;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: ${({ $photoUrl }) =>
		$photoUrl
			? `url("${$photoUrl}") center / cover no-repeat`
			: theme.colors.surface};
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.serif};
	font-size: 3rem;
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
	font-size: clamp(2.25rem, 5vw, 4.5rem);
	font-weight: 600;
	line-height: 1;
`;

const SaveActionButton = styled.button`
	flex: 0 0 auto;
	border: 0;
	border-radius: 999rem;
	background: ${theme.colors.white};
	padding: 0.56rem 1rem;
	color: ${theme.colors.bluePrimary};
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
		color: ${theme.colors.invertedText};
		outline: none;
	}

	&:disabled {
		cursor: progress;
		opacity: 0.72;
	}
`;

const SavedActionButton = styled.button`
	display: inline-grid;
	flex: 0 0 auto;
	width: 2.5rem;
	height: 2.5rem;
	place-items: center;
	border: 0;
	border-radius: 50%;
	background: ${theme.colors.white};
	color: ${theme.colors.orangeLight};
	cursor: pointer;
	transition:
		color 180ms ease,
		transform 180ms ease;

	svg {
		width: 1.45rem;
		height: 1.45rem;
	}

	&:hover,
	&:focus-visible {
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
	gap: 0.75rem;
	margin-top: 0.75rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.95rem;
	line-height: 1.4;

	a {
		color: inherit;
		text-decoration: underline;
	}
`;

const Bio = styled.p`
	max-width: 48rem;
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.6;
`;

const Section = styled.section`
	margin-top: 2rem;
`;

const SectionTitle = styled.h2`
	margin: 0 0 1rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.75rem;
	font-weight: 600;
	line-height: 1.2;
`;

const SeriesList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
`;

const SeriesCard = styled.section`
	border-radius: 1rem;
	background: rgb(242 239 237 / 0.58);
	padding: 1rem;
`;

const SeriesHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
`;

const SeriesTitle = styled.h3`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.35rem;
	font-weight: 500;
	line-height: 1.2;
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
