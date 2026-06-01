"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import styled from "styled-components";

import type {
	IAuthorsListParams,
	IAuthorPreview,
	IAuthorsSort,
} from "@/shared/api/authors";
import { useAuthorsQuery } from "@/shared/api/authors";
import type {
	ICollectionPreview,
	ICollectionSort,
	ICollectionsListParams,
} from "@/shared/api/collections";
import { usePublicCollectionsQuery } from "@/shared/api/collections";
import type { IHomeSectionQuery } from "@/shared/api/recomendations";
import type {
	ISeriesListParams,
	ISeriesPreview,
	ISeriesSort,
} from "@/shared/api/series";
import { usePublicSeriesQuery } from "@/shared/api/series";
import { theme } from "@/shared/theme";
import { AuthorAvatar } from "@/shared/ui/AuthorAvatar";
import { Button } from "@/shared/ui/Button";
import { useLazyLoadTrigger } from "@/shared/utils/useLazyLoadTrigger";
import { SeriesSliderCard } from "./SeriesSliderCard";

interface IHomeEntitySliderSectionProps {
	entity: "authors" | "collections" | "series";
	lazy?: boolean;
	query: IHomeSectionQuery;
	title: string;
}

interface ICarouselControls {
	canScrollNext: boolean;
	canScrollPrev: boolean;
	scrollNext: () => void;
	scrollPrev: () => void;
}

const WHEEL_SENSITIVITY = -0.91;
const EMBLA_WHEEL_DURATION = 15;
const EMBLA_WHEEL_FRICTION = 0.68;
const SCROLL_EDGE_THRESHOLD = 0.002;
const HORIZONTAL_GESTURE_RATIO = 1.15;
const MIN_HORIZONTAL_DELTA = 4;

const HomeEntitySliderSection = ({
	entity,
	lazy = false,
	query,
	title,
}: IHomeEntitySliderSectionProps) => {
	const { containerRef, isTriggered } = useLazyLoadTrigger(lazy);
	const authorParams: IAuthorsListParams = useMemo(
		() => ({
			genres: query.genres ?? query.genreIds,
			limit: query.limit,
			page: query.page,
			sort: query.sort as IAuthorsSort | undefined,
		}),
		[query.genres, query.genreIds, query.limit, query.page, query.sort],
	);
	const collectionParams: ICollectionsListParams = useMemo(
		() => ({
			genres: query.genres ?? query.genreIds,
			limit: query.limit,
			page: query.page,
			sort: query.sort as ICollectionSort | undefined,
		}),
		[query.genres, query.genreIds, query.limit, query.page, query.sort],
	);
	const seriesParams: ISeriesListParams = useMemo(
		() => ({
			genre: query.genre,
			genreIds: query.genreIds,
			limit: query.limit,
			page: query.page,
			sort: query.sort as ISeriesSort | undefined,
		}),
		[query.genre, query.genreIds, query.limit, query.page, query.sort],
	);

	const {
		data: authorsResponse,
		error: authorsError,
		isError: isAuthorsError,
		isLoading: isAuthorsLoading,
	} = useAuthorsQuery(authorParams, {
		enabled: entity === "authors" && isTriggered,
	});
	const {
		data: collectionsResponse,
		error: collectionsError,
		isError: isCollectionsError,
		isLoading: isCollectionsLoading,
	} = usePublicCollectionsQuery(collectionParams, {
		enabled: entity === "collections" && isTriggered,
	});
	const {
		data: seriesResponse,
		error: seriesError,
		isError: isSeriesError,
		isLoading: isSeriesLoading,
	} = usePublicSeriesQuery(seriesParams, {
		enabled: entity === "series" && isTriggered,
	});

	const items =
		entity === "authors"
			? (authorsResponse?.items ?? [])
			: entity === "collections"
				? (collectionsResponse?.items ?? [])
				: (seriesResponse?.items ?? []);
	const isLoading =
		entity === "authors"
			? isAuthorsLoading
			: entity === "collections"
				? isCollectionsLoading
				: isSeriesLoading;
	const isError =
		entity === "authors"
			? isAuthorsError
			: entity === "collections"
				? isCollectionsError
				: isSeriesError;
	const errorMessage =
		entity === "authors"
			? authorsError?.message
			: entity === "collections"
				? collectionsError?.message
				: seriesError?.message;
	const sectionHref =
		entity === "authors"
			? "/authors"
			: entity === "collections"
				? "/collections"
				: "/series";
	const [carouselControls, setCarouselControls] =
		useState<ICarouselControls | null>(null);
	const handleControlsChange = useCallback(
		(nextControls: ICarouselControls) => {
			setCarouselControls((prevControls) => {
				if (
					prevControls &&
					prevControls.canScrollNext === nextControls.canScrollNext &&
					prevControls.canScrollPrev === nextControls.canScrollPrev &&
					prevControls.scrollNext === nextControls.scrollNext &&
					prevControls.scrollPrev === nextControls.scrollPrev
				) {
					return prevControls;
				}

				return nextControls;
			});
		},
		[],
	);
	const hasCarouselControls = Boolean(
		carouselControls?.canScrollPrev || carouselControls?.canScrollNext,
	);

	return (
		<Section ref={containerRef}>
			<SectionHeader>
				<SectionHeading>
					<SectionTitle>{title}</SectionTitle>
					<ShowMoreButton buttonType="oxygenPill" href={sectionHref}>
						See all
					</ShowMoreButton>
				</SectionHeading>
				<Controls $isVisible={hasCarouselControls}>
					<ControlButton
						aria-label="Previous items"
						disabled={!carouselControls?.canScrollPrev}
						type="button"
						onClick={carouselControls?.scrollPrev}
					>
						‹
					</ControlButton>
					<ControlButton
						aria-label="Next items"
						disabled={!carouselControls?.canScrollNext}
						type="button"
						onClick={carouselControls?.scrollNext}
					>
						›
					</ControlButton>
				</Controls>
			</SectionHeader>
			{!isTriggered || isLoading ? (
				<StateMessage>Loading...</StateMessage>
			) : isError ? (
				<StateMessage>
					Failed to load data: {errorMessage ?? "Unknown error"}
				</StateMessage>
			) : items.length === 0 ? (
				<StateMessage>No data to display yet.</StateMessage>
			) : entity === "authors" ? (
				<AuthorCarousel
					authors={items as IAuthorPreview[]}
					onControlsChange={handleControlsChange}
				/>
			) : entity === "collections" ? (
				<CollectionCarousel
					collections={items as ICollectionPreview[]}
					onControlsChange={handleControlsChange}
				/>
			) : (
				<SeriesCarousel
					series={items as ISeriesPreview[]}
					onControlsChange={handleControlsChange}
				/>
			)}
		</Section>
	);
};

