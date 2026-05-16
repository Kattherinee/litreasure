"use client";

import styled from "styled-components";

import { useGenresByCategoryQuery } from "@/shared/api/genres";
import { theme } from "@/shared/theme";
import { GenrePill } from "@/shared/ui/GenrePill";
import { GenrePillSkeleton } from "@/shared/ui/Skeleton";

const GenresPage = () => {
	const { data: categories = [], isLoading } = useGenresByCategoryQuery();

	return (
		<Page>
			<Hero>
				<PageTitle>Жанры</PageTitle>
				<PageText>Все книжные направления в одном месте.</PageText>
			</Hero>

			<Content>
				{isLoading ? (
					<SkeletonGrid aria-label="Загружаем жанры">
						{Array.from({ length: 32 }, (_, index) => (
							<GenrePillSkeleton key={index} />
						))}
					</SkeletonGrid>
				) : (
					categories.map((category) => (
						<CategorySection key={category.category}>
							<CategoryTitle>{category.category}</CategoryTitle>
							{category.subcategories.map((subcategory) => (
								<SubcategoryBlock key={subcategory.subcategory}>
									<SubcategoryTitle>{subcategory.subcategory}</SubcategoryTitle>
									<GenreGrid>
										{subcategory.genres.map((genre) => (
											<GenrePill key={genre.id} href={`/genres/${genre.slug}`}>
												{genre.name}
											</GenrePill>
										))}
									</GenreGrid>
								</SubcategoryBlock>
							))}
						</CategorySection>
					))
				)}
			</Content>
		</Page>
	);
};

export default GenresPage;

const Page = styled.div`
	min-height: 100dvh;
	background: ${theme.colors.background};
	padding-bottom: 5rem;
`;

const Hero = styled.section`
	width: min(
		calc(100% - (${theme.layout.contentGutter} * 2)),
		${theme.layout.contentMaxWidth}
	);
	margin: 0 auto;
	padding: clamp(3rem, 6vw, 5rem) 0 clamp(2rem, 4vw, 3rem);
`;

const PageTitle = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: clamp(2.25rem, 5vw, 4.5rem);
	font-weight: 600;
	line-height: 1;
`;

const PageText = styled.p`
	max-width: 36rem;
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1.05rem;
	line-height: 1.6;
`;

const Content = styled.section`
	display: flex;
	width: min(
		calc(100% - (${theme.layout.contentGutter} * 2)),
		${theme.layout.contentMaxWidth}
	);
	flex-direction: column;
	gap: 2rem;
	margin: 0 auto;
`;

const CategorySection = styled.section`
	border-radius: 1rem;
	background: rgb(242 239 237 / 0.58);
	padding: clamp(1rem, 3vw, 1.75rem);
`;

const CategoryTitle = styled.h2`
	margin: 0 0 1rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.6rem;
	font-weight: 600;
	line-height: 1.15;
`;

const SubcategoryBlock = styled.div`
	& + & {
		margin-top: 1.2rem;
	}
`;

const SubcategoryTitle = styled.h3`
	margin: 0 0 0.65rem;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.92rem;
	font-weight: 700;
	line-height: 1.2;
`;

const GenreGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.6rem;
`;

const SkeletonGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.6rem;
`;
