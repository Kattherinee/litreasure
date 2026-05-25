"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { CreateCollectionModal } from "@/components/pages/book-details/CreateCollectionModal";
import { useMyAuthorsQuery } from "@/shared/api/authors";
import { useChallengesQuery } from "@/shared/api/book-challenge";
import {
	useMyCollectionsQuery,
	useSubscribedCollectionsQuery,
} from "@/shared/api/collections";
import { useMySeriesQuery } from "@/shared/api/series";
import {
	useDeleteBookTrackingMutation,
	useUserBookStatusCountsQuery,
	useUserBooksQuery,
	type IUserBookStatus,
	type IUserBookTracking,
} from "@/shared/api/user-books";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { BookCard } from "@/shared/ui/BookCard";
import { Button } from "@/shared/ui/Button";

const statusTabs: Array<{ id: IUserBookStatus | "all"; label: string }> = [
	{ id: "all", label: "Все книги" },
	{ id: "reading", label: "Сейчас читаю" },
	{ id: "planned", label: "В планах" },
	{ id: "finished", label: "Прочитано" },
	{ id: "paused", label: "Пауза" },
	{ id: "rereading", label: "Перечитываю" },
	{ id: "dropped", label: "Брошено" },
];

const statusLabels: Record<IUserBookStatus, string> = {
	dropped: "Брошено",
	finished: "Прочитано",
	paused: "Пауза",
	planned: "В планах",
	reading: "Читаю",
	rereading: "Перечитываю",
};

type ICollectionTreasureFilter = "all" | "created" | "subscribed";

const collectionFilterTabs: Array<{
	id: ICollectionTreasureFilter;
	label: string;
}> = [
	{ id: "all", label: "Все" },
	{ id: "created", label: "Созданные" },
	{ id: "subscribed", label: "Подписки" },
];

const sections = [
	{
		action: "Добавить автора",
		countKey: "authors",
		description: "Сохраненные авторы и личные авторские записи.",
		href: "/authors",
		title: "Мои авторы",
	},
	{
		action: "Добавить серию",
		countKey: "series",
		description: "Серии, за которыми вы следите или добавили для себя.",
		href: "/search?tab=series",
		title: "Мои серии",
	},
	{
		action: "Добавить цитату",
		countKey: "quotes",
		description: "Любимые цитаты и заметки по прочитанному.",
		href: "/treasures",
		title: "Мои цитаты",
	},
] as const;