const useHorizontalCarousel = () => {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		containScroll: "keepSnaps",
		dragFree: true,
		duration: 28,
	});
	const viewportNode = useRef<HTMLDivElement | null>(null);
	const containerNode = useRef<HTMLDivElement | null>(null);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);
	const [hasOverflow, setHasOverflow] = useState(false);

	const updateControls = useCallback((api: EmblaCarouselType) => {
		const viewport = viewportNode.current;
		const container = containerNode.current;
		const measuredOverflow =
			viewport && container
				? container.scrollWidth - viewport.clientWidth > 1
				: false;
		const hasCarouselScroll =
			measuredOverflow || api.canScrollPrev() || api.canScrollNext();
		const progress = api.scrollProgress();

		setHasOverflow(hasCarouselScroll);
		setCanScrollPrev(hasCarouselScroll && progress > SCROLL_EDGE_THRESHOLD);
		setCanScrollNext(hasCarouselScroll && progress < 1 - SCROLL_EDGE_THRESHOLD);
	}, []);

	const scrollNext = useCallback(() => {
		emblaApi?.scrollNext();
	}, [emblaApi]);

	const scrollPrev = useCallback(() => {
		emblaApi?.scrollPrev();
	}, [emblaApi]);

	const setViewportRef = useCallback(
		(node: HTMLDivElement | null) => {
			viewportNode.current = node;
			emblaRef(node);
		},
		[emblaRef],
	);

	const setContainerRef = useCallback((node: HTMLDivElement | null) => {
		containerNode.current = node;
	}, []);

	const handleWheel = useCallback(
		(event: WheelEvent) => {
			if (!emblaApi || !hasOverflow) {
				return;
			}

			const absDeltaX = Math.abs(event.deltaX);
			const absDeltaY = Math.abs(event.deltaY);
			const hasStrongHorizontalIntent =
				absDeltaX > MIN_HORIZONTAL_DELTA &&
				absDeltaX > absDeltaY * HORIZONTAL_GESTURE_RATIO;
			const isHorizontalGesture = hasStrongHorizontalIntent || event.shiftKey;
			const rawDelta = isHorizontalGesture
				? absDeltaX > 0
					? event.deltaX
					: event.deltaY
				: 0;
			const deltaModeMultiplier = event.deltaMode === 1 ? 16 : 1;
			const scrollDelta = rawDelta * deltaModeMultiplier;

			if (scrollDelta === 0) {
				return;
			}

			event.preventDefault();

			const engine = emblaApi.internalEngine();
			const wheelForce = scrollDelta * WHEEL_SENSITIVITY;
			const currentTarget = engine.target.get();
			const nextTarget = engine.limit.constrain(currentTarget + wheelForce);
			const constrainedForce = nextTarget - currentTarget;

			if (Math.abs(constrainedForce) < 0.2) {
				return;
			}

			engine.scrollBody
				.useDuration(EMBLA_WHEEL_DURATION)
				.useFriction(EMBLA_WHEEL_FRICTION);
			engine.scrollTo.distance(constrainedForce, false);
			window.requestAnimationFrame(() => updateControls(emblaApi));
		},
		[emblaApi, hasOverflow, updateControls],
	);

	useEffect(() => {
		const node = viewportNode.current;

		if (!node) {
			return;
		}

		node.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			node.removeEventListener("wheel", handleWheel);
		};
	}, [handleWheel]);

	useEffect(() => {
		if (!emblaApi) {
			return;
		}

		emblaApi.on("select", updateControls);
		emblaApi.on("scroll", updateControls);
		emblaApi.on("reInit", updateControls);
		emblaApi.on("settle", updateControls);
		const frame = window.requestAnimationFrame(() => updateControls(emblaApi));
		const resizeObserver =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(() => {
						updateControls(emblaApi);
					});

		if (viewportNode.current) {
			resizeObserver?.observe(viewportNode.current);
		}

		if (containerNode.current) {
			resizeObserver?.observe(containerNode.current);
		}

		return () => {
			window.cancelAnimationFrame(frame);
			resizeObserver?.disconnect();
			emblaApi.off("select", updateControls);
			emblaApi.off("scroll", updateControls);
			emblaApi.off("reInit", updateControls);
			emblaApi.off("settle", updateControls);
		};
	}, [emblaApi, updateControls]);

	return {
		canScrollNext,
		canScrollPrev,
		emblaApi,
		setContainerRef,
		setViewportRef,
		scrollNext,
		scrollPrev,
	};
};

