"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import styled from "styled-components";

import { BookCard, type BookCardData } from "@/shared/ui/BookCard";

const WHEEL_SENSITIVITY = -0.91;
const EMBLA_WHEEL_DURATION = 15;
const EMBLA_WHEEL_FRICTION = 0.68;
const SCROLL_EDGE_THRESHOLD = 0.002;

type BookCarouselProps = {
	books: BookCardData[];
};

const BookCarousel = ({ books }: BookCarouselProps) => {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		containScroll: "keepSnaps",
		dragFree: true,
	});
	const viewportNode = useRef<HTMLDivElement | null>(null);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);

	const updateControls = useCallback((api: EmblaCarouselType) => {
		const progress = api.scrollProgress();

		setCanScrollPrev(progress > SCROLL_EDGE_THRESHOLD);
		setCanScrollNext(progress < 1 - SCROLL_EDGE_THRESHOLD);
	}, []);

	const scrollPrev = useCallback(() => {
		emblaApi?.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		emblaApi?.scrollNext();
	}, [emblaApi]);

	const setViewportRef = useCallback(
		(node: HTMLDivElement | null) => {
			viewportNode.current = node;
			emblaRef(node);
		},
		[emblaRef],
	);

	const handleWheel = useCallback(
		(event: WheelEvent) => {
			if (!emblaApi) {
				return;
			}

			const isHorizontalGesture =
				Math.abs(event.deltaX) > Math.abs(event.deltaY);
			const rawDelta = isHorizontalGesture
				? event.deltaX
				: event.shiftKey
					? event.deltaY
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
		[emblaApi, updateControls],
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

		return () => {
			window.cancelAnimationFrame(frame);
			emblaApi.off("select", updateControls);
			emblaApi.off("scroll", updateControls);
			emblaApi.off("reInit", updateControls);
			emblaApi.off("settle", updateControls);
		};
	}, [emblaApi, updateControls]);

	if (books.length === 0) {
		return null;
	}

	return (
		<Carousel aria-label="Карусель книг">
			<Viewport ref={setViewportRef}>
				<Container>
					{books.map((book, index) => (
						<Slide key={`${book.id}-${index}`}>
							<BookCard book={book} />
						</Slide>
					))}
					<EndSpace aria-hidden="true" />
				</Container>
			</Viewport>

			<Controls>
				<ControlButton
					aria-label="Предыдущие книги"
					disabled={!canScrollPrev}
					type="button"
					onClick={scrollPrev}
				>
					‹
				</ControlButton>
				<ControlButton
					aria-label="Следующие книги"
					disabled={!canScrollNext}
					type="button"
					onClick={scrollNext}
				>
					›
				</ControlButton>
			</Controls>
		</Carousel>
	);
};

export default BookCarousel;

const Carousel = styled.section`
	--page-gutter: clamp(1.5rem, 2.78vw, 2.5rem);
	--content-width: 77.5rem;
	--book-card-width: clamp(10rem, 13.125vw, 11.8125rem);
	--content-side-space: max(
		var(--page-gutter),
		calc((100vw - var(--content-width)) / 2)
	);

	width: 100%;
`;

const Viewport = styled.div`
	width: 100vw;
	margin-left: calc(var(--content-side-space) * -1);
	overflow: hidden;
	overscroll-behavior: contain;
	padding-block: 0.125rem;
`;

const Container = styled.div`
	--slide-gap: clamp(1.25rem, 2vw, 1.75rem);

	display: flex;
	gap: var(--slide-gap);
	padding-left: var(--content-side-space);
	touch-action: pan-y pinch-zoom;
`;

const Slide = styled.div`
	flex: 0 0 var(--book-card-width);
	min-width: 0;

	@media (max-width: 40rem) {
		flex-basis: min(72vw, var(--book-card-width));
	}
`;

const EndSpace = styled.div`
	flex: 0 0 var(--content-side-space);
	min-width: 0;
	margin-left: calc(var(--slide-gap) * -1);
	pointer-events: none;
`;

const Controls = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 0.625rem;
	margin-top: clamp(1.25rem, 2vw, 1.75rem);
`;

const ControlButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.875rem;
	height: 1.875rem;
	border: 0.0625rem solid var(--orange-dark);
	border-radius: 62.4375rem;
	background: transparent;
	color: var(--orange-dark);
	cursor: pointer;
	font-family: var(--font-serif);
	font-size: 2rem;
	line-height: 1;
	transition:
		background 180ms ease,
		border-color 180ms ease,
		color 180ms ease,
		opacity 180ms ease,
		transform 180ms ease;

	&:not(:disabled):hover {
		background: var(--orange-primary);
		border-color: var(--orange-primary);
		color: var(--lightText);
		transform: translateY(-0.0625rem);
	}

	&:disabled {
		cursor: default;
		opacity: 0.38;
	}
`;
