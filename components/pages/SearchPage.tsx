"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";

import { AppPagination } from "@/shared/ui/AppPagination";

import {
	useSearchAllQuery,
	useSearchAuthorsQuery,
	useSearchBooksQuery,
	useSearchCollectionsQuery,
	useSearchGenresQuery,
	useSearchSeriesQuery,
} from "@/shared/api/search";
import { theme } from "@/shared/theme";
import { InputField } from "@/shared/ui/InputField";
import { AuthorResultCard } from "@/shared/ui/BookSearch/AuthorResultCard";
import { BookResultCard } from "@/shared/ui/BookSearch/BookResultCard";
import { CollectionResultCard } from "@/shared/ui/BookSearch/CollectionResultCard";
import { GenreResultCard } from "@/shared/ui/BookSearch/GenreResultCard";
import { SeriesResultCard } from "@/shared/ui/BookSearch/SeriesResultCard";
import {
	type ISearchTabActiveId,
	SEARCH_TABS,
	SearchTabBar,
} from "@/shared/ui/BookSearch/SearchTabBar";

const MIN_SEARCH_LENGTH = 2;
const RECENT_SEARCHES_KEY = "litreasure:recent-searches";
const RECENT_SEARCHES_LIMIT = 6;
const ALL_PREVIEW_LIMIT = 15;
const TAB_SEARCH_LIMIT = 15;

const isSearchTab = (value: string): value is ISearchTabActiveId =>
	SEARCH_TABS.some((tab) => tab.id === value);

const getPageParam = (params: URLSearchParams) => {
	const page = Number(params.get("page") ?? 1);
	return Number.isFinite(page) && page > 0 ? page : 1;
};

// Returns 0 if all shown, -1 if more exist but count unknown, N>0 if exact remainder known
const getSectionRemaining = (shown: number, total?: number): number => {
	if (total != null) return Math.max(0, total - shown);
	return shown >= ALL_PREVIEW_LIMIT ? -1 : 0;
};

const getShowAllLabel = (shown: number, total?: number): string => {
	const remaining = getSectionRemaining(shown, total);
	return remaining > 0 ? `Смотреть все · ещё ${remaining}` : "Смотреть все →";
};

const getSavedRecentSearches = (): string[] => {
	if (typeof window === "undefined") return [];
	try {
		const saved = window.localStorage.getItem(RECENT_SEARCHES_KEY);
		if (!saved) return [];
		const parsed = JSON.parse(saved);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter((search): search is string => typeof search === "string")
			.slice(0, RECENT_SEARCHES_LIMIT);
	} catch {
		return [];
	}
};

