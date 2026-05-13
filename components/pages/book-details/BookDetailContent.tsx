"use client";

import { useState } from "react";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import styled from "styled-components";

import type { Book } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import GenrePill from "@/shared/ui/GenrePill/GenrePill";
import { CoverPlaceholder } from "@/shared/ui/Skeleton";

import BookDetailHero from "./BookDetailHero";
import BookDetailTabs from "./BookDetailTabs";
import BookSeriesBlock from "./BookSeriesBlock";

type BookDetailContentProps = {
	book: Book;
};

const formatGenreLabel = (genre: string) =>
	genre
		.split("-")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");

const ratingLabels = [5, 4, 3, 2, 1];

const BookDetailContent = ({ book }: BookDetailContentProps) => {
	const coverSrc = book.coverUrl?.trim()
		? book.coverUrl
		: "/images/book-placeholder.svg";
	const [loadedCoverSrc, setLoadedCoverSrc] = useState("");
	const isCoverLoaded = loadedCoverSrc === coverSrc;
	const normalizedRating = book.ratingAvg ?? book.rating ?? 0;
	const activeStars = Math.round(normalizedRating);
	const formattedRating = normalizedRating.toFixed(1).replace(".0", "");
	const hasRatingBars = book.ratingsByStars.length > 0;
	const maxRatingLine = Math.max(...book.ratingsByStars, 1);

	return (
		<ContentWrap>
			<Backdrop aria-hidden="true" />

			<ContentGrid>
				<LeftColumn>
					<CoverWrap>
						{isCoverLoaded ? null : <CoverPlaceholder aria-hidden="true" />}
						<CoverImage
							$isLoaded={isCoverLoaded}
							src={coverSrc}
							alt={`Обложка «${book.title}»`}
							onLoad={() => setLoadedCoverSrc(coverSrc)}
						/>
					</CoverWrap>

					<AsideRating>
						<RatingTop>
							<RatingScore>{formattedRating}</RatingScore>
							<RatingMeta>
								<Stars aria-label={`Rating ${formattedRating} of 5`}>
									{Array.from({ length: 5 }, (_, index) =>
										index < activeStars ? (
											<StarIcon key={index} aria-hidden="true" />
										) : (
											<StarBorderIcon key={index} aria-hidden="true" />
										),
									)}
								</Stars>
								{book.ratingsCount ? (
									<Votes>
										{book.ratingsCount.toLocaleString("en-US")} votes
									</Votes>
								) : (
									<Votes>No votes yet</Votes>
								)}
							</RatingMeta>
						</RatingTop>

						{hasRatingBars ? (
							<RatingBars aria-hidden="true">
								{ratingLabels.map((label) => {
									const value = book.ratingsByStars[label - 1] ?? 0;
									const width = (value / maxRatingLine) * 100;

									return (
										<BarRow key={label}>
											<BarLabel>{label}</BarLabel>
											<BarTrack>
												<BarFill $width={width} />
											</BarTrack>
										</BarRow>
									);
								})}
							</RatingBars>
						) : null}
					</AsideRating>
				</LeftColumn>

				<RightColumn>
					<BookDetailHero book={book} />
					<BookDetailTabs book={book} />
					{book.genres.length > 0 ? (
						<GenreRow>
							{book.genres.map((genre) => (
								<GenrePill
									key={genre}
									href={`/genres/${genre}`}
									fontSize="0.875rem"
									height="2rem"
									paddingBlock="0.45rem"
									paddingInline="1rem"
								>
									{formatGenreLabel(genre)}
								</GenrePill>
							))}
						</GenreRow>
					) : null}
					<BookSeriesBlock book={book} />
				</RightColumn>
			</ContentGrid>
		</ContentWrap>
	);
};

export default BookDetailContent;

const ContentWrap = styled.section`
	--detail-backdrop-height: max(18rem, calc(100vw * 356 / 1979));
	--detail-cover-offset: 5rem;
	--detail-cover-max-height: 21rem;
	--detail-cover-max-width: 16rem;

	position: relative;
	overflow: hidden;

	@media (max-width: 74.9375rem) {
		--detail-cover-offset: rem;
		--detail-cover-max-height: 19.5rem;
		--detail-cover-max-width: 14.5rem;
	}

	@media (max-width: 47.9375rem) {
		--detail-backdrop-height: 24rem;
		--detail-cover-offset: 2rem;
		--detail-cover-max-height: 21rem;
		--detail-cover-max-width: 17rem;
	}
`;

