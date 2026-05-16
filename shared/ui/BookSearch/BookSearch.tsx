"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import type { IBook, IBookSearchScope } from "@/shared/api/books";
import { useBookCardsQuery } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { Button } from "@/shared/ui/Button";
import { InputField } from "@/shared/ui/InputField";

const MIN_SEARCH_LENGTH = 2;
const RECENT_SEARCHES_KEY = "litreasure:recent-searches";
const RECENT_SEARCHES_LIMIT = 6;
const SEARCH_RESULT_LIMIT = 40;

type ISearchTab = IBookSearchScope;

const searchTabs: Array<{ id: ISearchTab; label: string }> = [
	{ id: "books", label: "Книги" },
	{ id: "authors", label: "Авторы" },
	{ id: "series", label: "Серии" },
	{ id: "genres", label: "Жанры" },
	{ id: "collections", label: "Подборки" },
	{ id: "publishers", label: "Публикаторы" },
];

const getStoredRecentSearches = () => {
	if (typeof window === "undefined") {
		return [];
	}

	const savedSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY);

	if (!savedSearches) {
		return [];
	}

	try {
		const parsedSearches = JSON.parse(savedSearches);

		if (!Array.isArray(parsedSearches)) {
			return [];
		}

		return parsedSearches
			.filter((search): search is string => typeof search === "string")
			.slice(0, RECENT_SEARCHES_LIMIT);
	} catch {
		window.localStorage.removeItem(RECENT_SEARCHES_KEY);

		return [];
	}
};