const MyTreasuresPage = () => {
	const router = useRouter();
	const session = useAuthStore((state) => state.session);
	const deleteTrackingMutation = useDeleteBookTrackingMutation();
	const [activeStatus, setActiveStatus] = useState<IUserBookStatus | "all">(
		"all",
	);
	const [activeCollectionFilter, setActiveCollectionFilter] =
		useState<ICollectionTreasureFilter>("all");
	const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
	const collectionsRailRef = useRef<HTMLDivElement | null>(null);
	const isSessionReady = Boolean(session);
	const activeStatusParam = activeStatus === "all" ? undefined : activeStatus;
	const { data: challenges = [] } = useChallengesQuery({
		enabled: isSessionReady,
	});
	const { data: readingBooksData, isLoading: isReadingBooksLoading } =
		useUserBooksQuery(
			{
				limit: 3,
				status: "reading",
			},
			{ enabled: isSessionReady },
		);
	const {
		data: userBooksData,
		isError: isUserBooksError,
		isLoading: isUserBooksLoading,
	} = useUserBooksQuery(
		{
			limit: 20,
			status: activeStatusParam,
		},
		{ enabled: isSessionReady },
	);
	const { data: statusCounts } = useUserBookStatusCountsQuery({
		enabled: isSessionReady,
	});
	const { data: myCollectionsData, isLoading: isMyCollectionsLoading } =
		useMyCollectionsQuery({ limit: 5 }, { enabled: isSessionReady });
	const {
		data: subscribedCollectionsData,
		isLoading: isSubscribedCollectionsLoading,
	} = useSubscribedCollectionsQuery({ limit: 5 }, { enabled: isSessionReady });
	const { data: myAuthorsData } = useMyAuthorsQuery(
		{ limit: 1 },
		{ enabled: isSessionReady },
	);
	const { data: mySeriesData } = useMySeriesQuery({ enabled: isSessionReady });
	const activeChallenge = challenges.find((challenge) => challenge.isActive);
	const readingBooks = readingBooksData?.items ?? [];
	const trackedBooks = userBooksData?.items ?? [];
	const myCollections = myCollectionsData?.items ?? [];
	const myCollectionsTotal = myCollectionsData?.total ?? 0;
	const subscribedCollections = subscribedCollectionsData?.items ?? [];
	const subscribedCollectionsTotal = subscribedCollectionsData?.total ?? 0;
	const visibleCollections =
		activeCollectionFilter === "created"
			? myCollections
			: activeCollectionFilter === "subscribed"
				? subscribedCollections
				: Array.from(
						new Map(
							[...myCollections, ...subscribedCollections].map((collection) => [
								collection.id,
								collection,
							]),
						).values(),
					);
	const visibleCollectionsTotal =
		activeCollectionFilter === "created"
			? myCollectionsTotal
			: activeCollectionFilter === "subscribed"
				? subscribedCollectionsTotal
				: myCollectionsTotal + subscribedCollectionsTotal;
	const isCollectionsLoading =
		isMyCollectionsLoading || isSubscribedCollectionsLoading;
	const scrollCollectionsRail = (direction: "next" | "prev") => {
		const rail = collectionsRailRef.current;
		if (!rail) return;

		rail.scrollBy({
			behavior: "smooth",
			left:
				direction === "next"
					? rail.clientWidth * 0.82
					: -rail.clientWidth * 0.82,
		});
	};
	const resourceCounts = {
		authors: myAuthorsData?.total ?? 0,
		quotes: 0,
		series: mySeriesData?.total ?? 0,
	};
	const shouldShowAllBooksLink =
		(userBooksData?.total ?? 0) > trackedBooks.length ||
		trackedBooks.length > 6;
	const getStatusCount = (status: IUserBookStatus | "all") =>
		status === "all"
			? (statusCounts?.total ?? userBooksData?.total ?? 0)
			: (statusCounts?.[status] ?? 0);

	useEffect(() => {
		if (!session) {
			router.replace("/?auth=required");
		}
	}, [router, session]);

	if (!session) {
		return null;
	}

	if (!session) {
		return (
			<Page>
				<Content>
					<Title>Мои сокровища</Title>
					<EmptyState>
						Войдите в аккаунт, чтобы увидеть свои книги, подборки и прогресс.
					</EmptyState>
				</Content>
			</Page>
		);
	}

	return (
		<Page>
			<Content>
				<Hero>
					<HeroCopy>
						<Title>Мои сокровища</Title>
						<Lead>
							Ваши книги, подборки, авторы, серии и цитаты. Все сохраненное и
							созданное лично вами собирается здесь.
						</Lead>
					</HeroCopy>
					<HeroActions>
						<Button buttonType="containedInverted" href="/search">
							Добавить книгу
						</Button>
						<Button
							buttonType="outlined"
							type="button"
							onClick={() => setIsCreateCollectionOpen(true)}
						>
							Создать подборку
						</Button>
					</HeroActions>
				</Hero>

				<TopGrid>
					<ReadingCard>
						<CardEyebrow>Сейчас читаю</CardEyebrow>
						{isReadingBooksLoading ? (
							<CardText>Загружаем текущие книги...</CardText>
						) : readingBooks.length > 0 ? (
							<ReadingList>
								{readingBooks.map((item) => (
									<ReadingItem key={item.id}>
										<ReadingCover
											$coverUrl={item.book.coverUrl}
											aria-hidden="true"
										/>
										<ReadingMeta>
											<ReadingTitle href={`/books/${item.book.id}`}>
												{item.book.title}
											</ReadingTitle>
											<ReadingDetails>
												{item.book.author}
												{item.currentPage ? ` · ${item.currentPage} стр.` : ""}
											</ReadingDetails>
										</ReadingMeta>
									</ReadingItem>
								))}
							</ReadingList>
						) : (
							<>
								<CardTitle>Пока пусто</CardTitle>
								<CardText>
									Книги со статусом “читаю” будут закреплены здесь отдельно от
									общего списка.
								</CardText>
								<Button buttonType="oxygenPill" href="/search">
									Выбрать книгу
								</Button>
							</>
						)}
					</ReadingCard>

					<ChallengeCard>
						<CardEyebrow>Книжный вызов</CardEyebrow>
						<CardTitle>
							{activeChallenge
								? `${activeChallenge.targetValue} книг`
								: "Вызов не задан"}
						</CardTitle>
						<ProgressTrack aria-hidden="true">
							<ProgressFill $width={0} />
						</ProgressTrack>
						<CardText>
							{activeChallenge
								? "Прогресс вызова появится здесь, а подробности будут на отдельной странице."
								: "Создайте цель, чтобы отслеживать чтение в течение года, месяца или недели."}
						</CardText>
					</ChallengeCard>
				</TopGrid>

				<CollectionsPanel
					role="link"
					tabIndex={0}
					onClick={() => router.push("/collections/_username")}
					onKeyDown={(event) => {
						if (event.key !== "Enter" && event.key !== " ") return;

						event.preventDefault();
						router.push("/collections/_username");
					}}
				>
					<PanelHeader>
						<PanelTitle>Мои подборки</PanelTitle>
						<HeaderActions>
							{visibleCollections.length > 1 ? (
								<RailControls aria-label="Scroll my collections">
									<RailControlButton
										aria-label="Previous collections"
										type="button"
										onClick={(event) => {
											event.stopPropagation();
											scrollCollectionsRail("prev");
										}}
									>
										{"<"}
									</RailControlButton>
									<RailControlButton
										aria-label="Next collections"
										type="button"
										onClick={(event) => {
											event.stopPropagation();
											scrollCollectionsRail("next");
										}}
									>
										{">"}
									</RailControlButton>
								</RailControls>
							) : null}
							<SmallAction
								href="/collections/_username"
								onClick={(event) => event.stopPropagation()}
							>
								Смотреть все
							</SmallAction>
							<InlineAction
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									setIsCreateCollectionOpen(true);
								}}
							>
								Создать
							</InlineAction>
						</HeaderActions>
					</PanelHeader>
					<CollectionFilterTabs aria-label="Фильтр подборок">
						{collectionFilterTabs.map((filter) => (
							<CollectionFilterTab
								key={filter.id}
								$isActive={activeCollectionFilter === filter.id}
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									setActiveCollectionFilter(filter.id);
								}}
								onKeyDown={(event) => event.stopPropagation()}
							>
								{filter.label}
							</CollectionFilterTab>
						))}
					</CollectionFilterTabs>
					<CollectionSummary>
						<CollectionCount>{visibleCollectionsTotal}</CollectionCount>
						<CollectionText>
							{visibleCollectionsTotal === 1
								? "подборка в ваших сокровищах"
								: "подборок в ваших сокровищах"}
						</CollectionText>
					</CollectionSummary>
					{isCollectionsLoading ? (
						<CollectionPreviewText>
							Загружаем ваши подборки...
						</CollectionPreviewText>
					) : visibleCollections.length > 0 ? (
						<MyCollectionsRail ref={collectionsRailRef}>
							{visibleCollections.map((collection) => (
								<MyCollectionChip
									key={collection.id}
									aria-label={`Открыть подборку ${collection.title}`}
									role="link"
									tabIndex={0}
									onClick={(event) => {
										event.stopPropagation();
										router.push(`/collections/${collection.id}`);
									}}
									onKeyDown={(event) => {
										event.stopPropagation();

										if (event.key !== "Enter" && event.key !== " ") return;

										event.preventDefault();
										router.push(`/collections/${collection.id}`);
									}}
								>
									<CollectionCover
										$coverUrl={collection.coverUrl}
										aria-hidden="true"
									/>
									<CollectionChipMeta>
										<CollectionChipTitle>
											{collection.title}
										</CollectionChipTitle>
										<CollectionChipText>
											{collection.bookCount} книг
										</CollectionChipText>
									</CollectionChipMeta>
								</MyCollectionChip>
							))}
						</MyCollectionsRail>
					) : (
						<CollectionPreviewText>
							Создайте первую подборку для любимых книг, настроений и будущих
							полок.
						</CollectionPreviewText>
					)}
				</CollectionsPanel>

				<LibraryPanel>
					<PanelHeader>
						<PanelTitle>Мои книги</PanelTitle>
						<HeaderActions>
							{shouldShowAllBooksLink ? (
								<SmallAction href="/treasures/books">
									Посмотреть все
								</SmallAction>
							) : null}
							<SmallAction href="/search">Добавить книгу</SmallAction>
						</HeaderActions>
					</PanelHeader>
					<StatusTabs aria-label="Статусы книг">
						{statusTabs.map((status) => {
							const isActive = activeStatus === status.id;

							return (
								<StatusTab
									key={status.id}
									$isActive={isActive}
									type="button"
									onClick={() => setActiveStatus(status.id)}
								>
									{status.label}
									<StatusCount>{getStatusCount(status.id)}</StatusCount>
								</StatusTab>
							);
						})}
					</StatusTabs>

					{isUserBooksLoading ? (
						<BookEmptyState>
							<BookEmptyTitle>Загружаем книги...</BookEmptyTitle>
						</BookEmptyState>
					) : isUserBooksError ? (
						<BookEmptyState>
							<BookEmptyTitle>Не удалось загрузить книги</BookEmptyTitle>
							<BookEmptyText>
								Проверьте авторизацию и попробуйте открыть страницу еще раз.
							</BookEmptyText>
						</BookEmptyState>
					) : trackedBooks.length > 0 ? (
						<BookRail>
							{trackedBooks.map((item) => (
								<TrackedBook key={item.id}>
									<BookCard book={item.book} />
									<TrackingInfo>{getTrackingInfo(item)}</TrackingInfo>
									<RemoveTrackingButton
										type="button"
										disabled={deleteTrackingMutation.isPending}
										onClick={() => deleteTrackingMutation.mutate(item.book.id)}
									>
										Убрать
									</RemoveTrackingButton>
								</TrackedBook>
							))}
						</BookRail>
					) : (
						<BookEmptyState>
							<BookEmptyTitle>Книг пока нет</BookEmptyTitle>
							<BookEmptyText>
								Добавьте книгу и назначьте статус: планирую, читаю, прочитано,
								пауза, перечитываю или брошено.
							</BookEmptyText>
						</BookEmptyState>
					)}
				</LibraryPanel>

				<SectionsGrid>
					{sections.map((section) => (
						<ResourceCard key={section.title}>
							<ResourceTitle>{section.title}</ResourceTitle>
							<ResourceText>{section.description}</ResourceText>
							<ResourceFooter>
								<ResourceCount>{resourceCounts[section.countKey]}</ResourceCount>
								<ResourceLink href={section.href}>
									{section.action}
								</ResourceLink>
							</ResourceFooter>
						</ResourceCard>
					))}
				</SectionsGrid>
				{isCreateCollectionOpen ? (
					<CreateCollectionModal
						onClose={() => setIsCreateCollectionOpen(false)}
					/>
				) : null}
			</Content>
		</Page>
	);
};

