"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";

import { useGenresByCategoryQuery } from "@/shared/api/genres";
import { theme } from "@/shared/theme";
import { InputField } from "@/shared/ui/InputField";

import {
	StepBody,
	StepDescription,
	StepTitle,
	StepTitleRow,
} from "./stepStyles";
import { MIN_SELECTED_GENRES } from "./types";

interface IGenresStepProps {
	selectedGenres: string[];
	onToggle: (slug: string) => void;
}

export const GenresStep = ({ selectedGenres, onToggle }: IGenresStepProps) => {
	const { data } = useGenresByCategoryQuery();
	const genreCategories = useMemo(() => data ?? [], [data]);

	const [genreSearch, setGenreSearch] = useState("");
	const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);
	const [selectedSubIdx, setSelectedSubIdx] = useState(0);

	const isSearching = genreSearch.trim().length > 0;

	const filteredCategories = useMemo(() => {
		if (!isSearching) return genreCategories;
		const q = genreSearch.trim().toLowerCase();
		return genreCategories
			.map((cat) => ({
				...cat,
				subcategories: cat.subcategories
					.map((sub) => ({
						...sub,
						genres: sub.genres.filter((g) => g.name.toLowerCase().includes(q)),
					}))
					.filter((sub) => sub.genres.length > 0),
			}))
			.filter((cat) => cat.subcategories.length > 0);
	}, [genreCategories, genreSearch, isSearching]);

	const safeCatIdx = Math.min(
		selectedCategoryIdx,
		Math.max(0, filteredCategories.length - 1),
	);
	const activeCategory = filteredCategories[safeCatIdx];
	const safeSubIdx = Math.min(
		selectedSubIdx,
		Math.max(0, (activeCategory?.subcategories.length ?? 1) - 1),
	);
	const activeSubs = activeCategory?.subcategories ?? [];
	const activeGenres = activeSubs[safeSubIdx]?.genres ?? [];

	const allGenresFlat = useMemo(
		() =>
			genreCategories.flatMap((cat) =>
				cat.subcategories.flatMap((sub) => sub.genres),
			),
		[genreCategories],
	);

	return (
		<StepBody>
			<StepTitleRow>
				<StepTitle>Жанры</StepTitle>
				<GenreCount>
					{selectedGenres.length} / {MIN_SELECTED_GENRES} мин.
				</GenreCount>
			</StepTitleRow>
			<StepDescription>
				Выбери минимум {MIN_SELECTED_GENRES} жанров — мы подберём книги именно
				для тебя.
			</StepDescription>

			{selectedGenres.length > 0 ? (
				<SelectedGenresRow>
					{selectedGenres.map((slug) => {
						const genre = allGenresFlat.find((g) => g.slug === slug);
						return genre ? (
							<SelectedChip
								key={slug}
								type="button"
								onClick={() => onToggle(slug)}
							>
								{genre.name}
								<ChipX>×</ChipX>
							</SelectedChip>
						) : null;
					})}
				</SelectedGenresRow>
			) : null}

			<GenreSearchInput
				placeholder="Поиск жанра..."
				value={genreSearch}
				onChange={(e) => setGenreSearch(e.target.value)}
			/>

			<GenreColumns>
				<GenreCol>
					{filteredCategories.map((cat, idx) => {
						const hasSelected = selectedGenres.some((slug) =>
							cat.subcategories.some((sub) =>
								sub.genres.some((g) => g.slug === slug),
							),
						);
						return (
							<ColItem
								key={cat.category}
								type="button"
								$isActive={idx === safeCatIdx}
								onClick={() => {
									setSelectedCategoryIdx(idx);
									setSelectedSubIdx(0);
								}}
							>
								{hasSelected ? <ColDot /> : null}
								{cat.category}
							</ColItem>
						);
					})}
				</GenreCol>

				<GenreCol>
					{activeSubs.map((sub, idx) => {
						const hasSelected = selectedGenres.some((slug) =>
							sub.genres.some((g) => g.slug === slug),
						);
						return (
							<ColItem
								key={sub.subcategory}
								type="button"
								$isActive={idx === safeSubIdx}
								onClick={() => setSelectedSubIdx(idx)}
							>
								{hasSelected ? <ColDot /> : null}
								{sub.subcategory}
							</ColItem>
						);
					})}
				</GenreCol>

				<GenreCol $pills>
					<GenrePillsWrap>
						{activeGenres.map((genre) => {
							const isSel = selectedGenres.includes(genre.slug);
							return (
								<GenreButton
									key={genre.id}
									type="button"
									$isSelected={isSel}
									onClick={() => onToggle(genre.slug)}
								>
									{genre.name}
								</GenreButton>
							);
						})}
					</GenrePillsWrap>
				</GenreCol>
			</GenreColumns>
		</StepBody>
	);
};