const BookSearch = () => {
	const [searchValue, setSearchValue] = useState("");
	const [recentSearches, setRecentSearches] = useState<string[]>(
		getStoredRecentSearches,
	);
	const [activeTabs, setActiveTabs] = useState<ISearchTab[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const normalizedSearchValue = searchValue.trim();
	const shouldSearch = normalizedSearchValue.length >= MIN_SEARCH_LENGTH;
	const { data: searchResponse, isFetching } = useBookCardsQuery(
		{
			limit: SEARCH_RESULT_LIMIT,
			search: normalizedSearchValue,
		},
		{ enabled: shouldSearch },
	);
	const searchResults = useMemo(
		() => searchResponse?.items ?? [],
		[searchResponse],
	);
	const searchTotal = searchResponse?.total ?? searchResults.length;
	const filteredSearchResults = useMemo(
		() => filterSearchResultsByTabs(searchResults, activeTabs),
		[activeTabs, searchResults],
	);
	const resultCountsByTab = useMemo(
		() => getResultCountsByTab(searchResults),
		[searchResults],
	);

	const closeSearch = () => setIsOpen(false);

	const saveRecentSearch = (value = normalizedSearchValue) => {
		const nextSearch = value.trim();

		if (nextSearch.length < MIN_SEARCH_LENGTH) {
			return;
		}

		setRecentSearches((currentSearches) => {
			const deduplicatedSearches = currentSearches.filter(
				(search) => search.toLowerCase() !== nextSearch.toLowerCase(),
			);
			const nextSearches = [nextSearch, ...deduplicatedSearches].slice(
				0,
				RECENT_SEARCHES_LIMIT,
			);

			window.localStorage.setItem(
				RECENT_SEARCHES_KEY,
				JSON.stringify(nextSearches),
			);

			return nextSearches;
		});
	};

	const clearSearch = () => setSearchValue("");
	const toggleSearchTab = (tab: ISearchTab) => {
		setActiveTabs((currentTabs) =>
			currentTabs.includes(tab)
				? currentTabs.filter((currentTab) => currentTab !== tab)
				: [...currentTabs, tab],
		);
	};

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeSearch();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	return (
		<SearchWrap>
			<SearchIcon aria-hidden="true" />
			<SearchInput
				type="search"
				placeholder="Название, автор"
				aria-label="Поиск книг"
				value={searchValue}
				onChange={(event) => setSearchValue(event.target.value)}
				onFocus={() => setIsOpen(true)}
			/>

			{isOpen ? (
				<ModalLayer>
					<ModalBackdrop aria-hidden="true" onMouseDown={closeSearch} />
					<SearchPanel role="dialog" aria-label="Расширенный поиск">
						<SearchPanelHeader>
							<PanelSearchIcon aria-hidden="true" />
							<PanelSearchInput
								autoFocus
								type="search"
								placeholder="Название, автор, серия"
								aria-label="Расширенный поиск"
								value={searchValue}
								onChange={(event) => setSearchValue(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										saveRecentSearch();
									}
								}}
							/>
							{searchValue ? (
								<ClearButton
									type="button"
									aria-label="Очистить поиск"
									onClick={clearSearch}
								>
									×
								</ClearButton>
							) : null}
						</SearchPanelHeader>

						<Tabs role="tablist" aria-label="Фильтры поиска">
							{searchTabs.map((tab) => {
								const isActive = activeTabs.includes(tab.id);
								const resultCount = resultCountsByTab[tab.id] ?? 0;
								const showResultState = shouldSearch && !isFetching;

								return (
									<TabButton
										key={tab.id}
										aria-pressed={isActive}
										$hasResults={resultCount > 0}
										$isActive={isActive}
										$showResultState={showResultState}
										type="button"
										onClick={() => toggleSearchTab(tab.id)}
									>
										{tab.label}
										{showResultState ? (
											<TabCount
												$hasResults={resultCount > 0}
												$isActive={isActive}
											>
												{resultCount}
											</TabCount>
										) : null}
									</TabButton>
								);
							})}
						</Tabs>

						<ResultsArea>
							{normalizedSearchValue.length < MIN_SEARCH_LENGTH ? (
								<RecentSearchesBlock>
									<RecentHeading>Недавние запросы</RecentHeading>
									{recentSearches.length > 0 ? (
										<RecentList>
											{recentSearches.map((recentSearch) => (
												<RecentButton
													key={recentSearch}
													type="button"
													onClick={() => setSearchValue(recentSearch)}
												>
													{recentSearch}
												</RecentButton>
											))}
										</RecentList>
									) : (
										<EmptyState>Недавних запросов пока нет.</EmptyState>
									)}
								</RecentSearchesBlock>
							) : null}

							{shouldSearch && isFetching ? (
								<EmptyState>Ищем книги...</EmptyState>
							) : null}

							{shouldSearch && !isFetching && filteredSearchResults.length > 0
								? filteredSearchResults.map((book) => {
										const seriesLine = formatSeriesLine(book);
										const searchMatch = getPrimarySearchMatch(
											book,
											normalizedSearchValue,
										);
										const primaryAuthor = book.authors?.[0];
										const authorName = primaryAuthor?.name ?? book.author;

										return (
											<ResultItem key={book.id}>
												<ResultMain>
													<ResultCoverLink
														href={`/books/${book.id}`}
														onClick={() => {
															saveRecentSearch();
															closeSearch();
														}}
													>
														<ResultCover
															src={
																book.coverUrl ?? "/images/book-placeholder.svg"
															}
															alt=""
														/>
													</ResultCoverLink>
													<ResultMeta>
														<ResultLink
															href={`/books/${book.id}`}
															onClick={() => {
																saveRecentSearch();
																closeSearch();
															}}
														>
															{seriesLine ? (
																<ResultSeries>
																	<HighlightedText
																		query={normalizedSearchValue}
																		text={seriesLine}
																	/>
																</ResultSeries>
															) : null}
															<ResultTitle>
																<HighlightedText
																	query={normalizedSearchValue}
																	text={book.title}
																/>
															</ResultTitle>
														</ResultLink>
														<ResultAuthor>
															{primaryAuthor ? (
																<ResultAuthorLink
																	href={`/authors/${primaryAuthor.id}`}
																	onClick={() => {
																		saveRecentSearch();
																		closeSearch();
																	}}
																>
																	<HighlightedText
																		query={normalizedSearchValue}
																		text={authorName}
																	/>
																</ResultAuthorLink>
															) : (
																<HighlightedText
																	query={normalizedSearchValue}
																	text={authorName}
																/>
															)}
														</ResultAuthor>
														{searchMatch ? (
															<ResultMatchLine>
																<ResultMatchField>
																	{formatSearchMatchField(searchMatch.field)}
																</ResultMatchField>
																<HighlightedText
																	query={normalizedSearchValue}
																	text={searchMatch.value}
																/>
															</ResultMatchLine>
														) : null}
													</ResultMeta>
												</ResultMain>
												<WantButton buttonType="oxygenPill" type="button">
													Want to read
												</WantButton>
											</ResultItem>
										);
									})
								: null}

							{shouldSearch &&
							!isFetching &&
							filteredSearchResults.length === 0 ? (
								<EmptyState>Ничего не найдено.</EmptyState>
							) : null}
						</ResultsArea>

						<SearchFooter>
							<ResultCount>{getResultCountLabel(searchTotal)}</ResultCount>
							<ViewAllButton
								buttonType="containedInverted"
								onClick={() => saveRecentSearch()}
							>
								Посмотреть все
							</ViewAllButton>
						</SearchFooter>
					</SearchPanel>
				</ModalLayer>
			) : null}
		</SearchWrap>
	);
};