const Backdrop = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	height: var(--detail-backdrop-height);
	background: url("/images/coverDetailCard.png") center / cover no-repeat;

	&::before {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		height: 4rem;
		background: linear-gradient(
			180deg,
			rgb(35 61 77 / 0.5) 0%,
			rgb(35 61 77 / 0.2) 48%,
			rgb(35 61 77 / 0) 100%
		);
		content: "";
		pointer-events: none;
	}

	&::after {
		position: absolute;
		right: 0;
		bottom: -0.6rem;
		left: 0;
		height: 14rem;
		background: linear-gradient(
			180deg,
			rgb(232 226 222 / 0) 0%,
			rgb(232 226 222 / 0.04) 24%,
			rgb(232 226 222 / 0.16) 44%,
			rgb(232 226 222 / 0.44) 64%,
			rgb(232 226 222 / 0.77) 79%,
			rgb(232 226 222 / 0.92) 87%,
			rgb(232 226 222) 95%,
			${theme.colors.background} 100%
		);
		content: "";
		pointer-events: none;
	}

	@media (max-width: 47.9375rem) {
		background-size: cover;
	}
`;

const ContentGrid = styled.div`
	position: relative;
	z-index: 1;
	display: grid;
	width: min(calc(100% - 3rem), var(--book-detail-width));
	margin: 0 auto;
	column-gap: 3.5rem;
	grid-template-columns: auto minmax(0, 1fr);

	@media (max-width: 74.9375rem) {
		column-gap: 2rem;
	}

	@media (max-width: 47.9375rem) {
		display: block;
		padding-top: 2rem;
	}
`;

const LeftColumn = styled.aside`
	padding-top: var(--detail-cover-offset);
	width: fit-content;

	@media (max-width: 47.9375rem) {
		margin: 0 auto;
	}
`;

const CoverWrap = styled.div`
	position: relative;
	overflow: hidden;
	width: min(var(--detail-cover-max-width), 100%);
	min-height: var(--detail-cover-max-height);
	border-radius: 0.5rem;
	background: ${theme.colors.surface};
	box-shadow: 0 0 0.9375rem rgb(0 0 0 / 0.45);

	@media (max-width: 47.9375rem) {
		max-width: 100%;
	}
`;

const CoverImage = styled.img<{ $isLoaded: boolean }>`
	display: block;
	width: 100%;
	height: auto;
	max-width: var(--detail-cover-max-width);
	max-height: var(--detail-cover-max-height);
	object-fit: cover;
	opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0)};
	transition: opacity 220ms ease;
`;

const GenreRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	margin-top: 2rem;

	@media (max-width: 47.9375rem) {
		justify-content: center;
	}
`;

const AsideRating = styled.section`
	width: 100%;
	margin-top: 1rem;

	padding: 1rem;
	color: ${theme.colors.foreground};

	@media (max-width: 47.9375rem) {
		max-width: var(--detail-cover-max-width);
	}
`;

const RatingTop = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-around;
`;

const RatingScore = styled.div`
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 2.5rem;
	font-weight: 700;
	line-height: 1;
`;

const RatingMeta = styled.div`
	display: flex;
	min-width: 0;
	flex-direction: column;
	gap: 0.25rem;
`;

const Stars = styled.div`
	display: flex;
	gap: 0.05rem;
	color: ${theme.colors.orangePrimary};

	& svg {
		width: 1rem;
		height: 1rem;
	}
`;

const Votes = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.78rem;
	line-height: 1.2;
`;

const RatingBars = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
	margin-top: 0.95rem;
`;

const BarRow = styled.div`
	display: grid;
	align-items: center;
	gap: 0.45rem;
	grid-template-columns: 0.7rem 1fr;
`;

const BarLabel = styled.span`
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.72rem;
	font-weight: 700;
	line-height: 1;
`;

const BarTrack = styled.span`
	overflow: hidden;
	height: 0.32rem;
	border-radius: 62.4375rem;
	background: rgb(242 239 237 / 0.82);
`;

const BarFill = styled.span<{ $width: number }>`
	display: block;
	width: ${({ $width }) => `${$width}%`};
	height: 100%;
	border-radius: inherit;
	background: ${theme.colors.orangeLight};
`;

const RightColumn = styled.div`
	min-width: 0;
	overflow: hidden;
	padding-bottom: 2rem;

	@media (max-width: 47.9375rem) {
		padding-top: 2rem;
	}
`;
