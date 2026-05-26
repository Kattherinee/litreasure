"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import AuthModal, { type IAuthModalMode } from "@/components/pages/AuthModal";
import {
	ClearFilterButton,
	FilterChip,
	FilterChips,
	FilterEmpty,
	Filters,
	ModeFilter,
	ResultsFilterBadge,
	SearchDropdownFilter,
	SelectFilter,
	SelectedFilters,
} from "@/components/pages/filters/AppFilters";
import {
	type ICollectionFilterMode,
	type ICollectionSort,
	useCollectionTagsQuery,
	usePublicCollectionsQuery,
} from "@/shared/api/collections";
import { useGenresQuery } from "@/shared/api/genres";
import { theme } from "@/shared/theme";
import { AppPagination } from "@/shared/ui/AppPagination";
import { SkeletonBlock } from "@/shared/ui/Skeleton";
import { CollectionRow } from "./CollectionsRow";

const sortOptions: Array<{ label: string; value: ICollectionSort }> = [
	{ label: "Сначала новые", value: "newest" },
	{ label: "Сначала старые", value: "oldest" },
	{ label: "Популярные", value: "popular" },
	{ label: "Больше книг", value: "books_desc" },
	{ label: "Меньше книг", value: "books_asc" },
];

const modeOptions: Array<{ label: string; value: ICollectionFilterMode }> = [
	{ label: "Любой", value: "any" },
	{ label: "Все", value: "all" },
];

