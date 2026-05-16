"use client";

import { useState } from "react";
import styled from "styled-components";

import AuthModal, { type IAuthModalMode } from "@/components/pages/AuthModal";
import { usePublicCollectionsQuery } from "@/shared/api/collections";
import { theme } from "@/shared/theme";
import { SkeletonBlock } from "@/shared/ui/Skeleton";
import { CollectionRow } from "./CollectionsRow";

const CollectionsPage = () => {
	const [page, setPage] = useState(1);
	const [authModalMode, setAuthModalMode] = useState<IAuthModalMode | null>(
		null,
	);
	const {
		data: collectionsResponse,
		error,
		isError,
		isLoading,
	} = usePublicCollectionsQuery({ limit: 20, page });
	const collections = collectionsResponse?.items ?? [];
	const pages = collectionsResponse?.pages ?? 1;
	const total = collectionsResponse?.total ?? 0;
	const canGoPrev = page > 1;
	const canGoNext = page < pages;

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
							<Pagination>
								<PageButton
									disabled={!canGoPrev}
									type="button"
									onClick={() => setPage((current) => Math.max(1, current - 1))}
								>
									Назад
								</PageButton>
								<PageButton
									disabled={!canGoNext}
									type="button"
									onClick={() =>
										setPage((current) => Math.min(pages, current + 1))
									}
								>
									Вперёд
								</PageButton>
							</Pagination>
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

const Pagination = styled.div`
	display: flex;
	justify-content: center;
	gap: 0.75rem;
	margin-top: 1.5rem;
`;

const PageButton = styled.button`
	border: 0.0625rem solid ${theme.colors.orangeDark};
	border-radius: 62.4375rem;
	background: ${theme.colors.transparent};
	padding: 0.55rem 1rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	font-size: 0.95rem;
	font-weight: 700;

	&:not(:disabled):hover,
	&:not(:disabled):focus-visible {
		background: ${theme.colors.orangePrimary};
		border-color: ${theme.colors.orangePrimary};
		color: ${theme.colors.white};
		outline: none;
	}

	&:disabled {
		cursor: default;
		opacity: 0.45;
	}
`;