const SearchPage = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const initialQuery = searchParams.get("q") ?? "";
	const initialTabParam = searchParams.get("tab") ?? "all";
	const initialTab: ISearchTabActiveId = isSearchTab(initialTabParam)
		? initialTabParam
		: "all";

	const [searchValue, setSearchValue] = useState(initialQuery);
	const [activeTab, setActiveTab] = useState<ISearchTabActiveId>(initialTab);
	const [recentSearches] = useState<string[]>(getSavedRecentSearches);

	const normalizedSearchValue = searchValue.trim();
	const highlightQuery = searchParams.get("q") ?? "";
	const shouldSearch = normalizedSearchValue.length >= MIN_SEARCH_LENGTH;
	const page = getPageParam(searchParams);

	const { data: allData, isFetching: isFetchingAll } = useSearchAllQuery(
		normalizedSearchValue,
		ALL_PREVIEW_LIMIT,
		{ enabled: shouldSearch && activeTab === "all" },
	);

	const { data: booksData, isFetching: isFetchingBooks } = useSearchBooksQuery(
		normalizedSearchValue,
		page,
		TAB_SEARCH_LIMIT,
		{ enabled: shouldSearch && activeTab === "book" },
	);

	const { data: authorsData, isFetching: isFetchingAuthors } =
		useSearchAuthorsQuery(normalizedSearchValue, page, TAB_SEARCH_LIMIT, {
			enabled: shouldSearch && activeTab === "author",
		});

	const { data: seriesData, isFetching: isFetchingSeries } =
		useSearchSeriesQuery(normalizedSearchValue, page, TAB_SEARCH_LIMIT, {
			enabled: shouldSearch && activeTab === "series",
		});

	const { data: genresData, isFetching: isFetchingGenres } =
		useSearchGenresQuery(normalizedSearchValue, page, TAB_SEARCH_LIMIT, {
			enabled: shouldSearch && activeTab === "genre",
		});

	const { data: collectionsData, isFetching: isFetchingCollections } =
		useSearchCollectionsQuery(normalizedSearchValue, page, TAB_SEARCH_LIMIT, {
			enabled: shouldSearch && activeTab === "collection",
		});

	const isFetching =
		isFetchingAll ||
		isFetchingBooks ||
		isFetchingAuthors ||
		isFetchingSeries ||
		isFetchingGenres ||
		isFetchingCollections;

	const tabPages = useMemo(() => {
		const getPages = (data?: { total: number; limit: number }) =>
			data ? Math.ceil(data.total / data.limit) : 1;
		if (activeTab === "book") return getPages(booksData);
		if (activeTab === "author") return getPages(authorsData);
		if (activeTab === "series") return getPages(seriesData);
		if (activeTab === "genre") return getPages(genresData);
		if (activeTab === "collection") return getPages(collectionsData);
		return 1;
	}, [
		activeTab,
		booksData,
		authorsData,
		seriesData,
		genresData,
		collectionsData,
	]);

	const saveRecentSearch = (value = normalizedSearchValue) => {
		const next = value.trim();
		if (next.length < MIN_SEARCH_LENGTH) return;
		const current = getSavedRecentSearches();
		const deduped = current.filter(
			(search) => search.toLowerCase() !== next.toLowerCase(),
		);
		const nextList = [next, ...deduped].slice(0, RECENT_SEARCHES_LIMIT);
		window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextList));
	};

	const replaceSearchParams = (nextParams: URLSearchParams) => {
		router.replace(`/search?${nextParams.toString()}`, { scroll: false });
	};

	const handleTabChange = (tab: ISearchTabActiveId) => {
		setActiveTab(tab);
		const params = new URLSearchParams(searchParams.toString());
		if (tab === "all") {
			params.delete("tab");
		} else {
			params.set("tab", tab);
		}
		params.delete("page");
		replaceSearchParams(params);
	};

	const handlePageChange = (nextPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		if (nextPage <= 1) {
			params.delete("page");
		} else {
			params.set("page", String(nextPage));
		}
		replaceSearchParams(params);
	};

	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		const params = new URLSearchParams(searchParams.toString());
		if (value.trim()) {
			params.set("q", value.trim());
		} else {
			params.delete("q");
		}
		params.delete("page");
		replaceSearchParams(params);
	};
	const handleSuggestionSearch = (suggestion: string) => {
		setSearchValue(suggestion);
		const params = new URLSearchParams(searchParams.toString());
		params.set("q", suggestion);
		params.delete("page");
		replaceSearchParams(params);
	};

	const noop = () => {};

	const allSectionHasResults =
		allData &&
		(allData.books.length > 0 ||
			allData.authors.length > 0 ||
			allData.series.length > 0 ||
			allData.genres.length > 0 ||
			allData.collections.length > 0);

	const tabTotal =
		activeTab === "all"
			? (allData?.total ?? 0)
			: activeTab === "book"
				? (booksData?.total ?? 0)
				: activeTab === "author"
					? (authorsData?.total ?? 0)
					: activeTab === "series"
						? (seriesData?.total ?? 0)
						: activeTab === "genre"
							? (genresData?.total ?? 0)
							: (collectionsData?.total ?? 0);

	const tabTotalLabel =
		activeTab === "all"
			? "results"
			: activeTab === "book"
				? "books"
				: activeTab === "author"
					? "authors"
					: activeTab === "series"
						? "series"
						: activeTab === "genre"
							? "genres"
							: "collections";

	return (
		<PageWrap>
			<SearchHeader>
				<SearchTitle>Поиск</SearchTitle>
				<SearchInputWrap>
					<SearchIcon aria-hidden="true" />
					<StyledInput
						aria-label="Поиск"
						autoFocus
						placeholder="Название, автор, серия, жанр"
						type="search"
						value={searchValue}
						onChange={(event) => handleSearchChange(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") saveRecentSearch();
						}}
					/>
					{searchValue ? (
						<ClearButton
							aria-label="Очистить поиск"
							type="button"
							onClick={() => handleSearchChange("")}
						>
							×
						</ClearButton>
					) : null}
				</SearchInputWrap>
				<TabsWrapper>
					<Tabs role="tablist" aria-label="Фильтры поиска">
						<SearchTabBar
							activeTab={activeTab}
							counts={{
								book: booksData?.total ?? 0,
								author: authorsData?.total ?? 0,
								series: seriesData?.total ?? 0,
								genre: genresData?.total ?? 0,
								collection: collectionsData?.total ?? 0,
							}}
							isFetching={isFetching}
							shouldSearch={shouldSearch}
							total={allData?.total ?? 0}
							onTabChange={handleTabChange}
						/>
					</Tabs>
					{shouldSearch && !isFetching && tabTotal > 0 ? (
						<ResultsBadge aria-label={`Найдено ${tabTotal} ${tabTotalLabel}`}>
							<ResultsNumber>{tabTotal}</ResultsNumber>
							<ResultsText>{tabTotalLabel}</ResultsText>
						</ResultsBadge>
					) : null}
				</TabsWrapper>
			</SearchHeader>

			<ResultsArea>
				{!shouldSearch ? (
					recentSearches.length > 0 ? (
						<RecentBlock>
							<RecentHeading>Недавние запросы</RecentHeading>
							<RecentList>
								{recentSearches.map((search) => (
									<RecentButton
										key={search}
										type="button"
										onClick={() => handleSearchChange(search)}
									>
										{search}
									</RecentButton>
								))}
							</RecentList>
						</RecentBlock>
					) : (
						<EmptyState>Введите запрос для поиска</EmptyState>
					)
				) : null}

				{shouldSearch && isFetching ? <EmptyState>Ищем...</EmptyState> : null}

				{shouldSearch && !isFetching && activeTab === "all" ? (
					allSectionHasResults ? (
						<>
							{allData && allData.books.length > 0 ? (
								<AllSection>
									<AllSectionTitle>Книги</AllSectionTitle>
									<ResultSection>
										{allData.books.slice(0, ALL_PREVIEW_LIMIT).map((book) => (
											<BookResultCard
												key={book.id}
												book={book}
												closeSearch={noop}
												query={highlightQuery}
												saveRecentSearch={saveRecentSearch}
											/>
										))}
									</ResultSection>
									{getSectionRemaining(
										allData.books.length,
										allData.booksTotal,
									) !== 0 ? (
										<AllSectionFooter>
											<ShowAllButton
												type="button"
												onClick={() => handleTabChange("book")}
											>
												{getShowAllLabel(
													allData.books.length,
													allData.booksTotal,
												)}
											</ShowAllButton>
										</AllSectionFooter>
									) : null}
								</AllSection>
							) : null}

							{allData && allData.authors.length > 0 ? (
								<AllSection>
									<AllSectionTitle>Авторы</AllSectionTitle>
									<ResultSection>
										{allData.authors
											.slice(0, ALL_PREVIEW_LIMIT)
											.map((author) => (
												<AuthorResultCard
													key={author.id}
													author={author}
													closeSearch={noop}
													query={highlightQuery}
													saveRecentSearch={saveRecentSearch}
												/>
											))}
									</ResultSection>
									{getSectionRemaining(
										allData.authors.length,
										allData.authorsTotal,
									) !== 0 ? (
										<AllSectionFooter>
											<ShowAllButton
												type="button"
												onClick={() => handleTabChange("author")}
											>
												{getShowAllLabel(
													allData.authors.length,
													allData.authorsTotal,
												)}
											</ShowAllButton>
										</AllSectionFooter>
									) : null}
								</AllSection>
							) : null}

							{allData && allData.series.length > 0 ? (
								<AllSection>
									<AllSectionTitle>Серии</AllSectionTitle>
									<ResultSection>
										{allData.series
											.slice(0, ALL_PREVIEW_LIMIT)
											.map((series) => (
												<SeriesResultCard
													key={series.id}
													query={highlightQuery}
													series={series}
													closeSearch={noop}
													saveRecentSearch={saveRecentSearch}
												/>
											))}
									</ResultSection>
									{getSectionRemaining(
										allData.series.length,
										allData.seriesTotal,
									) !== 0 ? (
										<AllSectionFooter>
											<ShowAllButton
												type="button"
												onClick={() => handleTabChange("series")}
											>
												{getShowAllLabel(
													allData.series.length,
													allData.seriesTotal,
												)}
											</ShowAllButton>
										</AllSectionFooter>
									) : null}
								</AllSection>
							) : null}

							{allData && allData.genres.length > 0 ? (
								<AllSection>
									<AllSectionTitle>Жанры</AllSectionTitle>
									<ResultSection>
										{allData.genres.slice(0, ALL_PREVIEW_LIMIT).map((genre) => (
											<GenreResultCard
												key={genre.id}
												closeSearch={noop}
												genre={genre}
												query={highlightQuery}
												saveRecentSearch={saveRecentSearch}
											/>
										))}
									</ResultSection>
									{getSectionRemaining(
										allData.genres.length,
										allData.genresTotal,
									) !== 0 ? (
										<AllSectionFooter>
											<ShowAllButton
												type="button"
												onClick={() => handleTabChange("genre")}
											>
												{getShowAllLabel(
													allData.genres.length,
													allData.genresTotal,
												)}
											</ShowAllButton>
										</AllSectionFooter>
									) : null}
								</AllSection>
							) : null}

							{allData && allData.collections.length > 0 ? (
								<AllSection>
									<AllSectionTitle>Подборки</AllSectionTitle>
									<ResultSection>
										{allData.collections
											.slice(0, ALL_PREVIEW_LIMIT)
											.map((collection) => (
												<CollectionResultCard
													key={collection.id}
													closeSearch={noop}
													collection={collection}
													query={highlightQuery}
													saveRecentSearch={saveRecentSearch}
												/>
											))}
									</ResultSection>
									{getSectionRemaining(
										allData.collections.length,
										allData.collectionsTotal,
									) !== 0 ? (
										<AllSectionFooter>
											<ShowAllButton
												type="button"
												onClick={() => handleTabChange("collection")}
											>
												{getShowAllLabel(
													allData.collections.length,
													allData.collectionsTotal,
												)}
											</ShowAllButton>
										</AllSectionFooter>
									) : null}
								</AllSection>
							) : null}
						</>
					) : (
						<EmptyState>Ничего не найдено.</EmptyState>
					)
				) : null}

				{shouldSearch && !isFetching && activeTab === "book" ? (
					booksData && booksData.items.length > 0 ? (
						<>
							<ResultSection>
								{booksData.items.map((book) => (
									<BookResultCard
										key={book.id}
										book={book}
										closeSearch={noop}
										query={highlightQuery}
										saveRecentSearch={saveRecentSearch}
									/>
								))}
							</ResultSection>
							<AppPagination
								count={tabPages}
								page={page}
								onChange={handlePageChange}
							/>
						</>
					) : (
						<EmptyState>Книги не найдены.</EmptyState>
					)
				) : null}

				{shouldSearch && !isFetching && activeTab === "author" ? (
					authorsData && authorsData.items.length > 0 ? (
						<>
							<ResultSection>
								{authorsData.items.map((author) => (
									<AuthorResultCard
										key={author.id}
										author={author}
										closeSearch={noop}
										query={highlightQuery}
										saveRecentSearch={saveRecentSearch}
									/>
								))}
							</ResultSection>
							<AppPagination
								count={tabPages}
								page={page}
								onChange={handlePageChange}
							/>
						</>
					) : (
						<EmptyState>Авторы не найдены.</EmptyState>
					)
				) : null}

				{shouldSearch && !isFetching && activeTab === "series" ? (
					seriesData && seriesData.items.length > 0 ? (
						<>
							<ResultSection>
								{seriesData.items.map((series) => (
									<SeriesResultCard
										key={series.id}
										series={series}
										closeSearch={noop}
										query={highlightQuery}
										saveRecentSearch={saveRecentSearch}
									/>
								))}
							</ResultSection>
							<AppPagination
								count={tabPages}
								page={page}
								onChange={handlePageChange}
							/>
						</>
					) : (
						<EmptyState>Серии не найдены.</EmptyState>
					)
				) : null}

				{shouldSearch && !isFetching && activeTab === "genre" ? (
					genresData && genresData.items.length > 0 ? (
						<>
							<ResultSection>
								{genresData.items.map((genre) => (
									<GenreResultCard
										key={genre.id}
										closeSearch={noop}
										genre={genre}
										query={highlightQuery}
										saveRecentSearch={saveRecentSearch}
									/>
								))}
							</ResultSection>
							<AppPagination
								count={tabPages}
								page={page}
								onChange={handlePageChange}
							/>
						</>
					) : (
						<EmptyState>
							Жанры не найдены.
							{genresData?.suggestion ? (
								<SuggestionButton
									type="button"
									onClick={() => handleSuggestionSearch(genresData.suggestion!)}
								>
									Искать «{genresData.suggestion}»
								</SuggestionButton>
							) : null}
						</EmptyState>
					)
				) : null}

				{shouldSearch && !isFetching && activeTab === "collection" ? (
					collectionsData && collectionsData.items.length > 0 ? (
						<>
							<ResultSection>
								{collectionsData.items.map((collection) => (
									<CollectionResultCard
										key={collection.id}
										closeSearch={noop}
										collection={collection}
										query={highlightQuery}
										saveRecentSearch={saveRecentSearch}
									/>
								))}
							</ResultSection>
							<AppPagination
								count={tabPages}
								page={page}
								onChange={handlePageChange}
							/>
						</>
					) : (
						<EmptyState>Подборки не найдены.</EmptyState>
					)
				) : null}
			</ResultsArea>
		</PageWrap>
	);
};