export default MyTreasuresPage;

const getTrackingInfo = (item: IUserBookTracking) => {
	const parts = [statusLabels[item.status]];

	if (item.currentPage) parts.push(`${item.currentPage} стр.`);
	if (item.readCount) parts.push(`${item.readCount} прочт.`);

	return parts.join(" · ");
};

const Page = styled.div`
	min-height: calc(100dvh - 4rem);
	background: ${theme.colors.background};
	padding: 4rem 0 6rem;
`;

const Content = styled.div`
	width: min(calc(100% - (${theme.layout.contentGutter} * 2)), 74rem);
	margin: 0 auto;
`;

const Hero = styled.section`
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 2rem;
	margin-bottom: 2rem;

	@media (max-width: 50rem) {
		align-items: flex-start;
		flex-direction: column;
	}
`;

const HeroCopy = styled.div`
	min-width: 0;
`;

const Title = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: clamp(3rem, 8vw, 5.5rem);
	line-height: 0.95;
`;

const Lead = styled.p`
	max-width: 44rem;
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1.05rem;
	line-height: 1.5;
`;

const HeroActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
`;

const TopGrid = styled.div`
	display: grid;
	gap: 1rem;
	grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
	margin-bottom: 1rem;

	@media (max-width: 54rem) {
		grid-template-columns: 1fr;
	}
`;