export default BookSearch;

const HighlightedText = ({ query, text }: { query: string; text: string }) => {
	const highlightValue = query.trim();

	if (!highlightValue) {
		return text;
	}

	const matchIndex = text.toLowerCase().indexOf(highlightValue.toLowerCase());

	if (matchIndex === -1) {
		return text;
	}

	const before = text.slice(0, matchIndex);
	const match = text.slice(matchIndex, matchIndex + highlightValue.length);
	const after = text.slice(matchIndex + highlightValue.length);

	return (
		<Fragment>
			{before}
			<Highlight>{match}</Highlight>
			{after}
		</Fragment>
	);
};

const filterSearchResultsByTabs = (
	books: IBook[],
	activeTabs: ISearchTab[],
) => {
	if (activeTabs.length === 0) {
		return books;
	}

	return books.filter((book) =>
		activeTabs.some((activeTab) => doesBookMatchTab(book, activeTab)),
	);
};

const getPrimarySearchMatch = (book: IBook, query: string) => {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery || !book.searchMatches?.length) {
		return null;
	}

	return (
		book.searchMatches.find((match) =>
			match.value.toLowerCase().includes(normalizedQuery),
		) ?? book.searchMatches[0]
	);
};

const formatSearchMatchField = (field: string) => {
	if (field === "author" || field === "authors") return "Автор";
	if (field === "genre" || field === "genres") return "Жанр";
	if (field === "series" || field === "seriesTitle") return "Серия";
	if (field === "collection" || field === "collections") return "Подборка";
	if (field === "publisher" || field === "publishers") return "Издатель";
	if (field === "title" || field === "book") return "Книга";

	return "Совпадение";
};

const getResultCountsByTab = (books: IBook[]) =>
	searchTabs.reduce(
		(counts, tab) => ({
			...counts,
			[tab.id]: books.filter((book) => doesBookMatchTab(book, tab.id)).length,
		}),
		{} as Record<ISearchTab, number>,
	);

const doesBookMatchTab = (book: IBook, activeTab: ISearchTab) => {
	if (activeTab === "books") {
		return isBookResult(book);
	}

	if (activeTab === "authors") {
		return hasSearchMatch(book, ["author", "authors"]);
	}

	if (activeTab === "series") {
		return isSeriesResult(book);
	}

	if (activeTab === "genres") {
		return hasSearchMatch(book, ["genre", "genres"]);
	}

	if (activeTab === "collections") {
		return isCollectionResult(book);
	}

	if (activeTab === "publishers") {
		return hasSearchMatch(book, ["publisher", "publishers"]);
	}

	return true;
};

const hasSearchMatch = (book: IBook, fields: string[]) =>
	book.searchMatches?.some((match) => fields.includes(match.field)) ?? false;