export default SearchPage;

const PageWrap = styled.div`
	display: flex;
	min-height: 100dvh;
	flex-direction: column;
	width: 55vw;
	margin: 0 auto;
`;

const SearchHeader = styled.div`
	position: sticky;
	z-index: 10;
	top: 0;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	border-bottom: 0.0625rem solid rgb(211 202 196 / 0.5);
	background: ${theme.colors.background};
	padding: 2rem 2rem 1rem;

	@media (max-width: 720px) {
		padding: 1rem;
	}
`;

const SearchTitle = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.65rem;
	font-weight: 600;
	line-height: 1.2;
`;

const SearchInputWrap = styled.div`
	position: relative;
	display: flex;
	align-items: center;
`;

const SearchIcon = styled.span`
	position: absolute;
	left: 1rem;
	width: 14px;
	height: 14px;
	border: 2px solid currentColor;
	border-radius: 50%;
	color: ${theme.colors.softForeground};
	pointer-events: none;

	&::after {
		position: absolute;
		right: -6px;
		bottom: -4px;
		width: 9px;
		height: 2px;
		border-radius: 999px;
		background: currentColor;
		content: "";
		transform: rotate(45deg);
	}
`;

const StyledInput = styled(InputField)`
	width: 100%;

	min-height: 3rem;
	border-color: ${theme.colors.orangeLight};
	border-radius: 1.05rem;
	background: rgb(242 239 237 / 0.88);
	padding-block: 0.55rem;
	padding-left: 2.75rem;
	padding-right: 3rem;
	font-size: 1rem;

	&:focus,
	&:focus-visible {
		background: ${theme.colors.surface};
	}

	&::-webkit-search-cancel-button {
		display: none;
	}
