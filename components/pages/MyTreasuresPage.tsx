"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { CreateCollectionModal } from "@/components/pages/book-details/CreateCollectionModal";
import { useMyAuthorsQuery } from "@/shared/api/authors";
import {
	useChallengesQuery,
	type IChallengePeriodType,
} from "@/shared/api/book-challenge";
import {
	useMyCollectionsQuery,
	useSubscribedCollectionsQuery,
} from "@/shared/api/collections";
import { useMySeriesQuery } from "@/shared/api/series";
import {
	useUserBookStatusCountsQuery,
	useUserBooksQuery,
	type IUserBookStatus,
} from "@/shared/api/user-books";
import { useUserGenresQuery } from "@/shared/api/users";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { AuthorAvatar } from "@/shared/ui/AuthorAvatar";
import BookCarousel from "@/shared/ui/BookCarousel/BookCarousel";
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

type ICollectionTreasureFilter = "all" | "created" | "subscribed";
type ITreasureTab = "authors" | "series" | "genres" | "collections";

const collectionFilterTabs: Array<{
	id: ICollectionTreasureFilter;
	label: string;
}> = [
	{ id: "all", label: "Все" },
	{ id: "created", label: "Созданные" },
	{ id: "subscribed", label: "Подписки" },
];

const challengePeriodLabels: Record<IChallengePeriodType, string> = {
	month: "месяц",
	week: "неделю",
	year: "год",
};