const getBookRelationType = (book: IBook) =>
	book.seriesRelationType ?? book.series?.relationType ?? book.relationType;

const isCollectionResult = (book: IBook) => {
	const relationType = getBookRelationType(book);

	return (
		relationType === "collection" ||
		relationType === "omnibus" ||
		hasSearchMatch(book, ["collection", "collections"])
	);
};

const isSeriesResult = (book: IBook) => {
	if (isCollectionResult(book)) {
		return false;
	}

	return (
		getBookRelationType(book) === "main" ||
		getBookRelationType(book) === "spin_off" ||
		Boolean(book.seriesTitle ?? book.series?.title) ||
		hasSearchMatch(book, ["series", "seriesTitle"])
	);
};

const isBookResult = (book: IBook) => {
	if (isCollectionResult(book)) {
		return false;
	}

	return (
		hasSearchMatch(book, ["book", "title"]) ||
		!hasSearchMatch(book, [
			"author",
			"authors",
			"collection",
			"collections",
			"genre",
			"genres",
			"publisher",
			"publishers",
			"series",
			"seriesTitle",
		])
	);
};

const formatSeriesLine = (book: IBook) => {
	const seriesTitle = book.seriesTitle ?? book.series?.title;
	const orderInSeries = book.series?.orderInSeries ?? book.orderInSeries;
	const relationType =
		book.seriesRelationType ?? book.series?.relationType ?? book.relationType;

	if (relationType === "spin_off" && seriesTitle) {
		return `Spin-off in ${seriesTitle}`;
	}

	if (
		(relationType === "collection" || relationType === "omnibus") &&
		seriesTitle
	) {
		return `${book.series?.seriesLabel ?? book.seriesLabel ?? "Collection"} in ${seriesTitle}`;
	}

	if (orderInSeries && orderInSeries > 0) {
		return seriesTitle
			? `Book ${orderInSeries} in ${seriesTitle}`
			: `Book ${orderInSeries} in series`;
	}

	if (seriesTitle) {
		return `Part of ${seriesTitle}`;
	}

	return null;
};

const getResultCountLabel = (count: number) => {
	if (count === 1) {
		return "1 результат";
	}

	if (count > 1 && count < 5) {
		return `${count} результата`;
	}

	return `${count} результатов`;
};

const SearchWrap = styled.div`
	position: relative;
	display: flex;
	width: min(270px, 30vw);
	margin-left: auto;
	align-items: center;

	@media (max-width: 720px) {
		order: 5;
		width: 100%;
		margin-left: 0;
	}
`;

const SearchIcon = styled.span`
	position: absolute;
	top: 45%;
	left: 14px;
	width: 12px;
	height: 12px;
	border: 2px solid currentColor;
	border-radius: 50%;
	color: ${theme.colors.softForeground};
	pointer-events: none;
	transform: translateY(-50%);

	&::after {
		position: absolute;
		right: -6px;
		bottom: -4px;
		width: 8px;
		height: 2px;
		border-radius: 999px;
		background: currentColor;
		content: "";
		transform: rotate(45deg);
	}
`;

const SearchInput = styled(InputField)`
	min-height: 24px;
	padding-block: 0.45rem;
	padding: 0.335vw 0.875vw 0.335vw 2.8vw;

	line-height: 1.35;

	&::-webkit-search-cancel-button {
		display: none;
	}
`;

const ModalLayer = styled.div`
	position: fixed;
	z-index: 80;
	inset: 0;
`;

const ModalBackdrop = styled.div`
	position: absolute;
	inset: 0;
	background: rgb(4 18 26 / 0.42);
`;

const SearchPanel = styled.div`
	position: relative;
	z-index: 1;
	display: flex;
	width: min(54rem, calc(100vw - 2rem));
	max-height: min(42rem, calc(100dvh - 2rem));
	flex-direction: column;
	margin: 1rem auto 0;
	overflow: hidden;
	border: 0.0625rem solid rgb(242 239 237 / 0.18);
	border-radius: 1.25rem;
	background: ${theme.colors.background};
	box-shadow: 0 1.25rem 4rem rgb(4 18 26 / 0.32);
`;