`;

const ClearButton = styled.button`
	position: absolute;
	right: 1rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.65rem;
	height: 1.65rem;
	border: 0;
	border-radius: 50%;
	background: ${theme.colors.transparent};
	color: ${theme.colors.bluePrimary};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 1.3rem;
	font-weight: 700;
	line-height: 1;
	transition:
		background 160ms ease,
		color 160ms ease;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
	}

	@media (max-width: 720px) {
		left: auto;
		right: 0.5rem;
	}
`;

const Tabs = styled.div`
	display: flex;
	gap: 0.5rem;
	overflow-x: auto;
	overflow-y: hidden;
	padding-bottom: 0.25rem;
`;
const TabsWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
`;

const ResultsArea = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1rem 2rem 3rem;

	@media (max-width: 720px) {
		padding: 1rem;
	}
`;

const AllSection = styled.section`
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding-bottom: 1.5rem;
`;

const AllSectionFooter = styled.div`
	display: flex;
	justify-content: flex-end;
	padding-top: 0.25rem;
`;

const AllSectionTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.1rem;
	font-weight: 600;
`;

const ShowAllButton = styled.button`
	border: 0;
	background: none;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 0.85rem;
	line-height: 1;
	padding: 0;
	transition: color 160ms ease;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeLight};
		outline: none;
		text-decoration: underline;
	}
`;

