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
	const { data } = useGenresByCategoryQuery({
		includeCounts: true,
		selected: selectedGenres,
	});
	const genreGroups = useMemo(() => data?.groups ?? [], [data?.groups]);
	const recommendations = useMemo(
		() => data?.recommendations ?? [],
		[data?.recommendations],
	);
	const [genreSearch, setGenreSearch] = useState("");
	const [selectedGroupKeys, setSelectedGroupKeys] = useState<string[]>([]);
	const normalizedSearch = genreSearch.trim().toLowerCase();

	const filteredGroups = useMemo(() => {
		if (!normalizedSearch) return genreGroups;

		return genreGroups
			.map((group) => ({
				...group,
				genres: group.genres.filter((genre) =>
					genre.name.toLowerCase().includes(normalizedSearch),
				),
			}))
			.filter(
				(group) =>
					group.name.toLowerCase().includes(normalizedSearch) ||
					group.category.toLowerCase().includes(normalizedSearch) ||
					group.genres.length > 0,
			);
	}, [genreGroups, normalizedSearch]);

	const visibleGroupKeys =
		selectedGroupKeys.length > 0
			? selectedGroupKeys
			: filteredGroups[0]?.key
				? [filteredGroups[0].key]
				: [];
	const activeGroups = visibleGroupKeys
		.map((key) => filteredGroups.find((group) => group.key === key))
		.filter((group): group is NonNullable<typeof group> => Boolean(group));
	const visibleGenres = Array.from(
		new Map(
			activeGroups
				.flatMap((group) => group.genres)
				.map((genre) => [genre.slug, genre]),
		).values(),
	);
	const allGenresFlat = useMemo(
		() =>
			Array.from(
				new Map(
					[...genreGroups.flatMap((group) => group.genres), ...recommendations].map(
						(genre) => [genre.slug, genre],
					),
				).values(),
			),
		[genreGroups, recommendations],
	);

	const toggleGroup = (key: string) => {
		setSelectedGroupKeys((current) =>
			current.includes(key)
				? current.filter((currentKey) => currentKey !== key)
				: [...current, key],
		);
	};

	return (
		<StepBody>
			<StepTitleRow>
				<StepTitle>Жанры</StepTitle>
				<GenreCount>
					{selectedGenres.length} / {MIN_SELECTED_GENRES} мин.
				</GenreCount>
			</StepTitleRow>
			<StepDescription>
				Выбери минимум {MIN_SELECTED_GENRES} жанров, которые тебе нравятся.
				Сначала открой одну или несколько групп, затем отметь жанры внутри.
			</StepDescription>

			{selectedGenres.length > 0 ? (
				<SelectedGenresRow>
					{selectedGenres.map((slug) => {
						const genre = allGenresFlat.find((item) => item.slug === slug);
						return genre ? (
							<SelectedChip
								key={slug}
								type="button"
								onClick={() => onToggle(slug)}
							>
								{genre.name}
								<ChipX>x</ChipX>
							</SelectedChip>
						) : null;
					})}
				</SelectedGenresRow>
			) : null}

			<GenreSearchInput
				placeholder="Поиск жанра..."
				value={genreSearch}
				onChange={(event) => setGenreSearch(event.target.value)}
			/>

			<GenrePicker>
				<PanelLabel>Группы жанров</PanelLabel>
				<GroupsRail aria-label="Группы жанров">
					{filteredGroups.map((group) => {
						const isActive = visibleGroupKeys.includes(group.key);
						const hasSelected = selectedGenres.some((slug) =>
							group.genres.some((genre) => genre.slug === slug),
						);

						return (
							<GroupButton
								key={group.key}
								type="button"
								$isActive={isActive}
								onClick={() => toggleGroup(group.key)}
							>
								<GroupName>
									{hasSelected ? <ColDot /> : null}
									{group.name}
								</GroupName>
								<GroupMeta>
									{group.category}
									{group.bookCount ? ` · ${group.bookCount}` : ""}
								</GroupMeta>
							</GroupButton>
						);
					})}
				</GroupsRail>

				<GenrePanel>
					<PanelLabel>
						{activeGroups.length > 1
							? "Жанры в выбранных группах"
							: activeGroups[0]?.name || "Жанры"}
					</PanelLabel>
					<GenrePillsWrap>
						{visibleGenres.map((genre) => {
							const isSelected = selectedGenres.includes(genre.slug);

							return (
								<GenreButton
									key={genre.id}
									type="button"
									$isSelected={isSelected}
									onClick={() => onToggle(genre.slug)}
								>
									{genre.name}
								</GenreButton>
							);
						})}
					</GenrePillsWrap>
				</GenrePanel>

				{recommendations.length > 0 ? (
					<GenrePanel>
						<PanelLabel>
							Если нравятся эти жанры, могут понравиться и эти
						</PanelLabel>
						<GenrePillsWrap>
							{recommendations.map((genre) => {
								const isSelected = selectedGenres.includes(genre.slug);

								return (
									<GenreButton
										key={genre.id}
										type="button"
										$isSelected={isSelected}
										onClick={() => onToggle(genre.slug)}
									>
										{genre.name}
									</GenreButton>
								);
							})}
						</GenrePillsWrap>
					</GenrePanel>
				) : null}
			</GenrePicker>
		</StepBody>
	);
};

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
	cursor: pointer;
	font: inherit;
	font-size: 0.8125rem;
	font-weight: 600;
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

const GenrePicker = styled.div`
	display: grid;
	gap: 0.75rem;
	border: 0.0625rem solid rgb(186 183 180 / 0.5);
	border-radius: 0.5rem;
	padding: 0.65rem;
`;

const GroupsRail = styled.div`
	display: flex;
	gap: 0.55rem;
	overflow-x: auto;
	padding-bottom: 0.2rem;

	&::-webkit-scrollbar {
		height: 0.25rem;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: rgb(186 183 180 / 0.5);
		border-radius: 999px;
	}
`;

const GroupButton = styled.button<{ $isActive: boolean }>`
	display: flex;
	min-width: 12rem;
	max-width: 15rem;
	flex: 0 0 auto;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.25rem;
	border: 0.0625rem solid
		${({ $isActive }) => ($isActive ? "#da8e5b" : "rgb(186 183 180 / 0.45)")};
	border-radius: 0.55rem;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.12)" : "rgb(242 239 237 / 0.42)"};
	padding: 0.65rem 0.75rem;
	color: ${({ $isActive }) =>
		$isActive ? "#da8e5b" : theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	text-align: left;
	transition:
		background 150ms,
		border-color 150ms,
		color 150ms;

	&:hover {
		background: ${({ $isActive }) =>
			$isActive ? "rgb(218 142 91 / 0.18)" : "rgb(35 61 77 / 0.04)"};
	}
`;

const GroupName = styled.span`
	display: flex;
	align-items: center;
	gap: 0.4rem;
	font-size: 0.9rem;
	font-weight: 700;
	line-height: 1.2;
`;

const GroupMeta = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.72rem;
	line-height: 1.25;
`;

const ColDot = styled.span`
	flex-shrink: 0;
	width: 0.4rem;
	height: 0.4rem;
	border-radius: 50%;
	background: #da8e5b;
`;

const GenrePanel = styled.div`
	display: grid;
	gap: 0.45rem;
`;

const PanelLabel = styled.h3`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.82rem;
	font-weight: 700;
	line-height: 1.2;
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
	cursor: pointer;
	font: inherit;
	font-size: 0.875rem;
	font-weight: 600;
	transition:
		background 150ms,
		border-color 150ms,
		color 150ms;
`;
