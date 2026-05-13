"use client";

import styled from "styled-components";

import { useBookQuery } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { SkeletonBlock } from "@/shared/ui/Skeleton";
import BookSliderSection from "@/shared/ui/BookSliderSection/BookSliderSection";

import BookDetailContent from "./book-details/BookDetailContent";

type BookDetailsPageProps = {
	slug: string;
};

const BookDetailsPage = ({ slug }: BookDetailsPageProps) => {
	const { data: book, error, isError, isLoading } = useBookQuery(slug);

	if (isLoading) {
		return (
			<Page>
				<BookDetailSkeleton aria-label="Загружаем книгу">
					<SkeletonBackdrop />
					<SkeletonGrid>
						<SkeletonAside>
							<SkeletonBlock $height="21rem" $radius="0.5rem" $width="14rem" />
							<SkeletonBlock $height="5.5rem" $radius="0.7rem" $width="14rem" />
						</SkeletonAside>
						<SkeletonMain>
							<SkeletonBlock $height="2rem" $radius="62.4375rem" $width="14rem" />
							<SkeletonBlock $height="3.4rem" $radius="0.7rem" $width="min(100%, 34rem)" />
							<SkeletonBlock $height="1.35rem" $radius="0.5rem" $width="12rem" />
							<SkeletonActions>
								<SkeletonBlock $height="2.65rem" $radius="62.4375rem" $width="10rem" />
								<SkeletonBlock $height="2.65rem" $radius="50%" $width="2.65rem" />
								<SkeletonBlock $height="2.65rem" $radius="50%" $width="2.65rem" />
							</SkeletonActions>
							<SkeletonTabs>
								<SkeletonBlock $height="2.4rem" $radius="62.4375rem" $width="9rem" />
								<SkeletonBlock $height="2.4rem" $radius="62.4375rem" $width="8rem" />
								<SkeletonBlock $height="2.4rem" $radius="62.4375rem" $width="7rem" />
							</SkeletonTabs>
							<SkeletonBlock $height="1rem" $width="100%" />
							<SkeletonBlock $height="1rem" $width="92%" />
							<SkeletonBlock $height="1rem" $width="78%" />
						</SkeletonMain>
					</SkeletonGrid>
				</BookDetailSkeleton>
			</Page>
		);
	}

	if (isError) {
		return (
			<Page>
				<StateMessage>Не удалось загрузить книгу: {error.message}</StateMessage>
			</Page>
		);
	}

	if (!book) {
		return (
			<Page>
				<StateMessage>Книга не найдена.</StateMessage>
			</Page>
		);
	}

	return (
		<Page>
			<BookDetailContent book={book} />
			<RelatedSection>
				<BookSliderSection
					genre={book.genres[0]}
					limit={20}
					sort="rating"
					title="Вам понравится"
				/>
			</RelatedSection>
		</Page>
	);
};

export default BookDetailsPage;

const Page = styled.div`
	--book-detail-width: 76.75rem;

	min-height: 100dvh;
	overflow-x: hidden;
	background: ${theme.colors.background};
	padding-bottom: 7rem;
`;

const StateMessage = styled.p`
	width: min(calc(100% - 3rem), var(--book-detail-width));
	margin: 0 auto;
	padding-top: 5rem;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;

const RelatedSection = styled.section`
	margin-top: 5rem;
`;

const BookDetailSkeleton = styled.section`
	--detail-backdrop-height: max(18rem, calc(100vw * 356 / 1979));
	--detail-cover-offset: 5rem;

	position: relative;
	overflow: hidden;
	padding-bottom: 2rem;
`;

const SkeletonBackdrop = styled.div`
	position: absolute;
	inset: 0 0 auto;
	height: var(--detail-backdrop-height);
	background:
		linear-gradient(180deg, rgb(35 61 77 / 0.68), rgb(35 61 77 / 0.12)),
		${theme.colors.bluePrimary};

	&::after {
		position: absolute;
		right: 0;
		bottom: -0.6rem;
		left: 0;
		height: 14rem;
		background: linear-gradient(
			180deg,
			rgb(232 226 222 / 0) 0%,
			rgb(232 226 222 / 0.6) 74%,
			${theme.colors.background} 100%
		);
		content: "";
	}
`;

const SkeletonGrid = styled.div`
	position: relative;
	z-index: 1;
	display: grid;
	width: min(calc(100% - 3rem), var(--book-detail-width));
	margin: 0 auto;
	column-gap: 3.5rem;
	grid-template-columns: auto minmax(0, 1fr);

	@media (max-width: 47.9375rem) {
		display: block;
		padding-top: 2rem;
	}
`;

const SkeletonAside = styled.div`
	display: flex;
	width: fit-content;
	flex-direction: column;
	gap: 1rem;
	padding-top: var(--detail-cover-offset);

	@media (max-width: 47.9375rem) {
		margin: 0 auto;
		padding-top: 0;
	}
`;

const SkeletonMain = styled.div`
	display: flex;
	min-width: 0;
	height: var(--detail-backdrop-height);
	flex-direction: column;
	gap: 1rem;
	padding-top: var(--detail-cover-offset);

	@media (max-width: 47.9375rem) {
		height: auto;
		padding-top: 2rem;
	}
`;

const SkeletonActions = styled.div`
	display: flex;
	gap: 1rem;
	padding-top: 0.4rem;
`;

const SkeletonTabs = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	margin-top: 3rem;
`;