const SearchPanelHeader = styled.div`
	position: relative;
	z-index: 3;
	display: flex;
	flex: 0 0 auto;
	align-items: center;
	background: ${theme.colors.background};
	padding: 1rem 1.25rem 0.75rem;
`;

const PanelSearchIcon = styled(SearchIcon)`
	left: 2rem;
	width: 16px;
	height: 16px;
	color: ${theme.colors.lightText};
`;

const PanelSearchInput = styled(InputField)`
	min-height: 3.25rem;
	border-color: ${theme.colors.orangeLight};
	border-radius: 1.05rem;
	background: rgb(242 239 237 / 0.88);
	padding-block: 0.55rem;
	padding-right: 3rem;
	padding-left: 3rem;

	font-size: 1rem;
	line-height: 1.35;

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
	top: 50%;
	right: 2rem;
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
	transform: translateY(-50%);
	transition:
		background 160ms ease,
		color 160ms ease;

	&:hover,
	&:focus-visible {
		background: ${theme.alpha.orangeGlow};
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const Tabs = styled.div`
	position: relative;
	z-index: 3;
	display: flex;
	flex: 0 0 auto;
	gap: 0.5rem;
	overflow-x: auto;
	overflow-y: hidden;
	background: ${theme.colors.background};
	padding: 0 1.25rem 1rem;

	&::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		height: 0.8rem;
		background: linear-gradient(
			180deg,
			${theme.colors.background},
			rgb(232 226 222 / 0)
		);
		content: "";
		pointer-events: none;
		transform: translateY(100%);
	}
`;

const TabButton = styled.button<{
	$hasResults: boolean;
	$isActive: boolean;
	$showResultState: boolean;
}>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.45rem;
	flex: 0 0 auto;
	min-height: 2rem;
	border: 0.0625rem solid
		${({ $hasResults, $isActive, $showResultState }) =>
			$isActive
				? theme.colors.orangeLight
				: $showResultState && $hasResults
					? "rgb(218 142 91 / 0.45)"
					: theme.colors.transparent};
	border-radius: 62.4375rem;
	background: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeLight : theme.colors.surface};
	padding: 0.45rem 0.95rem;
	color: ${({ $hasResults, $isActive, $showResultState }) =>
		$isActive
			? theme.colors.invertedText
			: $showResultState && !$hasResults
				? theme.colors.muted
				: theme.colors.foreground};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
	line-height: 1;
	white-space: nowrap;
	transition:
		background 160ms ease,
		border-color 160ms ease,
		color 160ms ease;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		outline: none;
	}
`;

const TabCount = styled.span<{ $hasResults: boolean; $isActive: boolean }>`
	display: inline-flex;
	min-width: 1.25rem;
	height: 1.25rem;
	align-items: center;
	justify-content: center;
	border-radius: 999px;
	background: ${({ $hasResults, $isActive }) =>
		$isActive
			? "rgb(242 239 237 / 0.9)"
			: $hasResults
				? "rgb(218 142 91 / 0.16)"
				: "rgb(186 183 180 / 0.18)"};
	color: ${({ $hasResults, $isActive }) =>
		$isActive
			? theme.colors.orangeDark
			: $hasResults
				? theme.colors.orangeDark
				: theme.colors.muted};
	font-size: 0.72rem;
	font-weight: 700;
	line-height: 1;
`;

const ResultsArea = styled.div`
	position: relative;
	z-index: 1;
	display: flex;
	min-height: 16rem;
	flex: 1 1 auto;
	flex-direction: column;
	gap: 0.5rem;
	overflow-y: auto;
	padding: 0.9rem 1.25rem 6.25rem;
`;

const RecentSearchesBlock = styled.div`
	padding: 1.25rem 0 2rem;
`;