const MyTreasuresPage = () => {
	const router = useRouter();
	const session = useAuthStore((state) => state.session);
	const [activeStatus, setActiveStatus] = useState<IUserBookStatus | "all">(
		"all",
	);
	const [activeCollectionFilter, setActiveCollectionFilter] =
		useState<ICollectionTreasureFilter>("all");
	const [activeTreasureTab, setActiveTreasureTab] =
		useState<ITreasureTab>("collections");
	const [selectedChallengeIndex, setSelectedChallengeIndex] = useState(0);
	const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
	const [isAuthHydrated, setIsAuthHydrated] = useState(
		() => useAuthStore.persist?.hasHydrated?.() ?? true,
	);
	const [collectionRailControls, setCollectionRailControls] = useState({
		canScrollNext: false,
		canScrollPrev: false,
		hasOverflow: false,
	});
	const [bookCarouselControls, setBookCarouselControls] = useState<{
		canScrollNext: boolean;
		canScrollPrev: boolean;
		scrollNext: () => void;
		scrollPrev: () => void;
	} | null>(null);
	const collectionsRailRef = useRef<HTMLDivElement | null>(null);
	const isSessionReady = Boolean(session);
	const activeStatusParam = activeStatus === "all" ? undefined : activeStatus;
	const { data: challenges = [] } = useChallengesQuery({
		enabled: isSessionReady,
	});
	const { data: readingBooksData, isLoading: isReadingBooksLoading } =
		useUserBooksQuery(
			{
				limit: 8,
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
	const { data: myAuthorsData, isLoading: isMyAuthorsLoading } =
		useMyAuthorsQuery({ limit: 8 }, { enabled: isSessionReady });
	const { data: mySeriesData } = useMySeriesQuery(
		{ limit: 8 },
		{ enabled: isSessionReady },
	);
	const { data: myGenres = [], isLoading: isMyGenresLoading } =
		useUserGenresQuery(session?.user.id, { enabled: isSessionReady });
	const activeChallenges = challenges
		.filter((challenge) => challenge.isActive)
		.sort(
			(firstChallenge, secondChallenge) =>
				new Date(firstChallenge.endDate).getTime() -
				new Date(secondChallenge.endDate).getTime(),
		);
	const activeChallengeIndex = activeChallenges.length
		? Math.min(selectedChallengeIndex, activeChallenges.length - 1)
		: 0;
	const activeChallenge = activeChallenges[activeChallengeIndex];
	const activeChallengeProgress = clampPercent(
		activeChallenge?.progress?.value.percent,
	);
	const activeChallengeTimeProgress = clampPercent(
		activeChallenge?.progress?.time.percent,
	);
	const activeChallengeCurrentValue =
		activeChallenge?.progress?.value.current ?? 0;
	const activeChallengeRemainingDays =
		activeChallenge?.progress?.time.remainingDays ?? 0;
	const activeChallengeUnit =
		activeChallenge?.type === "pages" ? "стр." : "книг";
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
	const myAuthors = myAuthorsData?.items ?? [];
	const mySeries = mySeriesData?.items ?? [];
	const updateCollectionRailControls = () => {
		const rail = collectionsRailRef.current;

		if (!rail) {
			setCollectionRailControls({
				canScrollNext: false,
				canScrollPrev: false,
				hasOverflow: false,
			});
			return;
		}

		const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
		const hasOverflow = maxScrollLeft > 1;
		const canScrollPrev = hasOverflow && rail.scrollLeft > 1;
		const canScrollNext = hasOverflow && rail.scrollLeft < maxScrollLeft - 1;

		setCollectionRailControls((currentControls) => {
			if (
				currentControls.canScrollNext === canScrollNext &&
				currentControls.canScrollPrev === canScrollPrev &&
				currentControls.hasOverflow === hasOverflow
			) {
				return currentControls;
			}

			return {
				canScrollNext,
				canScrollPrev,
				hasOverflow,
			};
		});
	};
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
		window.requestAnimationFrame(updateCollectionRailControls);
		window.setTimeout(updateCollectionRailControls, 260);
	};
	const showChallenge = (direction: "next" | "prev") => {
		if (activeChallenges.length < 2) return;

		setSelectedChallengeIndex((currentIndex) =>
			direction === "next"
				? (currentIndex + 1) % activeChallenges.length
				: (currentIndex - 1 + activeChallenges.length) %
					activeChallenges.length,
		);
	};
	const resourceCounts = {
		authors: myAuthorsData?.total ?? 0,
		genres: myGenres.length,
		collections: visibleCollectionsTotal,
		series: mySeriesData?.total ?? 0,
	};
	const treasureTabs: Array<{
		count: number;
		id: ITreasureTab;
		label: string;
	}> = [
		{ id: "authors", label: "Мои авторы", count: resourceCounts.authors },
		{ id: "series", label: "Мои серии", count: resourceCounts.series },
		{ id: "genres", label: "Мои жанры", count: resourceCounts.genres },
		{
			id: "collections",
			label: "Мои подборки",
			count: resourceCounts.collections,
		},
	];
	const shouldShowAllBooksLink =
		(userBooksData?.total ?? 0) > trackedBooks.length ||
		trackedBooks.length > 6;
	const bookCarouselItems = trackedBooks.map((item) =>
		activeStatus === "all"
			? {
					...item.book,
					isTracked: true,
					myStatus: item.status,
				}
			: item.book,
	);
	const hasBookCarouselControls = Boolean(
		bookCarouselControls?.canScrollPrev || bookCarouselControls?.canScrollNext,
	);
	const getStatusCount = (status: IUserBookStatus | "all") =>
		status === "all"
			? (statusCounts?.total ?? userBooksData?.total ?? 0)
			: (statusCounts?.[status] ?? 0);

	useEffect(() => {
		const persistApi = useAuthStore.persist;

		if (!persistApi) {
			return;
		}

		const unsubscribeHydrate = persistApi.onHydrate(() => {
			setIsAuthHydrated(false);
		});
		const unsubscribeFinishHydration = persistApi.onFinishHydration(() => {
			setIsAuthHydrated(true);
		});

		return () => {
			unsubscribeHydrate();
			unsubscribeFinishHydration();
		};
	}, []);

	useEffect(() => {
		if (isAuthHydrated && !session) {
			router.replace("/?auth=required");
		}
	}, [isAuthHydrated, router, session]);

	useEffect(() => {
		const rail = collectionsRailRef.current;

		if (!rail || activeTreasureTab !== "collections") {
			const frame = window.requestAnimationFrame(updateCollectionRailControls);

			return () => window.cancelAnimationFrame(frame);
		}

		const frame = window.requestAnimationFrame(updateCollectionRailControls);
		const resizeObserver =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(updateCollectionRailControls);

		rail.addEventListener("scroll", updateCollectionRailControls, {
			passive: true,
		});
		resizeObserver?.observe(rail);

		return () => {
			window.cancelAnimationFrame(frame);
			rail.removeEventListener("scroll", updateCollectionRailControls);
			resizeObserver?.disconnect();
		};
	}, [
		activeTreasureTab,
		isCollectionsLoading,
		visibleCollections.length,
		visibleCollectionsTotal,
	]);

	if (!isAuthHydrated || !session) {
		return null;
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
				</Hero>

				<ReadingCard>
					<ReadingShelf>
						<ReadingHeader>
							<CardEyebrow>Сейчас читаю</CardEyebrow>
						</ReadingHeader>
						{isReadingBooksLoading ? (
							<CardText>Загружаем текущие книги...</CardText>
						) : readingBooks.length > 0 ? (
							<ReadingCarouselWrap $bookCount={readingBooks.length}>
								<BookCarousel
									bleed={false}
									books={readingBooks.map((item) => item.book)}
									size="tiny"
								/>
							</ReadingCarouselWrap>
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
					</ReadingShelf>

					<ChallengeCard>
						<ChallengeCopy>
							<ChallengeHeading>
								<CardEyebrow>Книжный вызов</CardEyebrow>
								{activeChallenges.length > 1 ? (
									<ChallengeCount>
										{activeChallenges.length} активных
									</ChallengeCount>
								) : null}
							</ChallengeHeading>
							<ChallengeCarouselRow>
								{activeChallenges.length > 1 ? (
									<ChallengeNavButton
										aria-label="Предыдущий вызов"
										type="button"
										onClick={() => showChallenge("prev")}
									>
										{"‹"}
									</ChallengeNavButton>
								) : null}
								<ChallengeGraph
									href="/book-challenge"
									$timePercent={activeChallengeTimeProgress}
									aria-label="Прогресс книжного вызова"
								>
									<ChallengeValueRing $valuePercent={activeChallengeProgress}>
										<ChallengeGraphCenter>
											<ChallengeGraphLabel>
												{activeChallenge
													? `На ${challengePeriodLabels[activeChallenge.periodType]}`
													: "Нет вызова"}
											</ChallengeGraphLabel>
											<ChallengeGraphValue>
												{activeChallenge
													? `	${activeChallengeCurrentValue} /${" "}
														${activeChallenge.targetValue} ${activeChallengeUnit}`
													: "0"}
											</ChallengeGraphValue>
											{activeChallenge ? (
												<>
													<ChallengeGraphMeta>
														{activeChallengeRemainingDays} дн. · до{" "}
														{formatChallengeDate(activeChallenge.endDate)}
													</ChallengeGraphMeta>
												</>
											) : (
												<ChallengeGraphMeta>
													Создайте цель для чтения
												</ChallengeGraphMeta>
											)}
										</ChallengeGraphCenter>
									</ChallengeValueRing>
								</ChallengeGraph>
								{activeChallenges.length > 1 ? (
									<ChallengeNavButton
										aria-label="Следующий вызов"
										type="button"
										onClick={() => showChallenge("next")}
									>
										{"›"}
									</ChallengeNavButton>
								) : null}
							</ChallengeCarouselRow>
							{activeChallenges.length > 1 ? (
								<ChallengeSlideLabel>
									{activeChallengeIndex + 1} из {activeChallenges.length}
								</ChallengeSlideLabel>
							) : null}
						</ChallengeCopy>
						<ChallengeProgress>
							<ChallengeDetailsLink href="/book-challenge">
								Посмотреть подробнее
							</ChallengeDetailsLink>
						</ChallengeProgress>
					</ChallengeCard>
				</ReadingCard>

				<MainGrid>
					<LibraryPanel>
						<PanelHeader>
							<PanelTitleRow>
								<PanelTitle>Мои книги</PanelTitle>
								{shouldShowAllBooksLink ? (
									<ViewAllAction href="/treasures/books">
										<span>Посмотреть все</span>
										<KeyboardArrowRightIcon aria-hidden="true" />
									</ViewAllAction>
								) : null}
							</PanelTitleRow>
							<HeaderActions>
								<IconTextAction href="/search" title="Найти книгу">
									<SearchIcon aria-hidden="true" />
									<span>Найти книгу</span>
								</IconTextAction>
								<IconTextAction
									href="/treasures/books?create=1"
									title="Создать книгу"
								>
									<AddIcon aria-hidden="true" />
									<span>Создать</span>
								</IconTextAction>
							</HeaderActions>
						</PanelHeader>
						<BooksToolbar>
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
							{hasBookCarouselControls ? (
								<RailControls aria-label="Перелистывание книг">
									<RailControlButton
										aria-label="Предыдущие книги"
										disabled={!bookCarouselControls?.canScrollPrev}
										type="button"
										onClick={bookCarouselControls?.scrollPrev}
									>
										{"‹"}
									</RailControlButton>
									<RailControlButton
										aria-label="Следующие книги"
										disabled={!bookCarouselControls?.canScrollNext}
										type="button"
										onClick={bookCarouselControls?.scrollNext}
									>
										{"›"}
									</RailControlButton>
								</RailControls>
							) : null}
						</BooksToolbar>

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
						) : bookCarouselItems.length > 0 ? (
							<BookCarouselFrame>
								<BookCarousel
									bleed={false}
									books={bookCarouselItems}
									size="tiny"
									onControlsChange={(controls) => {
										setBookCarouselControls((currentControls) => {
											if (
												currentControls?.canScrollNext ===
													controls.canScrollNext &&
												currentControls?.canScrollPrev ===
													controls.canScrollPrev &&
												currentControls?.scrollNext === controls.scrollNext &&
												currentControls?.scrollPrev === controls.scrollPrev
											) {
												return currentControls;
											}

											return controls;
										});
									}}
								/>
							</BookCarouselFrame>
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
				</MainGrid>

				<TreasureTabsPanel>
					<TreasureTabs aria-label="Разделы сокровищ">
						{treasureTabs.map((tab) => (
							<TreasureTabButton
								key={tab.id}
								$isActive={activeTreasureTab === tab.id}
								type="button"
								onClick={() => setActiveTreasureTab(tab.id)}
							>
								<span>{tab.label}</span>
								<TreasureTabCount>{tab.count}</TreasureTabCount>
							</TreasureTabButton>
						))}
					</TreasureTabs>

					<TreasureTabContent>
						{activeTreasureTab === "authors" ? (
							<CompactResourcePanel>
								<PanelHeader>
									<PanelTitleRow>
										<PanelTitle>Мои авторы</PanelTitle>
										<ViewAllAction href="/authors">
											<span>Посмотреть все</span>
											<KeyboardArrowRightIcon aria-hidden="true" />
										</ViewAllAction>
									</PanelTitleRow>
									<HeaderActions>
										<IconTextAction href="/authors" title="Добавить автора">
											<AddIcon aria-hidden="true" />
											<span>Добавить автора</span>
										</IconTextAction>
									</HeaderActions>
								</PanelHeader>
								{isMyAuthorsLoading ? (
									<CollectionPreviewText>
										Загружаем сохранённых авторов...
									</CollectionPreviewText>
								) : myAuthors.length > 0 ? (
									<TreasureResourceGrid>
										{myAuthors.map((author) => (
											<AuthorTreasureCard
												key={author.id}
												href={`/authors/${author.id}`}
											>
												<AuthorAvatar
													fontSize="0.95rem"
													name={author.name}
													photoUrl={author.photoUrl}
													size="3.75rem"
												/>
												<TreasureResourceMeta>
													<TreasureResourceTitle>
														{author.name}
													</TreasureResourceTitle>
													<TreasureResourceText>
														{author.bookCount} книг
													</TreasureResourceText>
												</TreasureResourceMeta>
											</AuthorTreasureCard>
										))}
									</TreasureResourceGrid>
								) : (
									<CollectionPreviewText>
										Сохранённые авторы появятся здесь после добавления.
									</CollectionPreviewText>
								)}
							</CompactResourcePanel>
						) : null}

						{activeTreasureTab === "series" ? (
							<CompactResourcePanel>
								<PanelHeader>
									<PanelTitleRow>
										<PanelTitle>Мои серии</PanelTitle>
										<ViewAllAction href="/search?tab=series">
											<span>Посмотреть все</span>
											<KeyboardArrowRightIcon aria-hidden="true" />
										</ViewAllAction>
									</PanelTitleRow>
									<HeaderActions>
										<IconTextAction
											href="/search?tab=series"
											title="Добавить серию"
										>
											<AddIcon aria-hidden="true" />
											<span>Добавить серию</span>
										</IconTextAction>
									</HeaderActions>
								</PanelHeader>
								{mySeries.length > 0 ? (
									<TreasureResourceGrid>
										{mySeries.slice(0, 8).map((series) => (
											<SeriesTreasureCard
												key={series.id}
												href={`/series/${series.id}`}
											>
												<SeriesTreasureStack aria-hidden="true">
													{Array.from({ length: 3 }, (_, index) => (
														<SeriesTreasureCover
															key={index}
															$coverUrl={series.coverUrl}
															$index={index}
														/>
													))}
												</SeriesTreasureStack>
												<TreasureResourceMeta>
													<TreasureResourceTitle>
														{series.title}
													</TreasureResourceTitle>
													{series.description ? (
														<TreasureResourceText>
															{series.description}
														</TreasureResourceText>
													) : series.authorName ? (
														<TreasureResourceText>
															{series.authorName}
															{series.bookCount
																? ` · ${series.bookCount} книг`
																: ""}
														</TreasureResourceText>
													) : (
														<TreasureResourceText>
															Сохранённая серия
														</TreasureResourceText>
													)}
												</TreasureResourceMeta>
											</SeriesTreasureCard>
										))}
									</TreasureResourceGrid>
								) : (
									<CollectionPreviewText>
										Серии, за которыми вы следите, появятся здесь.
									</CollectionPreviewText>
								)}
							</CompactResourcePanel>
						) : null}

						{activeTreasureTab === "genres" ? (
							<CompactResourcePanel>
								<PanelHeader>
									<PanelTitleRow>
										<PanelTitle>Мои жанры</PanelTitle>
										<ViewAllAction href="/genres">
											<span>Посмотреть все</span>
											<KeyboardArrowRightIcon aria-hidden="true" />
										</ViewAllAction>
									</PanelTitleRow>
									<HeaderActions>
										<IconTextAction href="/genres" title="Добавить жанры">
											<AddIcon aria-hidden="true" />
											<span>Добавить жанры</span>
										</IconTextAction>
									</HeaderActions>
								</PanelHeader>
								{isMyGenresLoading ? (
									<CollectionPreviewText>
										Загружаем ваши жанры...
									</CollectionPreviewText>
								) : myGenres.length > 0 ? (
									<MyGenresList aria-label="Мои сохранённые жанры">
										{myGenres.map((genre) => (
											<MyGenreChip
												key={genre.id}
												href={`/genres/${genre.slug}`}
											>
												{genre.name}
											</MyGenreChip>
										))}
									</MyGenresList>
								) : (
									<CollectionPreviewText>
										Сохранённые жанры появятся здесь после нажатия на плюс в
										каталоге жанров.
									</CollectionPreviewText>
								)}
							</CompactResourcePanel>
						) : null}

						{activeTreasureTab === "collections" ? (
							<CompactResourcePanel>
								<PanelHeader>
									<PanelTitleRow>
										<PanelTitle>Мои подборки</PanelTitle>
										<ViewAllAction href="/collections/_username">
											<span>Смотреть все</span>
											<KeyboardArrowRightIcon aria-hidden="true" />
										</ViewAllAction>
									</PanelTitleRow>
									<HeaderActions>
										<IconButtonAction
											title="Создать подборку"
											type="button"
											onClick={() => setIsCreateCollectionOpen(true)}
										>
											<AddIcon aria-hidden="true" />
											<span>Создать</span>
										</IconButtonAction>
									</HeaderActions>
								</PanelHeader>
								<CollectionFilterRow>
									<CollectionFilterTabs aria-label="Фильтр подборок">
										{collectionFilterTabs.map((filter) => (
											<CollectionFilterTab
												key={filter.id}
												$isActive={activeCollectionFilter === filter.id}
												type="button"
												onClick={() => setActiveCollectionFilter(filter.id)}
											>
												{filter.label}
											</CollectionFilterTab>
										))}
									</CollectionFilterTabs>
									<CollectionToolbarActions>
										{collectionRailControls.hasOverflow ? (
											<RailControls aria-label="Перелистывание подборок">
												<RailControlButton
													aria-label="Предыдущие подборки"
													disabled={!collectionRailControls.canScrollPrev}
													type="button"
													onClick={() => scrollCollectionsRail("prev")}
												>
													{"‹"}
												</RailControlButton>
												<RailControlButton
													aria-label="Следующие подборки"
													disabled={!collectionRailControls.canScrollNext}
													type="button"
													onClick={() => scrollCollectionsRail("next")}
												>
													{"›"}
												</RailControlButton>
											</RailControls>
										) : null}
										<CollectionSummary>
											<CollectionCount>
												{visibleCollectionsTotal}
											</CollectionCount>
											<CollectionText>
												{visibleCollectionsTotal === 1
													? "подборка"
													: "подборок"}
											</CollectionText>
										</CollectionSummary>
									</CollectionToolbarActions>
								</CollectionFilterRow>
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
												onClick={() =>
													router.push(`/collections/${collection.id}`)
												}
												onKeyDown={(event) => {
													if (event.key !== "Enter" && event.key !== " ")
														return;

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
										Создайте первую подборку для любимых книг, настроений и
										будущих полок.
									</CollectionPreviewText>
								)}
							</CompactResourcePanel>
						) : null}
					</TreasureTabContent>
				</TreasureTabsPanel>
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

const formatChallengeDate = (date: string) =>
	new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "short",
	}).format(new Date(date));

const clampPercent = (value?: number) => Math.min(Math.max(value ?? 0, 0), 100);

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
	margin-bottom: 1.35rem;

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
	font-size: clamp(2.35rem, 5vw, 3.8rem);
	line-height: 1;
`;

const Lead = styled.p`
	max-width: 44rem;
	margin: 0.65rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 0.98rem;
	line-height: 1.5;
`;

const ReadingCard = styled.section`
	display: grid;
	align-items: center;
	grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem);
	gap: clamp(1.5rem, 5vw, 4rem);
	min-width: 0;
	width: min(100%, 58rem);
	max-width: 100%;
	margin: 0 auto 1rem;
	padding: 0.2rem 0 0.35rem;

	@media (max-width: 50rem) {
		grid-template-columns: 1fr;
	}
`;

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

const ChallengeCard = styled(ReadingCard)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	margin: 0;
	justify-self: center;
	padding: 0;
	max-width: 24rem;
	width: auto;

	${CardText} {
		margin-bottom: 0;
	}

	${CardTitle} {
		font-size: 1.28rem;
	}
`;

const ChallengeCopy = styled.div`
	min-width: 0;
	width: 100%;
`;

const ChallengeHeading = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.55rem;
	margin-bottom: 0.75rem;

	${CardEyebrow} {
		margin-bottom: 0;
	}
`;

const ChallengeCount = styled.span`
	display: inline-flex;
	width: fit-content;
	border: 0.0625rem solid rgb(212 100 28 / 0.26);
	border-radius: 999px;
	padding: 0.16rem 0.5rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.72rem;
	font-weight: 700;
	line-height: 1.1;
`;

const ChallengeCarouselRow = styled.div`
	display: flex;
	align-items: center;
	gap: 0.55rem;
	justify-content: center;
`;

const ChallengeNavButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.875rem;
	height: 1.875rem;
	border: 0.0625rem solid ${theme.colors.orangeDark};
	border-radius: 999px;
	background: ${theme.colors.transparent};
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font-family: ${theme.fonts.serif};
	font-size: 2rem;
	line-height: 1;
	transition:
		background 180ms ease,
		border-color 180ms ease,
		color 180ms ease,
		opacity 180ms ease,
		transform 180ms ease;

	&:hover,
	&:focus-visible {
		background: ${theme.colors.orangePrimary};
		border-color: ${theme.colors.orangePrimary};
		color: ${theme.colors.invertedText};
		outline: none;
		transform: translateY(-0.0625rem);
	}
`;

const ChallengeGraph = styled(Link)<{ $timePercent: number }>`
	position: relative;
	display: grid;
	width: clamp(10.8rem, 16vw, 13rem);
	aspect-ratio: 1;
	place-items: center;
	border-radius: 50%;
	color: inherit;
	text-decoration: none;
	transition: transform 180ms ease;

	&:hover,
	&:focus-visible {
		outline: none;
		transform: translateY(-0.125rem);
	}

	&:focus-visible {
		box-shadow: 0 0 0 0.2rem ${theme.alpha.orangeFocus};
	}

	&::before {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: conic-gradient(
			${theme.colors.bluePrimary} ${({ $timePercent }) => `${$timePercent}%`},
			rgb(35 61 77 / 0.12) 0
		);
		content: "";
		mask: radial-gradient(
			farthest-side,
			transparent calc(100% - 0.72rem),
			#000 calc(100% - 0.7rem)
		);
	}
`;

const ChallengeValueRing = styled.div<{ $valuePercent: number }>`
	position: relative;
	z-index: 1;
	display: grid;
	width: calc(100% - 2.1rem);
	height: calc(100% - 2.1rem);
	place-items: center;
	border-radius: inherit;
	background: conic-gradient(
		${theme.colors.orangeLight} ${({ $valuePercent }) => `${$valuePercent}%`},
		rgb(254 127 45 / 0.16) 0
	);
	padding: 0.54rem;
`;

const ChallengeGraphCenter = styled.div`
	display: grid;
	width: 100%;
	height: 100%;
	align-content: center;
	justify-items: center;
	border-radius: inherit;
	background: ${theme.colors.background};
	padding: 0.65rem;
	text-align: center;
`;

const ChallengeGraphLabel = styled.span`
	color: ${theme.colors.orangeDark};
	font-size: 0.68rem;
	font-weight: 700;
	line-height: 1.1;
	text-transform: uppercase;
`;

const ChallengeGraphValue = styled.span`
	margin-top: 0.2rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.15rem;
	font-weight: 700;
	line-height: 1.05;
`;

const ChallengeGraphMeta = styled.span`
	margin-top: 0.2rem;
	color: ${theme.colors.softForeground};
	font-size: 0.66rem;
	line-height: 1.12;
`;

const ChallengeSlideLabel = styled.p`
	margin: 0.45rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 0.72rem;
	line-height: 1.2;
	text-align: center;
`;

const ChallengeProgress = styled.div`
	display: grid;
	gap: 0.35rem;
	justify-items: center;
	margin-top: 0.05rem;
	min-width: 0;
	width: 100%;
`;

const ChallengeDetailsLink = styled(Link)`
	color: ${theme.colors.orangeDark};
	font-size: 0.82rem;
	font-weight: 700;
	text-decoration: none;

	&:hover,
	&:focus-visible {
		text-decoration: underline;
		text-underline-offset: 0.16rem;
		outline: none;
	}
`;

const ReadingShelf = styled.div`
	justify-self: center;
	min-width: 0;
`;

const ReadingHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 0.55rem;
`;

const ReadingCarouselWrap = styled.div<{ $bookCount: number }>`
	min-width: 0;
	width: ${({ $bookCount }) =>
		`min(100%, ${Math.min(Math.max($bookCount * 7.6, 7.6), 34)}rem)`};
`;

const MainGrid = styled.div`
	margin-bottom: 1rem;
`;

const LibraryPanel = styled.section`
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 1rem;
	background: rgb(242 239 237 / 0.74);
	padding: 1.25rem 1.35rem 1.45rem;
`;

const TreasureTabsPanel = styled.section`
	--tabs-content-bg: rgb(255 255 255 / 0.42);
`;

const TreasureTabs = styled.div`
	display: grid;
	gap: 0.5rem;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	margin-bottom: 0.75rem;

	@media (max-width: 48rem) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
`;

const TreasureTabButton = styled.button<{ $isActive: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.7rem;
	border: 0.0625rem solid
		${({ $isActive }) =>
			$isActive ? "transparent" : "rgb(211 202 196 / 0.82)"};
	border-radius: 0.75rem;
	background: ${({ $isActive }) =>
		$isActive ? "var(--tabs-content-bg)" : theme.colors.transparent};
	padding: 0.7rem 0.8rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeDark : theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.9rem;
	font-weight: 700;
	line-height: 1.15;
	text-align: left;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		background: ${({ $isActive }) =>
			$isActive ? "var(--tabs-content-bg)" : "rgb(255 255 255 / 0.18)"};
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const TreasureTabCount = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 1.75rem;
	height: 1.75rem;
	border-radius: 999px;
	background: rgb(218 142 91 / 0.14);
	color: ${theme.colors.orangeDark};
	font-weight: 700;
`;

const TreasureTabContent = styled.div`
	min-width: 0;
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 1rem;
	background: var(--tabs-content-bg);
	padding: 1rem;
`;

const CompactResourcePanel = styled.div`
	min-width: 0;
`;

const TreasureResourceGrid = styled.div`
	display: grid;
	gap: 0.75rem;
	grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
`;

const treasureCardStyles = `
	display: grid;
	align-items: center;
	grid-template-columns: 3.9rem minmax(0, 1fr);
	gap: 0.75rem;
	min-width: 0;
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 0.75rem;
	background: rgb(255 255 255 / 0.58);
	padding: 0.55rem;
	color: inherit;
	text-decoration: none;
	transition:
		border-color 180ms ease,
		background 180ms ease,
		transform 180ms ease;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		background: rgb(255 255 255 / 0.76);
		outline: none;
		transform: translateY(-0.0625rem);
	}
`;

const AuthorTreasureCard = styled(Link)`
	${treasureCardStyles}
`;

const SeriesTreasureCard = styled(Link)`
	${treasureCardStyles}
`;

const SeriesTreasureStack = styled.span`
	position: relative;
	display: block;
	width: 3.9rem;
	height: 4.7rem;
`;

const SeriesTreasureCover = styled.span<{
	$coverUrl?: string;
	$index: number;
}>`
	position: absolute;
	top: ${({ $index }) => $index * 0.22}rem;
	left: ${({ $index }) => $index * -0.18}rem;
	z-index: ${({ $index }) => 3 - $index};
	width: 3.3rem;
	height: 4.4rem;
	border: 0.0625rem solid ${theme.colors.background};
	border-radius: 0.42rem;
	background:
		linear-gradient(rgb(4 18 26 / 0.05), rgb(4 18 26 / 0.05)),
		url("${({ $coverUrl }) => $coverUrl || "/images/book-placeholder.svg"}")
			center / cover;
	box-shadow: 0 0.35rem 0.9rem rgb(4 18 26 / 0.08);
`;

const TreasureResourceMeta = styled.div`
	min-width: 0;
`;

const TreasureResourceTitle = styled.h3`
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

const TreasureResourceText = styled.p`
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	margin: 0.28rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 0.8rem;
	line-height: 1.3;
`;

const MyGenresList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
`;

const MyGenreChip = styled(Link)`
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 999px;
	background: rgb(255 255 255 / 0.58);
	padding: 0.45rem 0.85rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.sans};
	font-size: 0.88rem;
	line-height: 1.2;
	text-decoration: none;
	transition:
		background 150ms ease,
		border-color 150ms ease,
		color 150ms ease;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		background: rgb(218 142 91 / 0.12);
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const CollectionFilterRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;

	@media (max-width: 40rem) {
		align-items: flex-start;
		flex-direction: column;
	}
`;

const CollectionToolbarActions = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 0.75rem;

	@media (max-width: 40rem) {
		justify-content: space-between;
		width: 100%;
	}
`;

const CollectionSummary = styled.div`
	display: flex;
	align-items: baseline;
	flex: 0 0 auto;
	gap: 0.45rem;
`;

const CollectionFilterTabs = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.45rem;
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
	font-size: 1.25rem;
	font-weight: 600;
	line-height: 1;
`;

const CollectionText = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.86rem;
	line-height: 1.35;
`;

const MyCollectionsRail = styled.div`
	display: flex;
	gap: 0.75rem;
	overflow-x: auto;
	overscroll-behavior-inline: contain;
	padding: 0.1rem 0 0.25rem;
	scroll-snap-type: x proximity;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
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
	margin-bottom: 0.75rem;
`;

const HeaderActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: 0.6rem;
`;

const RailControls = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
`;

const RailControlButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.875rem;
	height: 1.875rem;
	border: 0.0625rem solid ${theme.colors.orangeDark};
	border-radius: 999px;
	background: ${theme.colors.transparent};
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font-family: ${theme.fonts.serif};
	font-size: 2rem;
	line-height: 1;
	transition:
		background 180ms ease,
		border-color 180ms ease,
		color 180ms ease,
		opacity 180ms ease,
		transform 180ms ease;

	&:not(:disabled):hover,
	&:not(:disabled):focus-visible {
		background: ${theme.colors.orangeLight};
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
		outline: none;
		transform: translateY(-0.0625rem);
	}

	&:disabled {
		cursor: default;
		opacity: 0.38;
	}
`;

const PanelTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.35rem;
	line-height: 1.15;
`;

const PanelTitleRow = styled.div`
	display: flex;
	align-items: center;
	gap: 0.85rem;
	min-width: 0;
`;

const ViewAllAction = styled(Link)`
	display: inline-flex;
	align-items: center;
	gap: 0.18rem;
	border-radius: 999px;
	color: ${theme.colors.orangeDark};
	font-size: 0.86rem;
	font-weight: 700;
	padding: 0.12rem 0.38rem;
	text-decoration: none;
	transition:
		background 160ms ease,
		color 160ms ease;

	& svg {
		width: 1.15rem;
		height: 1.15rem;
		transition: transform 160ms ease;
	}

	&:hover,
	&:focus-visible {
		color: ${theme.colors.invertedText};
		background: ${theme.colors.orangeLight};
		outline: none;

		& svg {
			transform: translateX(0.12rem);
		}
	}
`;

const actionPillStyles = `
	display: inline-flex;
	align-items: center;
	gap: 0.32rem;
	border: 0.0625rem solid rgb(212 100 28 / 0.24);
	border-radius: 999px;
	background: rgb(255 255 255 / 0.36);
	padding: 0.36rem 0.68rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.82rem;
	font-weight: 700;
	line-height: 1;
	text-decoration: none;
	transition:
		background 160ms ease,
		border-color 160ms ease,
		color 160ms ease,
		transform 160ms ease;

	& svg {
		width: 1rem;
		height: 1rem;
	}

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		background: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
		outline: none;
		transform: translateY(-0.0625rem);
	}
`;

const IconTextAction = styled(Link)`
	${actionPillStyles}
`;

const IconButtonAction = styled.button`
	${actionPillStyles}
`;

const BooksToolbar = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;

	@media (max-width: 44rem) {
		align-items: flex-start;
		flex-direction: column;
	}
`;

const StatusTabs = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.42rem;
	min-width: 0;
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
	padding: 0.34rem 0.65rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeDark : theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.8rem;
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

const BookCarouselFrame = styled.div`
	min-height: 12.75rem;
	margin-top: 1rem;
	overflow: visible;
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
