"use client";

import { useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import styled from "styled-components";

import { GenrePill } from "@/shared/ui/GenrePill";

export type GenreCarouselItem = {
	slug: string;
	title: string;
};

type GenreCarouselProps = {
	genres: GenreCarouselItem[];
};

const LOOP_COPIES = 4;

const GenreCarousel = ({ genres }: GenreCarouselProps) => {
	const loopedGenres = Array.from({ length: LOOP_COPIES }, (_, copyIndex) =>
		genres.map((genre) => ({ ...genre, key: `${genre.slug}-${copyIndex}` })),
	).flat();

	const [emblaRef, emblaApi] = useEmblaCarousel(
		{
			align: "start",
			dragFree: false,
			loop: true,
			containScroll: false,
		},
		[
			Autoplay({
				delay: 1700,
				stopOnFocusIn: true,
				stopOnInteraction: false,
				stopOnMouseEnter: true,
			}),
		],
	);

	useEffect(() => {
		emblaApi?.plugins().autoplay?.play();
	}, [emblaApi]);

	if (genres.length === 0) {
		return null;
	}

	return (
		<Carousel aria-label="Жанры">
			<Viewport ref={emblaRef}>
				<Container>
					{loopedGenres.map((genre) => (
						<Slide key={genre.key}>
							<GenrePill href={`/genres/${genre.slug}`}>
								{genre.title}
							</GenrePill>
						</Slide>
					))}
				</Container>
			</Viewport>
		</Carousel>
	);
};

export default GenreCarousel;

const Carousel = styled.nav`
	width: 100vw;
	margin-top: 1.85rem;
	margin-left: calc(50% - 50vw);
`;

const Viewport = styled.div`
	width: 100%;
	overflow: hidden;
	overscroll-behavior-x: contain;
	padding-block: 0.5rem;
`;

const Container = styled.div`
	display: flex;
	gap: 0.5rem;
	padding-inline: 1.5rem;
	touch-action: pan-y pinch-zoom;
`;

const Slide = styled.div`
	flex: 0 0 auto;
	min-width: 0;
`;