const RecentHeading = styled.h2`
	margin: 0 0 0.75rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.15rem;
	font-weight: 500;
	line-height: 1.2;
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

const ResultItem = styled.div`
	display: grid;
	align-items: center;
	gap: 0.9rem;
	grid-template-columns: minmax(0, 1fr) auto;
	border-radius: 0.8rem;
	transition:
		background 160ms ease,
		transform 160ms ease;

	&:hover,
	&:focus-within {
		background: rgb(242 239 237 / 0.78);
		transform: translateY(-0.0625rem);
	}

	@media (max-width: 34rem) {
		grid-template-columns: 1fr;
	}
`;

const ResultMain = styled.div`
	display: grid;
	align-items: center;
	gap: 0.9rem;
	grid-template-columns: 3.25rem minmax(0, 1fr);
	min-width: 0;
	padding: 0.6rem;
`;

const ResultCoverLink = styled(Link)`
	display: inline-flex;
	width: 3.25rem;
	height: 4.7rem;
	border-radius: 0.35rem;

	&:focus-visible {
		outline: 0.125rem solid ${theme.colors.orangeLight};
		outline-offset: 0.125rem;
	}
`;

const ResultLink = styled(Link)`
	display: flex;
	min-width: 0;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.35rem;
	color: ${theme.colors.foreground};
	text-decoration: none;

	&:focus-visible {
		outline: none;
	}
`;

const ResultCover = styled.img`
	width: 3.25rem;
	height: 4.7rem;
	border-radius: 0.35rem;
	object-fit: cover;
`;

const ResultMeta = styled.span`
	display: flex;
	min-width: 0;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.35rem;
`;

const ResultSeries = styled.span`
	display: inline-flex;
	max-width: 100%;
	align-items: center;
	border: 0.0625rem solid rgb(212 100 28 / 0.18);
	border-radius: 62.4375rem;
	background: rgb(242 239 237 / 0.62);
	padding: 0.28rem 0.55rem;
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.sans};
	font-size: 0.72rem;
	font-weight: 600;
	line-height: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const ResultTitle = styled.span`
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.05rem;
	font-weight: 500;
	line-height: 1.15;
`;

const ResultAuthor = styled.span`
	overflow: hidden;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.85rem;
	line-height: 1.3;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const ResultAuthorLink = styled(Link)`
	color: inherit;
	text-decoration: none;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
		text-decoration: underline;
	}
`;

const ResultMatchLine = styled.span`
	display: inline-flex;
	max-width: 100%;
	align-items: center;
	gap: 0.4rem;
	overflow: hidden;
	border-radius: 0.45rem;
	background: rgb(218 142 91 / 0.1);
	padding: 0.25rem 0.45rem;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.78rem;
	line-height: 1.25;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const ResultMatchField = styled.span`
	flex: 0 0 auto;
	color: ${theme.colors.orangeDark};
	font-weight: 700;
`;

const Highlight = styled.mark`
	background: ${theme.colors.transparent};
	color: ${theme.colors.orangeDark};
	font-weight: inherit;
`;

const WantButton = styled(Button)`
	&& {
		justify-self: end;
		margin-right: 0.6rem;
		white-space: nowrap;

		@media (max-width: 34rem) {
			display: none;
		}
	}
`;

const EmptyState = styled.div`
	padding: 2rem 0;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.95rem;
	text-align: center;
`;

const SearchFooter = styled.div`
	position: absolute;
	z-index: 2;
	right: 0;
	bottom: 0;
	left: 0;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 1rem;
	border-top: 0.0625rem solid rgb(211 202 196 / 0.72);
	background:
		linear-gradient(
			180deg,
			rgb(232 226 222 / 0),
			${theme.colors.background} 22%
		),
		${theme.colors.background};
	padding: 1.1rem 1.25rem 1rem;
`;

const ResultCount = styled.span`
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
	line-height: 1.2;
`;

const ViewAllButton = styled(Button)`
	&& {
		padding: 0.6rem 1.25rem;
		font-family: ${theme.fonts.sans};
		font-size: 0.95rem;
	}
`;