/* ── Styles ──────────────────────────────────────────────── */

const GenreCount = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.875rem;
	white-space: nowrap;
`;

const SelectedGenresRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
`;

const SelectedChip = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 0.3rem;
	border: 0.0625rem solid rgb(218 142 91 / 0.6);
	border-radius: 999px;
	background: rgb(218 142 91 / 0.1);
	padding: 0.2rem 0.55rem 0.2rem 0.7rem;
	color: #da8e5b;
	font: inherit;
	font-size: 0.8125rem;
	font-weight: 600;
	cursor: pointer;
	transition: background 150ms;

	&:hover {
		background: rgb(218 142 91 / 0.2);
	}
`;

const ChipX = styled.span`
	color: #da8e5b;
	font-size: 1rem;
	font-weight: 300;
	line-height: 1;
`;

const GenreSearchInput = styled(InputField)`
	&& {
		background: rgb(35 61 77 / 0.07);
		border-color: rgb(35 61 77 / 0.18);

		&:hover,
		&:focus {
			border-color: #da8e5b;
			background: rgb(35 61 77 / 0.07);
		}
	}
`;

const GenreColumns = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1.3fr;
	height: fit-content;
	min-height: 0;
	overflow: hidden;
	border: 0.0625rem solid rgb(186 183 180 / 0.5);
	border-radius: 0.5rem;
`;

const GenreCol = styled.div<{ $pills?: boolean }>`
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	padding: 0.5rem;
	border-right: 0.0625rem solid rgb(186 183 180 / 0.4);

	&:last-child {
		border-right: 0;
	}

	&::-webkit-scrollbar {
		width: 0.25rem;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: rgb(186 183 180 / 0.5);
		border-radius: 999px;
	}
`;

const ColItem = styled.button<{ $isActive: boolean }>`
	display: flex;
	align-items: center;
	gap: 0.4rem;
	width: 100%;
	padding: 0.4rem 0.5rem;
	border: 0;
	border-radius: 0.375rem;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.12)" : "transparent"};
	color: ${({ $isActive }) => ($isActive ? "#da8e5b" : "#4f5152")};
	font: inherit;
	font-size: 0.875rem;
	font-weight: ${({ $isActive }) => ($isActive ? "600" : "400")};
	text-align: left;
	cursor: pointer;
	transition:
		background 150ms,
		color 150ms;

	&:hover {
		background: ${({ $isActive }) =>
			$isActive ? "rgb(218 142 91 / 0.18)" : "rgb(35 61 77 / 0.04)"};
	}
`;

const ColDot = styled.span`
	flex-shrink: 0;
	width: 0.4rem;
	height: 0.4rem;
	border-radius: 50%;
	background: #da8e5b;
`;

const GenrePillsWrap = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
	padding: 0.25rem 0;
`;

const GenreButton = styled.button<{ $isSelected: boolean }>`
	border: 0.0625rem solid
		${({ $isSelected }) => ($isSelected ? "#da8e5b" : theme.colors.border)};
	border-radius: 999px;
	background: ${({ $isSelected }) =>
		$isSelected ? "#da8e5b" : theme.colors.transparent};
	padding: 0.3rem 0.75rem;
	color: ${({ $isSelected }) =>
		$isSelected ? "#f2efed" : theme.colors.softForeground};
	font: inherit;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition:
		background 150ms,
		border-color 150ms,
		color 150ms;
`;
