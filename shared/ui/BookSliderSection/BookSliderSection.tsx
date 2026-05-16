"use client";

import { useState } from "react";
import styled from "styled-components";

import type { IBookSort } from "@/shared/api/books";
import { useBookCardsQuery } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { Button } from "@/shared/ui/Button";
import BookCarousel from "@/shared/ui/BookCarousel/BookCarousel";
import { BookCardSkeleton } from "@/shared/ui/Skeleton";

interface ICarouselControls {
	canScrollNext: boolean;
	canScrollPrev: boolean;
	scrollNext: () => void;
	scrollPrev: () => void;
}

interface IBookSliderSectionProps {
	genre?: string;
	limit?: number;
	sort?: IBookSort;
	title: string;
}

const getSectionHref = ({
	genre,
	sort,
}: Pick<IBookSliderSectionProps, "genre" | "sort">) => {
	if (genre) {
		const query = sort ? `?sort=${sort}` : "";

		return `/genres/${genre}${query}`;
	}

	if (sort) {
		return `/catalog/${sort}`;
	}

	return "/catalog/newest";
};

const BookSliderSection = ({
	sort,
	genre,
	limit,
	title,
}: IBookSliderSectionProps) => {
	const [carouselControls, setCarouselControls] =
		useState<ICarouselControls | null>(null);
	const {
		data: booksResponse,
		error,
		isError,
		isLoading,
	} = useBookCardsQuery({ sort, genre, limit });
	const books = booksResponse?.items ?? [];
	const sectionHref = getSectionHref({ genre, sort });
	const hasCarouselControls = Boolean(
		carouselControls?.canScrollPrev || carouselControls?.canScrollNext,
	);

	return (
		<Section>
			<SectionHeader>
				<SectionHeading>
					<SectionTitle>{title}</SectionTitle>
					<ShowMoreButton buttonType="oxygenPill" href={sectionHref}>
						Посмотреть все
					</ShowMoreButton>
				</SectionHeading>

				<Controls $isVisible={hasCarouselControls}>
					<ControlButton
						aria-label="Предыдущие книги"
						disabled={!carouselControls?.canScrollPrev}
						type="button"
						onClick={carouselControls?.scrollPrev}
					>
						‹
					</ControlButton>
					<ControlButton
						aria-label="Следующие книги"
						disabled={!carouselControls?.canScrollNext}
						type="button"
						onClick={carouselControls?.scrollNext}
					>
						›
					</ControlButton>
				</Controls>
			</SectionHeader>

			{isLoading ? (
				<SkeletonCarousel aria-label="Загружаем книги">
					{Array.from({ length: 8 }, (_, index) => (
						<BookCardSkeleton key={index} />
					))}
				</SkeletonCarousel>
			) : isError ? (
				<StateMessage>Не удалось загрузить книги: {error.message}</StateMessage>
			) : books.length === 0 ? (
				<StateMessage>Пока нет книг для отображения.</StateMessage>
			) : (
				<BookCarousel
					books={books}
					size="compact"
					onControlsChange={(controls) => {
						setCarouselControls((currentControls) => {
							if (
								currentControls?.canScrollNext === controls.canScrollNext &&
								currentControls?.canScrollPrev === controls.canScrollPrev &&
								currentControls?.scrollNext === controls.scrollNext &&
								currentControls?.scrollPrev === controls.scrollPrev
							) {
								return currentControls;
							}

							return controls;
						});
					}}
				/>
			)}
		</Section>
	);
};

export default BookSliderSection;

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
		background: ${theme.colors.orangePrimary};
		border-color: ${theme.colors.orangePrimary};
		color: ${theme.colors.lightText};
		transform: translateY(-0.0625rem);
	}

	&:disabled {
		cursor: default;
		opacity: 0.38;
	}
`;

const SkeletonCarousel = styled.div`
	display: flex;
	gap: clamp(0.775rem, 1vw, 1.25rem);
	overflow: hidden;
`;

const StateMessage = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;