const ReadingCard = styled.section`
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 1rem;
	background: rgb(255 255 255 / 0.58);
	padding: 1.25rem;
`;

const ChallengeCard = styled(ReadingCard)``;

const CardEyebrow = styled.p`
	margin: 0 0 0.35rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.78rem;
	font-weight: 700;
	letter-spacing: 0.04em;
	text-transform: uppercase;
`;

const CardTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.6rem;
	line-height: 1.15;
`;

const CardText = styled.p`
	margin: 0.55rem 0 1rem;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.45;
`;

const ReadingList = styled.div`
	display: grid;
	gap: 0.75rem;
`;

const ReadingItem = styled.article`
	display: grid;
	align-items: center;
	grid-template-columns: 2.8rem minmax(0, 1fr);
	gap: 0.75rem;
`;

const ReadingCover = styled.div<{ $coverUrl?: string }>`
	width: 2.8rem;
	aspect-ratio: 2 / 3;
	border-radius: 0.42rem;
	background:
		linear-gradient(rgb(4 18 26 / 0.1), rgb(4 18 26 / 0.1)),
		url("${({ $coverUrl }) => $coverUrl || "/images/book-placeholder.svg"}")
			center / cover;
`;

const ReadingMeta = styled.div`
	min-width: 0;
`;

const ReadingTitle = styled(Link)`
	display: block;
	overflow: hidden;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1rem;
	font-weight: 600;
	line-height: 1.15;
	text-decoration: none;
	text-overflow: ellipsis;
	white-space: nowrap;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const ReadingDetails = styled.p`
	overflow: hidden;
	margin: 0.2rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 0.82rem;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const ProgressTrack = styled.div`
	overflow: hidden;
	height: 0.5rem;
	border-radius: 999px;
	background: rgb(242 239 237 / 0.88);
	margin-top: 0.85rem;