const AuthorCarousel = ({
	authors,
	onControlsChange,
}: {
	authors: IAuthorPreview[];
	onControlsChange: (controls: ICarouselControls) => void;
}) => {
	const {
		canScrollNext,
		canScrollPrev,
		setContainerRef,
		setViewportRef,
		scrollNext,
		scrollPrev,
	} = useHorizontalCarousel();

	useEffect(() => {
		onControlsChange({ canScrollNext, canScrollPrev, scrollNext, scrollPrev });
	}, [canScrollNext, canScrollPrev, onControlsChange, scrollNext, scrollPrev]);

	return (
		<CarouselViewport ref={setViewportRef}>
			<CarouselContainer ref={setContainerRef}>
				{authors.map((author) => (
					<CarouselSlide key={author.id}>
						<AuthorTreasureCard href={`/authors/${author.id}`}>
							<AuthorAvatar
								name={author.name}
								photoUrl={author.photoUrl}
								size="3.9rem"
							/>
							<TreasureResourceMeta>
								<TreasureResourceTitle>{author.name}</TreasureResourceTitle>
								<TreasureResourceText>
									{author.bookCount} books
								</TreasureResourceText>
							</TreasureResourceMeta>
						</AuthorTreasureCard>
					</CarouselSlide>
				))}
			</CarouselContainer>
		</CarouselViewport>
	);
};

