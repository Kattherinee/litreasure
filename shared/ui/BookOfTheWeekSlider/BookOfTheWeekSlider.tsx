"use client";

import { useCallback, useEffect, useState } from "react";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import TagIcon from "@mui/icons-material/Tag";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import styled from "styled-components";

import { theme } from "@/shared/theme";

type WeekBook = {
	id: string;
	title: string;
	description: string;
	tag: string;
	imageUrl: string;
};

const weekBooks: WeekBook[] = [
	{
		id: "morana-shadow",
		title: "Морана и Тень. Видящий",
		description:
			"Спокойные дни закончились: по неизвестной причине нечисть идет на восток, к своему последнему пристанищу, чтобы навсегда упокоиться вместе со всем миром.",
		tag: "booksOfTheWeek",
		imageUrl: "https://cv9.litres.ru/pub/c/cover_415/70756797.webp",
	},
	{
		id: "royal-assassin-week",
		title: "Королевский убийца",
		description:
			"Продолжение истории о долге, магии и выборе, который меняет не только судьбу героя, но и весь королевский двор.",
		tag: "fantasyPick",
		imageUrl: "https://covers.openlibrary.org/b/id/8231992-L.jpg",
	},
	{
		id: "assassins-apprentice-week",
		title: "Ученик убийцы",
		description:
			"Книга для тех, кто любит медленное погружение в мир, где политические интриги важны не меньше магии.",
		tag: "shelfChoice",
		imageUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
	},
];

const SCROLL_EDGE_THRESHOLD = 0.002;

const BookOfTheWeekSlider = () => {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "center",
		containScroll: "trimSnaps",
		loop: true,
	});
	const [canScrollPrev, setCanScrollPrev] = useState(true);
	const [canScrollNext, setCanScrollNext] = useState(true);

	const updateControls = useCallback((api: EmblaCarouselType) => {
		const progress = api.scrollProgress();

		setCanScrollPrev(api.canScrollPrev() || progress > SCROLL_EDGE_THRESHOLD);
		setCanScrollNext(
			api.canScrollNext() || progress < 1 - SCROLL_EDGE_THRESHOLD,
		);
	}, []);

	const scrollPrev = useCallback(() => {
		emblaApi?.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		emblaApi?.scrollNext();
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) {
			return;
		}

		emblaApi.on("select", updateControls);
		emblaApi.on("reInit", updateControls);
		const frame = window.requestAnimationFrame(() => updateControls(emblaApi));

		return () => {
			window.cancelAnimationFrame(frame);
			emblaApi.off("select", updateControls);
			emblaApi.off("reInit", updateControls);
		};
	}, [emblaApi, updateControls]);

	return (
		<Slider aria-label="Книга недели">
			<Viewport ref={emblaRef}>
				<Container>
					{weekBooks.map((book) => (
						<Slide key={book.id}>
							<BookCover src={book.imageUrl} alt={`Обложка «${book.title}»`} />
							<BookInfo>
								<BookTitle>{book.title}</BookTitle>
								<BookDescription>{book.description}</BookDescription>
								<BookTag>
									<TagIcon aria-hidden="true" />
									<span>{book.tag}</span>
								</BookTag>
							</BookInfo>
						</Slide>
					))}
				</Container>
			</Viewport>

			<ArrowButton
				aria-label="Предыдущая книга недели"
				disabled={!canScrollPrev}
				type="button"
				onClick={scrollPrev}
			>
				<KeyboardArrowLeftIcon aria-hidden="true" />
			</ArrowButton>
			<ArrowButton
				$side="right"
				aria-label="Следующая книга недели"
				disabled={!canScrollNext}
				type="button"
				onClick={scrollNext}
			>
				<KeyboardArrowRightIcon aria-hidden="true" />
			</ArrowButton>
		</Slider>
	);
};

export default BookOfTheWeekSlider;

const Slider = styled.section`
	position: relative;
	width: 100vw;
	height: 20.8125rem;
	margin-top: 3rem;
	margin-left: calc(50% - 50vw);
	background: ${theme.colors.border};
`;

const Viewport = styled.div`
	height: 100%;
	overflow: hidden;
`;

const Container = styled.div`
	display: flex;
	height: 100%;
	touch-action: pan-y pinch-zoom;
`;

const Slide = styled.article`
	display: flex;
	flex: 0 0 100%;
	align-items: center;
	justify-content: center;
	gap: 3.375rem;
	min-width: 0;
	padding: 2.5rem 8rem;
`;

const BookCover = styled.img`
	display: block;
	width: 10rem;
	height: 15.75rem;
	object-fit: cover;
`;

const BookInfo = styled.div`
	display: flex;
	width: 25.75rem;
	flex-direction: column;
	justify-content: center;
	gap: 1.25rem;
	color: ${theme.colors.textPrimary};
`;

const BookTitle = styled.h2`
	margin: 0;
	font-family: ${theme.fonts.serif};
	font-size: 2rem;
	font-weight: 400;
	line-height: 2.625rem;
`;

const BookDescription = styled.p`
	margin: 0;
	font-family: ${theme.fonts.serif};
	font-size: 1.125rem;
	font-weight: 400;
	line-height: 1.5rem;
`;

const BookTag = styled.p`
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	margin: 0;
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.serif};
	font-size: 1rem;
	line-height: 1.25rem;

	& svg {
		width: 1.25rem;
		height: 1.25rem;
	}
`;

const ArrowButton = styled.button<{ $side?: "right" }>`
	position: absolute;
	top: 50%;
	${({ $side }) => ($side === "right" ? "right: 6.25rem;" : "left: 6.25rem;")}
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
	border: 0;
	border-radius: 50%;
	background: rgb(120 120 120 / 0.2);
	color: ${theme.colors.lightText};
	cursor: pointer;
	transform: translateY(-50%);
	transition:
		background 180ms ease,
		color 180ms ease,
		opacity 180ms ease,
		transform 180ms ease;

	& svg {
		width: 2.125rem;
		height: 2.125rem;
	}

	&:not(:disabled):hover,
	&:not(:disabled):focus-visible {
		background: rgb(120 120 120 / 0.32);
		color: ${theme.colors.foreground};
		outline: none;
		transform: translateY(-50%) scale(1.04);
	}

	&:disabled {
		cursor: default;
		opacity: 0.35;
	}

	@media (max-width: 64rem) {
		${({ $side }) => ($side === "right" ? "right: 1.5rem;" : "left: 1.5rem;")}
		width: 3.5rem;
		height: 3.5rem;

		& svg {
			width: 2.25rem;
			height: 2.25rem;
		}
	}
`;
