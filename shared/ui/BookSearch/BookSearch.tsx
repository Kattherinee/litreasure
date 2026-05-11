"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

import { useBookCardsQuery } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { InputField } from "@/shared/ui/InputField";

const MIN_SEARCH_LENGTH = 2;
const SEARCH_RESULT_LIMIT = 6;

const BookSearch = () => {
	const [searchValue, setSearchValue] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const normalizedSearchValue = searchValue.trim();
	const shouldSearch = normalizedSearchValue.length >= MIN_SEARCH_LENGTH;
	const { data: searchResults = [], isFetching } = useBookCardsQuery(
		{ limit: SEARCH_RESULT_LIMIT, search: normalizedSearchValue },
		{ enabled: shouldSearch },
	);
	const shouldShowResults = isFocused && shouldSearch;

	return (
		<SearchWrap
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) {
					setIsFocused(false);
				}
			}}
		>
			<SearchIcon aria-hidden="true" />
			<SearchInput
				type="search"
				placeholder="Название, автор"
				aria-label="Поиск книг"
				value={searchValue}
				onChange={(event) => setSearchValue(event.target.value)}
				onFocus={() => setIsFocused(true)}
			/>

			{shouldShowResults ? (
				<SearchResults aria-label="Результаты поиска">
					{isFetching ? <SearchEmpty>Ищем книги...</SearchEmpty> : null}
					{!isFetching && searchResults.length > 0
						? searchResults.map((book) => (
								<SearchResult
									key={book.id}
									href={`/books/${book.id}`}
									onClick={() => {
										setSearchValue("");
										setIsFocused(false);
									}}
								>
									<SearchResultCover
										src={book.coverUrl ?? "/images/book-placeholder.svg"}
										alt=""
									/>
									<SearchResultMeta>
										<SearchResultTitle>{book.title}</SearchResultTitle>
										<SearchResultAuthor>{book.author}</SearchResultAuthor>
									</SearchResultMeta>
								</SearchResult>
							))
						: null}
					{!isFetching && searchResults.length === 0 ? (
						<SearchEmpty>Ничего не найдено</SearchEmpty>
					) : null}
				</SearchResults>
			) : null}
		</SearchWrap>
	);
};

export default BookSearch;

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
	left: 14px;
	bottom: 55%;
	width: 14px;
	height: 14px;
	border: 2px solid currentColor;
	border-radius: 50%;
	color: ${theme.colors.softForeground};
	pointer-events: none;
	transform: translateY(50%);

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
	min-height: 34px;
	padding-left: 42px;
`;

const SearchResults = styled.div`
	position: absolute;
	z-index: 5;
	top: calc(100% + 0.5rem);
	right: 0;
	left: 0;
	overflow: hidden;
	border: 0.0625rem solid ${theme.colors.border};
	border-radius: 0.75rem;
	background: ${theme.colors.surface};
	box-shadow: 0 0.75rem 2rem rgb(0 0 0 / 0.18);
`;

const SearchResult = styled(Link)`
	display: grid;
	align-items: center;
	gap: 0.75rem;
	grid-template-columns: 2rem minmax(0, 1fr);
	padding: 0.55rem 0.7rem;
	color: ${theme.colors.foreground};
	text-decoration: none;
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

const SearchResultCover = styled.img`
	width: 2rem;
	height: 2.85rem;
	border-radius: 0.18rem;
	object-fit: cover;
`;

const SearchResultMeta = styled.span`
	display: flex;
	min-width: 0;
	flex-direction: column;
`;

const SearchResultTitle = styled.span`
	overflow: hidden;
	font-family: ${theme.fonts.serif};
	font-size: 0.95rem;
	font-weight: 500;
	line-height: 1.2;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const SearchResultAuthor = styled.span`
	overflow: hidden;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.78rem;
	line-height: 1.3;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const SearchEmpty = styled.div`
	padding: 0.85rem;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
`;