const CollectionCarousel = ({
	collections,
	onControlsChange,
}: {
	collections: ICollectionPreview[];
	onControlsChange: (controls: ICarouselControls) => void;
}) => {
	const {
		canScrollNext,
		canScrollPrev,
		setContainerRef,
		setViewportRef,
		scrollNext,
		scrollPrev,
	} = useHorizontalCarousel();

	useEffect(() => {
		onControlsChange({ canScrollNext, canScrollPrev, scrollNext, scrollPrev });
	}, [canScrollNext, canScrollPrev, onControlsChange, scrollNext, scrollPrev]);

	return (
		<CarouselViewport ref={setViewportRef}>
			<CarouselContainer ref={setContainerRef}>
				{collections.map((collection) => (
					<CarouselSlide key={collection.id}>
						<CollectionTreasureCard href={`/collections/${collection.id}`}>
							<CollectionCover
								$coverUrl={collection.coverUrl}
								aria-hidden="true"
							/>
							<TreasureResourceMeta>
								<TreasureResourceTitle>
									{collection.title}
								</TreasureResourceTitle>
								<TreasureResourceText>
									{collection.bookCount} books
								</TreasureResourceText>
							</TreasureResourceMeta>
						</CollectionTreasureCard>
					</CarouselSlide>
				))}
			</CarouselContainer>
		</CarouselViewport>
	);
};

const SeriesCarousel = ({
	series,
	onControlsChange,
}: {
	series: ISeriesPreview[];
	onControlsChange: (controls: ICarouselControls) => void;
}) => {
	const {
		canScrollNext,
		canScrollPrev,
		setContainerRef,
		setViewportRef,
		scrollNext,
		scrollPrev,
	} = useHorizontalCarousel();

	useEffect(() => {
		onControlsChange({ canScrollNext, canScrollPrev, scrollNext, scrollPrev });
	}, [canScrollNext, canScrollPrev, onControlsChange, scrollNext, scrollPrev]);

	return (
		<CarouselViewport ref={setViewportRef}>
			<CarouselContainer ref={setContainerRef}>
				{series.map((seriesItem) => (
					<CarouselSlide key={seriesItem.id}>
						<SeriesSliderCard seriesItem={seriesItem} />
					</CarouselSlide>
				))}
			</CarouselContainer>
		</CarouselViewport>
	);
};

export default HomeEntitySliderSection;

const Section = styled.section`
	width: min(
		calc(100% - (${theme.layout.contentGutter} * 2)),
		${theme.layout.contentMaxWidth}
	);
	margin: 4rem auto 0;
	height: fit-content;
`;

const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1.25rem;
	margin-bottom: 1.75rem;
`;

const SectionHeading = styled.div`
	display: flex;
	align-items: center;
	gap: 1.25rem;
	min-width: 0;
`;

const SectionTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.textPrimary};
	font-family: ${theme.fonts.serif};
	font-size: 2rem;
	font-weight: 600;
	line-height: 1.1;
`;

const ShowMoreButton = styled(Button)`
	&& {
		flex: 0 0 auto;
		padding: 0.25rem 0.85rem;
		font-size: 0.8125rem;
	}
`;

const Controls = styled.div<{ $isVisible: boolean }>`
	display: ${({ $isVisible }) => ($isVisible ? "flex" : "none")};
	flex: 0 0 auto;
	gap: 0.625rem;
`;

const ControlButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.875rem;
	height: 1.875rem;
	border: 0.0625rem solid ${theme.colors.orangeDark};
	border-radius: 62.4375rem;
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

	&:not(:disabled):hover {
		background: ${theme.colors.orangeLight};
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
		transform: translateY(-0.0625rem);
	}

	&:disabled {
		cursor: default;
		opacity: 0.38;
	}
`;

const CarouselViewport = styled.div`
	overflow: hidden;
`;

const CarouselContainer = styled.div`
	display: flex;
	gap: 0.75rem;
`;

const CarouselSlide = styled.div`
	min-width: 0;
	flex: 0 0 auto;
`;

export const TreasureResourceMeta = styled.div`
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

const treasureCardStyles = `
	display: grid;
	align-items: center;
	grid-template-columns: 3.9rem minmax(0, 1fr);
	gap: 0.75rem;
	min-width: 0;
	min-width: 16.5rem;
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

const CollectionTreasureCard = styled(Link)`
	${treasureCardStyles}
`;

const CollectionCover = styled.div<{ $coverUrl?: string }>`
	width: 3.9rem;
	aspect-ratio: 1 / 1;
	border-radius: 0.6rem;
	background:
		linear-gradient(rgb(4 18 26 / 0.08), rgb(4 18 26 / 0.08)),
		url("${({ $coverUrl }) => $coverUrl || "/images/book-placeholder.svg"}")
			center / cover;
`;

const StateMessage = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;