`;

const ProgressFill = styled.div<{ $width: number }>`
	width: ${({ $width }) => `${$width}%`};
	height: 100%;
	border-radius: inherit;
	background: ${theme.colors.orangeLight};
`;

const LibraryPanel = styled.section`
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 1rem;
	background: rgb(255 255 255 / 0.58);
	padding: 1.25rem;
`;

const CollectionsPanel = styled(LibraryPanel)`
	margin-bottom: 1rem;
	cursor: pointer;
	transition:
		box-shadow 180ms ease,
		transform 180ms ease;

	&:hover,
	&:focus-visible {
		box-shadow: 0 0.75rem 1.5rem rgb(4 18 26 / 0.08);
		outline: none;
		transform: translateY(-0.0625rem);
	}
`;

const CollectionSummary = styled.div`
	display: flex;
	align-items: baseline;
	gap: 0.6rem;
	margin-bottom: 1rem;
`;

const CollectionFilterTabs = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.45rem;
	margin-bottom: 1rem;
`;

const CollectionFilterTab = styled.button<{ $isActive: boolean }>`
	border: 0.0625rem solid
		${({ $isActive }) =>
			$isActive ? theme.colors.orangeLight : "rgb(211 202 196 / 0.82)"};
	border-radius: 999px;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.14)" : theme.colors.surface};
	padding: 0.38rem 0.72rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeDark : theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.84rem;
	font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const CollectionCount = styled.span`
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.serif};
	font-size: 2rem;
	font-weight: 600;
	line-height: 1;
`;

const CollectionText = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.35;
`;

const MyCollectionsRail = styled.div`
	display: flex;
	gap: 0.75rem;
	overflow-x: auto;
	padding-bottom: 0.25rem;
	scroll-snap-type: x proximity;
`;

const MyCollectionChip = styled.article`
	display: grid;
	min-width: 15rem;
	max-width: 19rem;
	flex: 0 0 auto;
	grid-template-columns: 4.25rem minmax(0, 1fr);
	gap: 0.75rem;
	align-items: center;
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 0.75rem;
	background: rgb(255 255 255 / 0.64);
	padding: 0.55rem;
	cursor: pointer;
	scroll-snap-align: start;
	transition:
		border-color 180ms ease,
		transform 180ms ease;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		outline: none;
		transform: translateY(-0.0625rem);
	}
`;

const CollectionCover = styled.div<{ $coverUrl?: string }>`
	width: 4.25rem;
	aspect-ratio: 1 / 1;
	border-radius: 0.6rem;
	background:
		linear-gradient(rgb(4 18 26 / 0.08), rgb(4 18 26 / 0.08)),
		url("${({ $coverUrl }) => $coverUrl || "/images/book-placeholder.svg"}")
			center / cover;
`;

const CollectionChipMeta = styled.div`
	min-width: 0;
`;

const CollectionChipTitle = styled.h3`
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1rem;
	font-weight: 600;
	line-height: 1.15;
`;

const CollectionChipText = styled.p`
	margin: 0.3rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 0.82rem;
	line-height: 1.3;
`;

const CollectionPreviewText = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.45;
`;

const PanelHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
`;

const HeaderActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: 0.75rem;
`;

const RailControls = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
`;

const RailControlButton = styled.button`
	display: inline-flex;
	width: 1.8rem;
	height: 1.8rem;
	align-items: center;
	justify-content: center;
	border: 0.0625rem solid ${theme.colors.orangeDark};
	border-radius: 999px;
	background: ${theme.colors.transparent};
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font-family: ${theme.fonts.serif};
	font-size: 1.9rem;
	line-height: 1;

	&:hover,
	&:focus-visible {
		background: ${theme.colors.orangeLight};
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
		outline: none;
	}
`;

const PanelTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.55rem;
	line-height: 1.15;
`;

const SmallAction = styled(Link)`
	color: ${theme.colors.orangeDark};
	font-size: 0.9rem;
	font-weight: 700;
	text-decoration: none;

	&:hover,
	&:focus-visible {
		text-decoration: underline;
		text-underline-offset: 0.16rem;
		outline: none;
	}
`;

const InlineAction = styled.button`
	border: 0;
	background: transparent;
	padding: 0;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	font-size: 0.9rem;
	font-weight: 700;

	&:hover,
	&:focus-visible {
		text-decoration: underline;
		text-underline-offset: 0.16rem;
		outline: none;
	}
`;

const StatusTabs = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
`;

const StatusTab = styled.button<{ $isActive: boolean }>`
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
	border: 0.0625rem solid
		${({ $isActive }) =>
			$isActive ? theme.colors.orangeLight : "rgb(211 202 196 / 0.82)"};
	border-radius: 999px;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.14)" : theme.colors.surface};
	padding: 0.45rem 0.85rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeDark : theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.9rem;
	font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const StatusCount = styled.span`
	color: ${theme.colors.orangeDark};
	font-weight: 700;
`;

const BookRail = styled.div`
	display: flex;
	gap: 1rem;
	overflow-x: auto;
	margin-top: 1.2rem;
	padding-bottom: 0.4rem;
	scroll-snap-type: x proximity;
`;

const TrackedBook = styled.article`
	min-width: 8.5rem;
	flex: 0 0 auto;
	display: grid;
	gap: 0.45rem;
	justify-items: start;
	scroll-snap-align: start;
`;

const TrackingInfo = styled.p`
	margin: 0;
	color: ${theme.colors.orangeDark};
	font-size: 0.78rem;
	font-weight: 700;
	line-height: 1.25;
`;

const RemoveTrackingButton = styled.button`
	border: 0;
	background: transparent;
	padding: 0;
	color: ${theme.colors.lightText};
	cursor: pointer;
	font: inherit;
	font-size: 0.76rem;
	line-height: 1.2;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
		text-decoration: underline;
		text-underline-offset: 0.15rem;
	}

	&:disabled {
		cursor: wait;
		opacity: 0.55;
	}
`;

const BookEmptyState = styled.div`
	margin-top: 1rem;
	border: 0.0625rem dashed ${theme.colors.border};
	border-radius: 0.8rem;
	padding: 1.5rem;
`;

const BookEmptyTitle = styled.h3`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.25rem;
`;

const BookEmptyText = styled.p`
	max-width: 42rem;
	margin: 0.45rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.45;
`;

const SectionsGrid = styled.div`
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	margin-top: 1rem;

	@media (max-width: 64rem) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@media (max-width: 38rem) {
		grid-template-columns: 1fr;
	}
`;

const ResourceCard = styled.section`
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 1rem;
	background: rgb(255 255 255 / 0.48);
	padding: 1rem;
`;

const ResourceTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.25rem;
	line-height: 1.15;
`;

const ResourceText = styled.p`
	margin: 0.55rem 0 1rem;
	color: ${theme.colors.softForeground};
	font-size: 0.9rem;
	line-height: 1.4;
`;

const ResourceFooter = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
`;

const ResourceCount = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 2rem;
	height: 2rem;
	border-radius: 999px;
	background: rgb(218 142 91 / 0.12);
	color: ${theme.colors.orangeDark};
	font-weight: 700;
`;

const ResourceLink = styled(Link)`
	color: ${theme.colors.orangeDark};
	font-size: 0.88rem;
	font-weight: 700;
	text-decoration: none;

	&:hover,
	&:focus-visible {
		text-decoration: underline;
		text-underline-offset: 0.16rem;
		outline: none;
	}
`;

const EmptyState = styled.p`
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;