const CollectionsPage = () => {
	const [page, setPage] = useState(1);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [tagMode, setTagMode] = useState<ICollectionFilterMode>("any");
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [genreMode, setGenreMode] = useState<ICollectionFilterMode>("any");
	const [sort, setSort] = useState<ICollectionSort>("newest");
	const [isSortOpen, setIsSortOpen] = useState(false);
	const [isTagsOpen, setIsTagsOpen] = useState(false);
	const [isGenresOpen, setIsGenresOpen] = useState(false);
	const [tagSearch, setTagSearch] = useState("");
	const [genreSearch, setGenreSearch] = useState("");
	const filtersRef = useRef<HTMLDivElement | null>(null);
	const [authModalMode, setAuthModalMode] = useState<IAuthModalMode | null>(
		null,
	);
	const normalizedTagSearch = tagSearch.trim();
	const normalizedGenreSearch = genreSearch.trim().toLowerCase();
	const { data: tagSuggestions = [] } = useCollectionTagsQuery(
		normalizedTagSearch,
		30,
		{
			enabled: true,
		},
	);
	const { data: allGenres = [] } = useGenresQuery();
	const {
		data: collectionsResponse,
		error,
		isError,
		isLoading,
	} = usePublicCollectionsQuery({
		genreMode: selectedGenres.length > 0 ? genreMode : undefined,
		genres: selectedGenres.join(",") || undefined,
		limit: 20,
		page,
		sort,
		tagMode: selectedTags.length > 0 ? tagMode : undefined,
		tags: selectedTags.join(",") || undefined,
	});
	const collections = collectionsResponse?.items ?? [];
	const pages = collectionsResponse?.pages ?? 1;
	const total = collectionsResponse?.total ?? 0;
	const selectedSortOption =
		sortOptions.find((option) => option.value === sort) ?? sortOptions[0];
	const selectedTagLabels = selectedTags.join(", ");
	const selectedGenreLabels = selectedGenres
		.map(
			(genreSlug) =>
				allGenres.find((genre) => genre.slug === genreSlug)?.name ?? genreSlug,
		)
		.join(", ");
	const selectedGenreItems = selectedGenres.map((genreSlug) => ({
		label:
			allGenres.find((genre) => genre.slug === genreSlug)?.name ?? genreSlug,
		value: genreSlug,
	}));
	const visibleTagSuggestions = useMemo(
		() =>
			[...tagSuggestions]
				.sort(
					(firstTag, secondTag) => secondTag.usageCount - firstTag.usageCount,
				)
				.map((tag) => tag.label)
				.filter((tag) => !selectedTags.includes(tag))
				.filter((tag) => {
					if (!normalizedTagSearch) return true;

					return tag.toLowerCase().includes(normalizedTagSearch.toLowerCase());
				}),
		[normalizedTagSearch, selectedTags, tagSuggestions],
	);
	const visibleGenreSuggestions = useMemo(() => {
		return allGenres
			.filter(
				(genre) =>
					!selectedGenres.includes(genre.slug) &&
					(!normalizedGenreSearch ||
						genre.name.toLowerCase().includes(normalizedGenreSearch) ||
						genre.slug.toLowerCase().includes(normalizedGenreSearch)),
			)
			.sort((firstGenre, secondGenre) =>
				firstGenre.name.localeCompare(secondGenre.name, "ru"),
			);
	}, [allGenres, normalizedGenreSearch, selectedGenres]);

	const toggleTag = (value: string) => {
		handleFilterChange(() => {
			setSelectedTags((currentTags) =>
				currentTags.includes(value)
					? currentTags.filter((currentTag) => currentTag !== value)
					: [...currentTags, value],
			);
		});
	};

	const toggleGenre = (value: string) => {
		handleFilterChange(() => {
			setSelectedGenres((currentGenres) =>
				currentGenres.includes(value)
					? currentGenres.filter((currentGenre) => currentGenre !== value)
					: [...currentGenres, value],
			);
		});
	};

	const handleFilterChange = (callback: () => void) => {
		setPage(1);
		callback();
	};

	const closeDropdowns = () => {
		setIsSortOpen(false);
		setIsTagsOpen(false);
		setIsGenresOpen(false);
	};

	useEffect(() => {
		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;

			if (
				target instanceof Node &&
				filtersRef.current?.contains(target)
			) {
				return;
			}

			closeDropdowns();
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeDropdowns();
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	return (
		<Page>
			<Hero>
				<HeroInner>
					<PageTitle>Подборки</PageTitle>
					<HeroText>
						Публичные книжные полки от читателей и Litreasure.
					</HeroText>
				</HeroInner>
			</Hero>

			<Content>
				<CollectionFilters ref={filtersRef}>
					<SelectFilter
						isOpen={isSortOpen}
						label="Сортировка"
						options={sortOptions}
						value={sort}
						valueLabel={selectedSortOption.label}
						onSelect={(value) => {
							handleFilterChange(() => setSort(value));
							setIsSortOpen(false);
						}}
						onToggle={() => {
							setIsSortOpen((current) => !current);
							setIsTagsOpen(false);
							setIsGenresOpen(false);
						}}
					/>

					<SearchDropdownFilter
						ariaLabel="Найти тег"
						isOpen={isTagsOpen}
						label="Теги"
						placeholder={selectedTagLabels || "Найти тег"}
						searchValue={tagSearch}
						onOpen={() => {
							setIsTagsOpen(true);
							setIsSortOpen(false);
							setIsGenresOpen(false);
						}}
						onSearchChange={setTagSearch}
					>
						<FilterChips>
							<FilterChip
								$isSelected={selectedTags.length === 0}
								type="button"
								onClick={() => handleFilterChange(() => setSelectedTags([]))}
							>
								Все
							</FilterChip>
							{visibleTagSuggestions.length > 0 ? (
								visibleTagSuggestions.map((tag) => (
									<FilterChip
										key={tag}
										$isSelected={selectedTags.includes(tag)}
										type="button"
										onClick={() => toggleTag(tag)}
									>
										{tag}
									</FilterChip>
								))
							) : (
								<FilterEmpty>Ничего не найдено</FilterEmpty>
							)}
						</FilterChips>
						{selectedTags.length > 0 ? (
							<ClearFilterButton
								type="button"
								onClick={() => handleFilterChange(() => setSelectedTags([]))}
							>
								Очистить
							</ClearFilterButton>
						) : null}
					</SearchDropdownFilter>

					<ModeFilter
						label="Режим тегов"
						options={modeOptions}
						value={tagMode}
						onChange={(value) => handleFilterChange(() => setTagMode(value))}
					/>

					<SearchDropdownFilter
						ariaLabel="Найти жанр"
						isOpen={isGenresOpen}
						label="Жанры"
						placeholder={selectedGenreLabels || "Найти жанр"}
						searchValue={genreSearch}
						onOpen={() => {
							setIsGenresOpen(true);
							setIsSortOpen(false);
							setIsTagsOpen(false);
						}}
						onSearchChange={setGenreSearch}
					>
						<FilterChips>
							<FilterChip
								$isSelected={selectedGenres.length === 0}
								type="button"
								onClick={() => handleFilterChange(() => setSelectedGenres([]))}
							>
								Все
							</FilterChip>
							{visibleGenreSuggestions.length > 0 ? (
								visibleGenreSuggestions.map((genre) => (
									<FilterChip
										key={genre.id}
										$isSelected={selectedGenres.includes(genre.slug)}
										type="button"
										onClick={() => toggleGenre(genre.slug)}
									>
										{genre.name}
									</FilterChip>
								))
							) : (
								<FilterEmpty>Ничего не найдено</FilterEmpty>
							)}
						</FilterChips>
						{selectedGenres.length > 0 ? (
							<ClearFilterButton
								type="button"
								onClick={() => handleFilterChange(() => setSelectedGenres([]))}
							>
								Очистить
							</ClearFilterButton>
						) : null}
					</SearchDropdownFilter>

					<ModeFilter
						label="Режим жанров"
						options={modeOptions}
						value={genreMode}
						onChange={(value) => handleFilterChange(() => setGenreMode(value))}
					/>

					<ResultsFilterBadge label="подборок" total={total} />
					<SelectedFilters
						items={selectedTags.map((tag) => ({ label: tag, value: tag }))}
						removeAriaLabel={(label) => `Убрать тег ${label}`}
						onClear={() => handleFilterChange(() => setSelectedTags([]))}
						onRemove={toggleTag}
					/>
					<SelectedFilters
						items={selectedGenreItems}
						removeAriaLabel={(label) => `Убрать жанр ${label}`}
						onClear={() => handleFilterChange(() => setSelectedGenres([]))}
						onRemove={toggleGenre}
					/>
				</CollectionFilters>
				{isLoading ? (
					<CollectionList aria-label="Загружаем подборки">
						{Array.from({ length: 4 }, (_, index) => (
							<CollectionSkeleton key={index} />
						))}
					</CollectionList>
				) : isError ? (
					<StateMessage>
						Не удалось загрузить подборки: {error.message}
					</StateMessage>
				) : collections.length === 0 ? (
					<StateMessage>Публичных подборок пока нет.</StateMessage>
				) : (
					<>
						<CollectionList>
							{collections.map((collection) => (
								<CollectionRow
									key={collection.id}
									collection={collection}
									onAuthRequired={() => setAuthModalMode("login")}
								/>
							))}
						</CollectionList>
						{pages > 1 ? (
							<AppPagination count={pages} page={page} onChange={setPage} />
						) : null}
					</>
				)}
			</Content>

			{authModalMode ? (
				<AuthModal
					mode={authModalMode}
					redirectOnSuccess={false}
					onClose={() => setAuthModalMode(null)}
					onModeChange={setAuthModalMode}
				/>
			) : null}
		</Page>
	);
};

export default CollectionsPage;

const CollectionSkeleton = () => (
	<SkeletonRow aria-hidden="true">
		<RowCopy>
			<SkeletonBlock $height="1.25rem" $width="min(100%, 22rem)" />
			<SkeletonBlock $height="1rem" $width="7rem" />
			<SkeletonBlock $height="1.75rem" $radius="50px" $width="7rem" />
		</RowCopy>
		<SkeletonPreview>
			{Array.from({ length: 5 }, (_, index) => (
				<SkeletonBlock
					key={index}
					$height="5rem"
					$radius="0.625rem"
					$width="3.75rem"
				/>
			))}
		</SkeletonPreview>
	</SkeletonRow>
);

const Page = styled.div`
	min-height: 100dvh;
	background: ${theme.colors.background};
	padding-bottom: clamp(3rem, 5vw, 4.5rem);
`;

const Hero = styled.section``;

const HeroInner = styled.div`
	width: min(
		calc(100% - (${theme.layout.contentGutter} * 2)),
		${theme.layout.collectionsPageMaxWidth}
	);
	margin: 0 auto;
	padding: 4vw 0 0vw;
`;

const PageTitle = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 2.5vw;
	font-weight: 600;
	line-height: 0.98;
`;

const HeroText = styled.p`
	max-width: 43rem;
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1.05rem;
	line-height: 1.6;
`;

const Content = styled.section`
	width: min(
		calc(100% - (${theme.layout.contentGutter} * 2)),
		${theme.layout.collectionsPageMaxWidth}
	);
	margin: 0 auto;
	padding-top: clamp(2.5rem, 5vw, 4rem);
`;

const CollectionFilters = styled(Filters)`
	grid-template-columns:
		minmax(10rem, 0.85fr) minmax(11rem, 1fr) minmax(8.5rem, 0.75fr)
		minmax(11rem, 1fr) minmax(8.5rem, 0.75fr) auto;
	margin: 0 0 1rem;

	@media (max-width: 76rem) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@media (max-width: 40rem) {
		grid-template-columns: 1fr;
	}
`;

const CollectionList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
`;

const SkeletonRow = styled.article`
	display: flex;
	min-height: 7.5rem;
	align-items: center;
	justify-content: space-between;
	gap: 3.75rem;
	border-radius: 1rem;
	background: ${theme.colors.white};
	padding: 1.25rem;

	@media (max-width: 56rem) {
		gap: 1rem;
	}

	@media (max-width: 42rem) {
		flex-direction: column;
		align-items: stretch;
	}
`;

export const RowCopy = styled.div`
	display: flex;
	flex: 1 1 22.375rem;
	min-width: 0;
	max-width: 22.375rem;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.32vw;
`;

export const PreviewRail = styled.div`
	display: flex;
	flex: 0 0 auto;
	align-items: center;
	justify-content: flex-end;
	gap: 0.5rem;
	overflow: visible;

	@media (max-width: 40rem) {
		max-width: 100%;
		overflow-x: auto;
		padding-bottom: 0.25rem;
	}
`;

const SkeletonPreview = styled(PreviewRail)``;

const StateMessage = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;
