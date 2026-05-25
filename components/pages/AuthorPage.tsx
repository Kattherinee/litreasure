"use client";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import AuthModal, { type IAuthModalMode } from "@/components/pages/AuthModal";
import {
	ResultsBadge as BaseResultsBadge,
	ResultsNumber as TotalNumber,
	ResultsText as TotalText,
} from "@/components/pages/AuthorsFilters";
import {
	type IAuthorBookSort,
	useDeleteAuthorMutation,
	useAuthorQuery,
	useSaveAuthorMutation,
	useUnsaveAuthorMutation,
	useUpdateAuthorMutation,
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

const bookSortOptions: Array<{ label: string; value: IAuthorBookSort }> = [
	{ label: "Порядок серии", value: "series_order" },
	{ label: "Популярные", value: "popular" },
	{ label: "А-Z", value: "title_asc" },
	{ label: "Z-А", value: "title_desc" },
];

const AuthorPage = ({ id }: IAuthorPageProps) => {
	const router = useRouter();
	const [authModalMode, setAuthModalMode] = useState<IAuthModalMode | null>(
		null,
	);
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
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [editName, setEditName] = useState("");
	const [editBio, setEditBio] = useState("");
	const [editPhotoUrl, setEditPhotoUrl] = useState("");
	const [actionMessage, setActionMessage] = useState("");
	const [bookSort, setBookSort] = useState<IAuthorBookSort>("series_order");
	const bioRef = useRef<HTMLParagraphElement | null>(null);
	const {
		data: author,
		error,
		isError,
		isLoading,
	} = useAuthorQuery(id, {
		bookSort,
	});
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const saveAuthorMutation = useSaveAuthorMutation();
	const unsaveAuthorMutation = useUnsaveAuthorMutation();
	const updateAuthorMutation = useUpdateAuthorMutation();
	const deleteAuthorMutation = useDeleteAuthorMutation();
	const saveSeriesMutation = useSaveSeriesMutation();
	const unsaveSeriesMutation = useUnsaveSeriesMutation();
	const isAuthorSavePending =
		saveAuthorMutation.isPending || unsaveAuthorMutation.isPending;
	const isSeriesSavePending =
		saveSeriesMutation.isPending || unsaveSeriesMutation.isPending;
	const isAuthorSaved = authorSavedOverride ?? author?.isSaved ?? false;
	const isMyAuthor = author?.isPublic === false;

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

	const openEditAuthor = () => {
		if (!author) return;

		setEditName(author.name);
		setEditBio(author.bio ?? "");
		setEditPhotoUrl(author.photoUrl ?? "");
		setIsEditOpen(true);
	};

	const toggleSeriesExpanded = (seriesId: string) => {
		setExpandedSeries((currentState) => ({
			...currentState,
			[seriesId]: !currentState[seriesId],
		}));
	};

	const handleBookSortChange = (nextSort: IAuthorBookSort) => {
		setBookSort(nextSort);
		setExpandedSeries({});
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

	const saveAuthorChanges = async () => {
		if (!author) return;

		const name = editName.trim();
		setActionMessage("");

		if (!name) {
			setActionMessage("Имя автора обязательно");
			return;
		}

		try {
			await updateAuthorMutation.mutateAsync({
				id: author.id,
				payload: {
					bio: editBio.trim() || undefined,
					name,
					photoUrl: editPhotoUrl.trim() || undefined,
				},
			});
			setIsEditOpen(false);
			setActionMessage("Автор обновлен");
		} catch (error) {
			setActionMessage(
				error instanceof Error ? error.message : "Не удалось обновить автора",
			);
		}
	};

	const deleteAuthor = async () => {
		if (!author) return;

		setActionMessage("");
		try {
			await deleteAuthorMutation.mutateAsync(author.id);
			router.push("/authors");
		} catch (error) {
			setActionMessage(
				error instanceof Error ? error.message : "Не удалось удалить автора",
			);
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
					<StateMessage>
						Не удалось загрузить автора: {error.message}
					</StateMessage>
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
									<span>
										{isAuthorSavePending ? "Сохраняем..." : "Вы подписаны"}
									</span>
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
						{isMyAuthor ? (
							<OwnerActions aria-label="Действия с вашим автором">
								<OwnerActionButton type="button" onClick={openEditAuthor}>
									Редактировать
								</OwnerActionButton>
								<DangerActionButton
									type="button"
									disabled={deleteAuthorMutation.isPending}
									onClick={() => setIsDeleteConfirmOpen(true)}
								>
									Удалить
								</DangerActionButton>
							</OwnerActions>
						) : null}
						{actionMessage ? (
							<ActionMessage role="status">{actionMessage}</ActionMessage>
						) : null}
						<Facts>
							<TotalBadge aria-label={`Всего книг автора: ${author.bookCount}`}>
								<TotalNumber>{author.bookCount}</TotalNumber>
								<TotalText>всего книг</TotalText>
							</TotalBadge>
							{author.topGenres && author.topGenres.length > 0 ? (
								<GenreChips aria-label="Жанры автора">
									{author.topGenres.map((genre) => (
										<AuthorGenrePill
											key={genre.id}
											href={`/genres/${genre.slug}`}
										>
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

				{author.bookCount > 0 ? (
					<BooksToolbar>
						<SortLabel htmlFor="author-books-sort">Сортировка книг</SortLabel>
						<SortSelect
							id="author-books-sort"
							value={bookSort}
							onChange={(event) =>
								handleBookSortChange(event.target.value as IAuthorBookSort)
							}
						>
							{bookSortOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</SortSelect>
					</BooksToolbar>
				) : null}

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
														seriesTotal: series.books.length,
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
				{isEditOpen ? (
					<ModalOverlay
						role="presentation"
						onMouseDown={() => setIsEditOpen(false)}
					>
						<EditDialog
							aria-modal="true"
							role="dialog"
							aria-labelledby="edit-author-title"
							onMouseDown={(event) => event.stopPropagation()}
						>
							<ModalTitle id="edit-author-title">
								Редактировать автора
							</ModalTitle>
							<EditForm onSubmit={(event) => event.preventDefault()}>
								<EditField>
									<span>Имя</span>
									<input
										value={editName}
										onChange={(event) => setEditName(event.target.value)}
									/>
								</EditField>
								<EditField>
									<span>Фото URL</span>
									<input
										value={editPhotoUrl}
										onChange={(event) => setEditPhotoUrl(event.target.value)}
									/>
								</EditField>
								<EditField>
									<span>Биография</span>
									<textarea
										value={editBio}
										onChange={(event) => setEditBio(event.target.value)}
									/>
								</EditField>
								<ModalActions>
									<OwnerActionButton
										type="button"
										onClick={() => setIsEditOpen(false)}
									>
										Отмена
									</OwnerActionButton>
									<SaveActionButton
										disabled={updateAuthorMutation.isPending}
										type="button"
										onClick={() => void saveAuthorChanges()}
									>
										{updateAuthorMutation.isPending
											? "Сохраняем..."
											: "Сохранить"}
									</SaveActionButton>
								</ModalActions>
							</EditForm>
						</EditDialog>
					</ModalOverlay>
				) : null}
				{isDeleteConfirmOpen ? (
					<ModalOverlay
						role="presentation"
						onMouseDown={() => setIsDeleteConfirmOpen(false)}
					>
						<ConfirmDialog
							aria-modal="true"
							role="dialog"
							aria-labelledby="delete-author-title"
							onMouseDown={(event) => event.stopPropagation()}
						>
							<ModalTitle id="delete-author-title">Удалить автора?</ModalTitle>
							<ConfirmText>
								Автор исчезнет из вашего списка, а связь с его книгами будет
								удалена.
							</ConfirmText>
							<ModalActions>
								<OwnerActionButton
									type="button"
									onClick={() => setIsDeleteConfirmOpen(false)}
								>
									Отмена
								</OwnerActionButton>
								<DangerActionButton
									type="button"
									disabled={deleteAuthorMutation.isPending}
									onClick={() => void deleteAuthor()}
								>
									{deleteAuthorMutation.isPending ? "Удаляем..." : "Удалить"}
								</DangerActionButton>
							</ModalActions>
						</ConfirmDialog>
					</ModalOverlay>
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

const OwnerActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
	margin-top: 0.9rem;
`;

const OwnerActionButton = styled.button`
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 999px;
	background: ${theme.colors.surface};
	padding: 0.55rem 0.95rem;
	color: ${theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.88rem;
	font-weight: 700;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.orangeDark};
		outline: none;
	}

	&:disabled {
		cursor: progress;
		opacity: 0.62;
	}
`;

const DangerActionButton = styled(OwnerActionButton)`
	border-color: rgb(180 58 58 / 0.34);
	background: rgb(180 58 58 / 0.08);
	color: #9c2f2f;

	&:hover,
	&:focus-visible {
		background: rgb(180 58 58 / 0.14);
		color: #9c2f2f;
	}
`;

const ActionMessage = styled.p`
	margin: 0.7rem 0 0;
	color: ${theme.colors.orangeDark};
	font-size: 0.92rem;
	font-weight: 700;
	line-height: 1.35;
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

const BooksToolbar = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: 0.55rem;
	margin-top: 1.25rem;
`;

const SortLabel = styled.label`
	color: ${theme.colors.softForeground};
	font-size: 0.9rem;
	font-weight: 700;
`;

const SortSelect = styled.select`
	min-height: 2.35rem;
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 999px;
	background: ${theme.colors.surface};
	padding: 0.45rem 0.85rem;
	color: ${theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.9rem;

	&:focus {
		border-color: ${theme.colors.orangeLight};
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

const ModalOverlay = styled.div`
	position: fixed;
	z-index: 90;
	inset: 0;
	display: grid;
	place-items: center;
	background: rgb(4 18 26 / 0.52);
	padding: 1rem;
`;

const EditDialog = styled.section`
	width: min(100%, 34rem);
	max-height: min(92dvh, 42rem);
	overflow: auto;
	border-radius: 1rem;
	background: ${theme.colors.surface};
	padding: 1.5rem;
	box-shadow: 0 1.25rem 3rem rgb(4 18 26 / 0.18);
`;

const ConfirmDialog = styled(EditDialog)`
	width: min(100%, 28rem);
`;

const ModalTitle = styled.h2`
	margin: 0 0 1rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.55rem;
	line-height: 1.2;
`;

const EditForm = styled.form`
	display: grid;
	gap: 0.9rem;
`;

const EditField = styled.label`
	display: grid;
	gap: 0.35rem;
	color: ${theme.colors.foreground};
	font-size: 0.88rem;
	font-weight: 700;

	input,
	textarea {
		width: 100%;
		border: 0.0625rem solid rgb(211 202 196 / 0.82);
		border-radius: 0.7rem;
		background: rgb(255 255 255 / 0.56);
		padding: 0.65rem 0.75rem;
		color: ${theme.colors.foreground};
		font: inherit;
		font-weight: 400;
	}

	textarea {
		min-height: 8rem;
		resize: vertical;
	}

	input:focus,
	textarea:focus {
		border-color: ${theme.colors.orangeLight};
		outline: none;
	}
`;

const ConfirmText = styled.p`
	margin: 0 0 1.15rem;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.45;
`;

const ModalActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 0.65rem;
`;
