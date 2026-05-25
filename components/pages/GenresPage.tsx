"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styled from "styled-components";

import { useGenresByCategoryQuery } from "@/shared/api/genres";
import { theme } from "@/shared/theme";
import { GenrePillSkeleton } from "@/shared/ui/Skeleton";

const formatCompactCount = (value?: number) => {
	if (!value) return "";
	if (value >= 1000) return `${Math.round(value / 100) / 10}k`;

	return String(value);
};

const GenresPage = () => {
	const [selectedGroupKeys, setSelectedGroupKeys] = useState<string[]>([]);
	const [likedGenres, setLikedGenres] = useState<string[]>([]);
	const [search, setSearch] = useState("");
	const { data, isLoading } = useGenresByCategoryQuery({
		includeCounts: true,
		selected: likedGenres,
	});
	const groups = useMemo(() => data?.groups ?? [], [data?.groups]);
	const recommendations = data?.recommendations ?? [];
	const normalizedSearch = search.trim().toLowerCase();

	const filteredGroups = useMemo(() => {
		if (!normalizedSearch) return groups;

		return groups
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
	}, [groups, normalizedSearch]);

	const visibleGroupKeys =
		selectedGroupKeys.length > 0
			? selectedGroupKeys
			: filteredGroups[0]?.key
				? [filteredGroups[0].key]
				: [];
	const visibleGroups = visibleGroupKeys
		.map((key) => filteredGroups.find((group) => group.key === key))
		.filter((group): group is NonNullable<typeof group> => Boolean(group));
	const visibleGenres = Array.from(
		new Map(
			visibleGroups
				.flatMap((group) => group.genres)
				.map((genre) => [genre.slug, genre]),
		).values(),
	);

	const toggleGroup = (key: string) => {
		setSelectedGroupKeys((current) =>
			current.includes(key)
				? current.filter((currentKey) => currentKey !== key)
				: [...current, key],
		);
	};

	const toggleLikedGenre = (slug: string) => {
		setLikedGenres((current) =>
			current.includes(slug)
				? current.filter((currentSlug) => currentSlug !== slug)
				: [...current, slug],
		);
	};

	const renderGenreChip = (genre: (typeof visibleGenres)[number]) => {
		const isLiked = likedGenres.includes(genre.slug);

		return (
			<GenreChip key={genre.id}>
				<GenreLink href={`/genres/${genre.slug}`}>
					<GenreName>{genre.name}</GenreName>
					{genre.bookCount ? (
						<GenreCountText>{formatCompactCount(genre.bookCount)}</GenreCountText>
					) : null}
				</GenreLink>
				<AddGenreButton
					type="button"
					aria-label={`Добавить ${genre.name} в рекомендации`}
					$isLiked={isLiked}
					onClick={() => toggleLikedGenre(genre.slug)}
				>
					{isLiked ? "✓" : "+"}
				</AddGenreButton>
			</GenreChip>
		);
	};

	return (
		<Page>
			<Hero>
				<HeroTop>
					<PageTitle>Жанры</PageTitle>
					<SearchInput
						placeholder="Найти жанр или группу"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
					/>
					{likedGenres.length > 0 ? (
						<ClearButton type="button" onClick={() => setLikedGenres([])}>
							Сбросить
						</ClearButton>
					) : null}
				</HeroTop>
			</Hero>

			<Content>
				{isLoading ? (
					<SkeletonGrid aria-label="Загружаем жанры">
						{Array.from({ length: 32 }, (_, index) => (
							<GenrePillSkeleton key={index} />
						))}
					</SkeletonGrid>
				) : (
					<>
						<GroupRow aria-label="Группы жанров">
							{filteredGroups.map((group) => {
								const isActive = visibleGroupKeys.includes(group.key);

								return (
									<GroupChip
										key={group.key}
										type="button"
										$isActive={isActive}
										onClick={() => toggleGroup(group.key)}
									>
										<span>{group.name}</span>
										<GroupCount>{group.genres.length}</GroupCount>
									</GroupChip>
								);
							})}
						</GroupRow>

						<GenreSection>
							<SectionHeader>
								<SectionTitle>
									{visibleGroups.length > 1
										? "Выбранные группы"
										: visibleGroups[0]?.name || "Жанры"}
								</SectionTitle>
								<SectionMeta>{visibleGenres.length}</SectionMeta>
							</SectionHeader>
							<GenreGrid>{visibleGenres.map(renderGenreChip)}</GenreGrid>
						</GenreSection>

						{recommendations.length > 0 ? (
							<RecommendationSection>
								<SectionHeader>
									<SectionTitle>Может понравиться</SectionTitle>
									<SectionMeta>{recommendations.length}</SectionMeta>
								</SectionHeader>
								<GenreGrid>{recommendations.map(renderGenreChip)}</GenreGrid>
							</RecommendationSection>
						) : null}
					</>
				)}
			</Content>
		</Page>
	);
};