const ResultSection = styled.section`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`;

const RecentBlock = styled.div`
	padding: 1.25rem 0;
`;

const RecentHeading = styled.h2`
	margin: 0 0 0.75rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.15rem;
	font-weight: 500;
`;

const RecentList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
`;

const RecentButton = styled.button`
	border: 0.0625rem solid rgb(211 202 196 / 0.7);
	border-radius: 62.4375rem;
	background: ${theme.colors.surface};
	padding: 0.5rem 0.8rem;
	color: ${theme.colors.foreground};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
	line-height: 1;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const EmptyState = styled.div`
	padding: 4rem 0;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.95rem;
	text-align: center;
`;

const SuggestionButton = styled.button`
	display: inline-flex;
	margin-left: 0.45rem;
	border: 0;
	background: transparent;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	font-weight: 700;
	text-decoration: none;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.bluePrimary};
		outline: none;
	}
`;

const ResultsNumber = styled.span`
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.serif};
	font-size: 1.3vw;
	font-weight: 600;
	line-height: 1;
`;

const ResultsText = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.96vw;
	line-height: 1;
	font-weight: 500;
`;

const ResultsBadge = styled.div`
	display: inline-flex;
	min-height: 2.35rem;
	align-items: baseline;
	justify-content: center;
	gap: 0.42rem;
	padding: 0.48rem 0.85rem;
	white-space: nowrap;

	@media (max-width: 72rem) {
		justify-self: start;
	}
`;
