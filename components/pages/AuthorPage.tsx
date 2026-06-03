"use client";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import AuthModal, { type IAuthModalMode } from "@/components/pages/AuthModal";
import { AuthorEditModal } from "@/components/pages/author/AuthorEditModal";
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
import { AuthorAvatar } from "@/shared/ui/AuthorAvatar";
import { BookCard } from "@/shared/ui/BookCard";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { GenrePill } from "@/shared/ui/GenrePill";
import { BookCardSkeleton, SkeletonBlock } from "@/shared/ui/Skeleton";

interface IAuthorPageProps {
	id: string;
}

const bookSortOptions: Array<{ label: string; value: IAuthorBookSort }> = [
	{ label: "Series order", value: "series_order" },
	{ label: "Popular", value: "popular" },
	{ label: "A-Z", value: "title_asc" },
	{ label: "Z-A", value: "title_desc" },
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
			setActionMessage("Author name is required");
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
			setActionMessage("Author updated");
		} catch (error) {
			setActionMessage(
				error instanceof Error ? error.message : "Could not update author",
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
				error instanceof Error ? error.message : "Could not delete author",
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
					<StateMessage>Could not load author: {error.message}</StateMessage>
				</Content>
			</Page>
		);
	}

	if (!author) {
		return (
			<Page>
				<Content>
					<StateMessage>Author not found.</StateMessage>
				</Content>
			</Page>
		);
	}

	return (
		<Page>
			<Content>
				<BackLink href="/authors">Back to authors</BackLink>
				<Hero>
					<AuthorAvatar
						fontSize="2.5rem"
						name={author.name}
						photoUrl={author.photoUrl}
						size="7rem"
					/>
					<HeroCopy>
						<TitleRow>
							<Title>{author.name}</Title>
							{isAuthorSaved ? (
								<SavedActionButton
									aria-label="Remove author from saved"
									disabled={isAuthorSavePending}
									title="Remove from saved"
									type="button"
									onClick={() => void handleToggleAuthorSave()}
								>
									<BookmarkIcon aria-hidden="true" />
									<span>
										{isAuthorSavePending ? "Saving..." : "Subscribed"}
									</span>
								</SavedActionButton>
							) : (
								<SaveActionButton
									disabled={isAuthorSavePending}
									type="button"
									onClick={() => void handleToggleAuthorSave()}
								>
									{isAuthorSavePending ? "Saving..." : "Subscribe"}
								</SaveActionButton>
							)}
						</TitleRow>
						{isMyAuthor ? (
							<OwnerActions aria-label="Actions for your author">
								<OwnerActionButton type="button" onClick={openEditAuthor}>
									Edit
								</OwnerActionButton>
								<DangerActionButton
									type="button"
									disabled={deleteAuthorMutation.isPending}
									onClick={() => setIsDeleteConfirmOpen(true)}
								>
									Delete
								</DangerActionButton>
							</OwnerActions>
						) : null}
						{actionMessage ? (
							<ActionMessage role="status">{actionMessage}</ActionMessage>
						) : null}
						<Facts>
							<TotalBadge
								aria-label={`Total author books: ${author.bookCount}`}
							>
								<TotalNumber>{author.bookCount}</TotalNumber>
								<TotalText>total books</TotalText>
							</TotalBadge>
							{author.topGenres && author.topGenres.length > 0 ? (
								<GenreChips aria-label="Author genres">
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
										{isBioExpanded ? "Collapse" : "Show more"}
									</BioToggle>
								) : null}
							</BioWrap>
						) : null}
					</HeroCopy>
				</Hero>

				{author.bookCount > 0 ? (
					<BooksToolbar>
						<SortLabel htmlFor="author-books-sort">Book sorting</SortLabel>
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
							<SectionTitle>Series</SectionTitle>
							<SectionStats>
								<TotalBadge
									aria-label={`Total series: ${author.series.length}`}
								>
									<TotalNumber>{author.series.length}</TotalNumber>
									<TotalText>total</TotalText>
								</TotalBadge>
								<SectionHint>books can be scrolled horizontally</SectionHint>
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
													aria-label={`Total books in series: ${series.books.length}`}
												>
													<TotalNumber>{series.books.length}</TotalNumber>
													<TotalText>total</TotalText>
												</SeriesMeta>
											</SeriesCopy>
											{getIsSeriesSaved(series.id, series.isSaved) ? (
												<SavedActionButton
													aria-label="Remove series from saved"
													disabled={isSeriesSavePending}
													title="Remove from saved"
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
													{isSeriesSavePending ? "Saving..." : "Subscribe"}
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
														? "Collapse series"
														: `Show full series (+${series.books.length - visibleBooks.length})`}
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
							<SectionTitle>Books</SectionTitle>
							<TotalBadge aria-label={`Total books: ${author.books.length}`}>
								<TotalNumber>{author.books.length}</TotalNumber>
								<TotalText>total</TotalText>
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
					<AuthorEditModal
						bio={editBio}
						isSaving={updateAuthorMutation.isPending}
						name={editName}
						photoUrl={editPhotoUrl}
						onBioChange={setEditBio}
						onClose={() => setIsEditOpen(false)}
						onNameChange={setEditName}
						onPhotoUrlChange={setEditPhotoUrl}
						onSave={() => void saveAuthorChanges()}
					/>
				) : null}
				{isDeleteConfirmOpen ? (
					<ConfirmModal
						confirmLabel="Delete"
						confirmLoadingLabel="Deleting..."
						isLoading={deleteAuthorMutation.isPending}
						title="Delete author?"
						onCancel={() => setIsDeleteConfirmOpen(false)}
						onConfirm={() => void deleteAuthor()}
					>
						The author will be removed from your list, and links to their books
						will be deleted.
					</ConfirmModal>
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
	width: min(calc(100% - (${theme.layout.contentGutter} * 2)), ${theme.layout.contentMaxWidth});
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
	justify-content: center;
	gap: 1rem;
`;

const StateMessage = styled.p`
	margin: 2.5rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;