export default GenresPage;

const Page = styled.div`
	min-height: 100dvh;
	background: ${theme.colors.background};
	padding-bottom: 1.5rem;
`;

const Hero = styled.section`
	width: min(
		calc(100% - (${theme.layout.contentGutter} * 2)),
		${theme.layout.contentMaxWidth}
	);
	margin: 0 auto;
	padding: clamp(1.35rem, 2.8vw, 2.4rem) 0 0.8rem;
`;

const HeroTop = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.75rem;
`;

const PageTitle = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: clamp(2rem, 3.4vw, 3.35rem);
	font-weight: 600;
	line-height: 1;
`;

const SearchInput = styled.input`
	width: min(100%, 24rem);
	min-height: 2.2rem;
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 999px;
	background: rgb(242 239 237 / 0.72);
	padding: 0.42rem 0.85rem;
	color: ${theme.colors.foreground};
	font: inherit;
	font-size: 0.9rem;

	&:focus {
		border-color: ${theme.colors.orangeLight};
		outline: none;
	}
`;

const ClearButton = styled.button`
	border: 0;
	background: transparent;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	font-size: 0.86rem;
	font-weight: 700;
`;

const Content = styled.section`
	display: flex;
	width: min(
		calc(100% - (${theme.layout.contentGutter} * 2)),
		${theme.layout.contentMaxWidth}
	);
	flex-direction: column;
	gap: 0.8rem;
	margin: 0 auto;
`;

const GroupRow = styled.div`
	display: flex;
	max-height: 4.95rem;
	flex-wrap: wrap;
	gap: 0.38rem;
	overflow: hidden;
`;

const GroupChip = styled.button<{ $isActive: boolean }>`
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	border: 0.0625rem solid
		${({ $isActive }) =>
			$isActive ? theme.colors.orangeLight : "rgb(211 202 196 / 0.72)"};
	border-radius: 999px;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.16)" : "rgb(242 239 237 / 0.62)"};
	padding: 0.26rem 0.42rem 0.28rem 0.62rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeDark : theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.78rem;
	font-weight: 700;
	line-height: 1;
`;

const GroupCount = styled.span`
	display: inline-flex;
	min-width: 1.15rem;
	height: 1.15rem;
	align-items: center;
	justify-content: center;
	border-radius: 999px;
	background: rgb(255 255 255 / 0.66);
	color: ${theme.colors.softForeground};
	font-size: 0.7rem;
	font-weight: 700;
`;

const GenreSection = styled.section`
	border-radius: 0.85rem;
	background: rgb(242 239 237 / 0.58);
	padding: 0.8rem;
`;

const RecommendationSection = styled(GenreSection)`
	padding-top: 0.7rem;
`;

const SectionHeader = styled.div`
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 0.55rem;
`;

const SectionTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.28rem;
	font-weight: 600;
	line-height: 1.1;
`;

const SectionMeta = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.82rem;
`;

const GenreGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.45rem;
`;

const GenreChip = styled.article`
	display: inline-flex;
	max-width: 16rem;
	align-items: center;
	gap: 0.38rem;
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 999px;
	background: rgb(255 255 255 / 0.5);
	padding: 0.22rem 0.28rem 0.22rem 0.72rem;
`;

const GenreLink = styled(Link)`
	display: inline-flex;
	min-width: 0;
	align-items: baseline;
	gap: 0.35rem;
	color: inherit;
	text-decoration: none;
`;

const GenreName = styled.span`
	overflow: hidden;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
	font-weight: 700;
	line-height: 1.2;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const GenreCountText = styled.span`
	flex: 0 0 auto;
	color: ${theme.colors.softForeground};
	font-size: 0.76rem;
	line-height: 1;
`;

const AddGenreButton = styled.button<{ $isLiked: boolean }>`
	display: inline-flex;
	width: 1.45rem;
	height: 1.45rem;
	flex: 0 0 auto;
	align-items: center;
	justify-content: center;
	border: 0;
	border-radius: 50%;
	background: ${({ $isLiked }) =>
		$isLiked ? theme.colors.orangeLight : "rgb(218 142 91 / 0.13)"};
	color: ${({ $isLiked }) =>
		$isLiked ? theme.colors.invertedText : theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	font-size: 1rem;
	font-weight: 700;
	line-height: 1;
`;

const SkeletonGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.6rem;
`;
