"use client";

import { useState } from "react";
import styled from "styled-components";

import AuthModal, { type IAuthModalMode } from "@/components/pages/AuthModal";
import {
	ChevronIcon,
	DropdownButton,
	DropdownField,
	DropdownMenu,
	DropdownMenuItem,
	DropdownValue,
	FilterLabel,
	Filters,
	GenreSearchInput,
	ModeButton,
	ModeField,
	ModeSwitch,
	ResultsBadge,
	ResultsNumber,
	ResultsText,
} from "@/components/pages/AuthorsFilters";
import {
	type ICollectionFilterMode,
	type ICollectionSort,
	usePublicCollectionsQuery,
} from "@/shared/api/collections";
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

const normalizeFilterValue = (value: string) =>
	value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)
		.join(",");

const CollectionsPage = () => {
	const [page, setPage] = useState(1);
	const [tags, setTags] = useState("");
	const [tagMode, setTagMode] = useState<ICollectionFilterMode>("any");
	const [genres, setGenres] = useState("");
	const [genreMode, setGenreMode] = useState<ICollectionFilterMode>("any");
	const [sort, setSort] = useState<ICollectionSort>("newest");
	const [isSortOpen, setIsSortOpen] = useState(false);
	const [authModalMode, setAuthModalMode] = useState<IAuthModalMode | null>(
		null,
	);
	const {
		data: collectionsResponse,
		error,
		isError,
		isLoading,
	} = usePublicCollectionsQuery({
		genreMode,
		genres: normalizeFilterValue(genres),
		limit: 20,
		page,
		sort,
		tagMode,
		tags: normalizeFilterValue(tags),
	});
	const collections = collectionsResponse?.items ?? [];
	const pages = collectionsResponse?.pages ?? 1;
	const total = collectionsResponse?.total ?? 0;
	const selectedSortOption =
		sortOptions.find((option) => option.value === sort) ?? sortOptions[0];

	const handleFilterChange = (callback: () => void) => {
		setPage(1);
		callback();
	};

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
				<CollectionFilters
					onBlur={(event) => {
						if (
							!event.currentTarget.contains(event.relatedTarget as Node | null)
						) {
							setIsSortOpen(false);
						}
					}}
				>
					<DropdownField>
						<FilterLabel>Сортировка</FilterLabel>
						<DropdownButton
							aria-expanded={isSortOpen}
							type="button"
							onClick={() => setIsSortOpen((current) => !current)}
						>
							<DropdownValue>{selectedSortOption.label}</DropdownValue>
							<ChevronIcon $isOpen={isSortOpen} aria-hidden="true" />
						</DropdownButton>
						<DropdownMenu $isOpen={isSortOpen}>
							{sortOptions.map((option) => (
								<DropdownMenuItem
									key={option.value}
									$isSelected={option.value === sort}
									type="button"
									onClick={() => {
										handleFilterChange(() => setSort(option.value));
										setIsSortOpen(false);
									}}
								>
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenu>
					</DropdownField>

					<DropdownField>
						<FilterLabel htmlFor="collection-tags">Теги</FilterLabel>
						<GenreSearchInput
							id="collection-tags"
							placeholder="booktok, romantasy"
							value={tags}
							onChange={(event) =>
								handleFilterChange(() => setTags(event.target.value))
							}
						/>
					</DropdownField>

					<ModeField>
						<FilterLabel>Режим тегов</FilterLabel>
						<ModeSwitch>
							{modeOptions.map((option) => (
								<ModeButton
									key={option.value}
									$isActive={tagMode === option.value}
									type="button"
									onClick={() =>
										handleFilterChange(() => setTagMode(option.value))
									}
								>
									{option.label}
								</ModeButton>
							))}
						</ModeSwitch>
					</ModeField>

					<DropdownField>
						<FilterLabel htmlFor="collection-genres">Жанры</FilterLabel>
						<GenreSearchInput
							id="collection-genres"
							placeholder="fantasy, romance"
							value={genres}
							onChange={(event) =>
								handleFilterChange(() => setGenres(event.target.value))
							}
						/>
					</DropdownField>

					<ModeField>
						<FilterLabel>Режим жанров</FilterLabel>
						<ModeSwitch>
							{modeOptions.map((option) => (
								<ModeButton
									key={option.value}
									$isActive={genreMode === option.value}
									type="button"
									onClick={() =>
										handleFilterChange(() => setGenreMode(option.value))
									}
								>
									{option.label}
								</ModeButton>
							))}
						</ModeSwitch>
					</ModeField>

					<ResultsBadge aria-label={`Найдено подборок: ${total}`}>
						<ResultsNumber>{total}</ResultsNumber>
						<ResultsText>подборок</ResultsText>
					</ResultsBadge>
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
						<ListSummary>
							Найдено подборок: {total}. Страница {page} из {pages}.
						</ListSummary>
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
	background:
		radial-gradient(
			circle at 88% 12%,
			${theme.alpha.orangeGlow},
			${theme.colors.transparent} 26%
		),
		linear-gradient(
			180deg,
			${theme.colors.backgroundTop} 0%,
			${theme.colors.background} 100%
		);
	padding-bottom: clamp(3rem, 5vw, 4.5rem);
`;

const Hero = styled.section`
	background: url("/images/TitleBlock.svg") center / cover no-repeat;
`;

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

const ListSummary = styled.p`
	margin: 0 0 1rem;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.4;
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
