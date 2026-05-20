"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { CollectionRow } from "@/components/pages/ColectionsPage/CollectionsRow";
import { CreateCollectionModal } from "@/components/pages/book-details/CreateCollectionModal";
import { useMyCollectionsQuery } from "@/shared/api/collections";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { AppPagination } from "@/shared/ui/AppPagination";
import { Button } from "@/shared/ui/Button";
import { SkeletonBlock } from "@/shared/ui/Skeleton";

const MyCollectionsPage = () => {
	const router = useRouter();
	const session = useAuthStore((state) => state.session);
	const [page, setPage] = useState(1);
	const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
	const { data, error, isError, isLoading } = useMyCollectionsQuery(
		{ limit: 20, page },
		{ enabled: Boolean(session) },
	);
	const collections = data?.items ?? [];
	const pages = data?.pages ?? 1;
	const total = data?.total ?? 0;

	useEffect(() => {
		if (!session) {
			router.replace("/?auth=required");
		}
	}, [router, session]);

	if (!session) {
		return null;
	}

	return (
		<Page>
			<Hero>
				<HeroInner>
					<HeroCopy>
						<PageTitle>Мои подборки</PageTitle>
						<HeroText>
							Ваши личные и публичные книжные полки в одном месте.
						</HeroText>
					</HeroCopy>
					<Button
						buttonType="containedInverted"
						type="button"
						onClick={() => setIsCreateCollectionOpen(true)}
					>
						Создать подборку
					</Button>
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
					<EmptyState>
						<EmptyTitle>Подборок пока нет</EmptyTitle>
						<EmptyText>
							Создайте первую подборку для любимых книг, настроений и будущих
							полок.
						</EmptyText>
						<Button
							buttonType="containedInverted"
							type="button"
							onClick={() => setIsCreateCollectionOpen(true)}
						>
							Создать подборку
						</Button>
					</EmptyState>
				) : (
					<>
						<ListSummary>
							Всего подборок: {total}. Страница {page} из {pages}.
						</ListSummary>
						<CollectionList>
							{collections.map((collection) => (
								<CollectionRow
									key={collection.id}
									collection={collection}
									showSaveButton={false}
									onAuthRequired={() => undefined}
								/>
							))}
						</CollectionList>
						<AppPagination count={pages} page={page} onChange={setPage} />
					</>
				)}
			</Content>

			{isCreateCollectionOpen ? (
				<CreateCollectionModal onClose={() => setIsCreateCollectionOpen(false)} />
			) : null}
		</Page>
	);
};

export default MyCollectionsPage;

const CollectionSkeleton = () => (
	<SkeletonRow aria-hidden="true">
		<SkeletonCopy>
			<SkeletonBlock $height="1.25rem" $width="min(100%, 22rem)" />
			<SkeletonBlock $height="1rem" $width="7rem" />
			<SkeletonBlock $height="1.75rem" $radius="50px" $width="7rem" />
		</SkeletonCopy>
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
	display: flex;
	width: min(
		calc(100% - (${theme.layout.contentGutter} * 2)),
		${theme.layout.collectionsPageMaxWidth}
	);
	align-items: flex-end;
	justify-content: space-between;
	gap: 1rem;
	margin: 0 auto;
	padding: 4vw 0 0;

	@media (max-width: 42rem) {
		align-items: flex-start;
		flex-direction: column;
	}
`;

const HeroCopy = styled.div`
	min-width: 0;
`;

const PageTitle = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 2.5vw;
	font-weight: 600;
	line-height: 0.98;

	@media (max-width: 48rem) {
		font-size: 2.5rem;
	}
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

const StateMessage = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;

const EmptyState = styled.section`
	border: 0.0625rem dashed ${theme.colors.border};
	border-radius: 1rem;
	background: rgb(255 255 255 / 0.54);
	padding: 1.5rem;
`;

const EmptyTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.5rem;
	line-height: 1.15;
`;

const EmptyText = styled.p`
	max-width: 36rem;
	margin: 0.5rem 0 1rem;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.45;
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

	@media (max-width: 42rem) {
		flex-direction: column;
		align-items: stretch;
	}
`;

const SkeletonCopy = styled.div`
	display: flex;
	flex: 1 1 22.375rem;
	min-width: 0;
	max-width: 22.375rem;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.32vw;
`;

const SkeletonPreview = styled.div`
	display: flex;
	flex: 0 0 auto;
	align-items: center;
	justify-content: flex-end;
	gap: 0.5rem;
`;
