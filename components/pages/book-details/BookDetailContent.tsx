"use client";

import { useState } from "react";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import Rating from "@mui/material/Rating";
import styled from "styled-components";

import AuthModal, { type AuthModalMode } from "@/components/pages/AuthModal";
import type { Book } from "@/shared/api/books";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import GenrePill from "@/shared/ui/GenrePill/GenrePill";
import { CoverPlaceholder } from "@/shared/ui/Skeleton";

import BookDetailHero from "./BookDetailHero";
import BookDetailTabs, { type TabId } from "./BookDetailTabs";
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

const getBookFacts = (book: Book) => {
	const meta: { label: string; value: string }[] = [];

	if (book.publishedYear) {
		meta.push({ label: "Год", value: String(book.publishedYear) });
	}

	if (book.pagesCount) {
		meta.push({
			label: "Страниц",
			value: book.pagesCount.toLocaleString("ru-RU"),
		});
	}

	if (book.publisher) {
		meta.push({ label: "Издатель", value: book.publisher });
	}

	return meta;
};

const ratingLabels = [5, 4, 3, 2, 1];

const BookDetailContent = ({ book }: BookDetailContentProps) => {
	const coverSrc = book.coverUrl?.trim()
		? book.coverUrl
		: "/images/book-placeholder.svg";
	const [loadedCoverSrc, setLoadedCoverSrc] = useState("");
	const isCoverLoaded = loadedCoverSrc === coverSrc;
	const normalizedRating = book.ratingAvg ?? book.rating ?? 0;
	const formattedRating = normalizedRating.toFixed(1).replace(".0", "");
	const hasRatingBars = book.ratingsByStars.some((value) => value > 0);
	const maxRatingLine = Math.max(...book.ratingsByStars, 1);
	const bookMeta = getBookFacts(book).filter(
		(item) => item.value.trim().toLowerCase() !== "unknown",
	);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const [authModalMode, setAuthModalMode] = useState<AuthModalMode | null>(null);
	const [quickRating, setQuickRating] = useState(0);
	const [quickRatingStatus, setQuickRatingStatus] = useState("");
	const [activeTab, setActiveTab] = useState<TabId>("description");

	const handleQuickRatingSubmit = () => {
		if (!quickRating) {
			setQuickRatingStatus("Выберите оценку.");
			return;
		}

		if (!isAuthenticated) {
			setAuthModalMode("login");
			return;
		}

		setQuickRatingStatus("Оценка готова к отправке. Позже подключим метод API.");
	};

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
								<Stars
									name="book-average-rating"
									precision={0.5}
									readOnly
									value={normalizedRating}
								/>
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

						<QuickRatingBlock>
							<QuickMuiRating
								name="quick-book-rating"
								value={quickRating}
								onChange={(_, value) => {
									setQuickRating(value ?? 0);
									setQuickRatingStatus("");
								}}
							/>
							<QuickRatingTitle>Твоя оценка</QuickRatingTitle>
							<QuickRatingStars aria-label="Быстрая оценка книги">
								{[1, 2, 3, 4, 5].map((value) => {
									const isActive = value <= quickRating;

									return (
										<QuickRatingStar
											key={value}
											aria-label={`${value} из 5`}
											type="button"
											onClick={() => {
												setQuickRating(value);
												setQuickRatingStatus("");
											}}
										>
											{isActive ? (
												<StarIcon aria-hidden="true" />
											) : (
												<StarBorderIcon aria-hidden="true" />
											)}
										</QuickRatingStar>
									);
								})}
							</QuickRatingStars>
							<QuickRatingButton type="button" onClick={handleQuickRatingSubmit}>
								Оценить
							</QuickRatingButton>
							<QuickReviewLink
								type="button"
								onClick={() => setActiveTab("reviews")}
							>
								Написать отзыв
							</QuickReviewLink>
							{quickRatingStatus ? (
								<QuickRatingStatus role="status">
									{quickRatingStatus}
								</QuickRatingStatus>
							) : null}
						</QuickRatingBlock>
					</AsideRating>
				</LeftColumn>

				<RightColumn>
					<BookDetailHero book={book} />
					<BookDetailTabs
						activeTab={activeTab}
						book={book}
						onActiveTabChange={setActiveTab}
					/>
					{bookMeta.length > 0 || book.genres.length > 0 ? (
						<BookFactsGrid>
							{bookMeta.length > 0 ? (
								<BookFactsSection aria-label="Информация о книге">
									<BookFactsTitle>Информация о книге</BookFactsTitle>
									<BookInfoBlock>
										{bookMeta.map((item) => (
											<BookInfoChip key={item.label}>
												<BookInfoLabel>{item.label}</BookInfoLabel>
												<BookInfoValue>{item.value}</BookInfoValue>
											</BookInfoChip>
										))}
									</BookInfoBlock>
								</BookFactsSection>
							) : null}
							{book.genres.length > 0 ? (
								<BookFactsSection aria-label="Жанры книги">
									<BookFactsTitle>Жанры</BookFactsTitle>
									<GenresBlock>
										<GenreRow>
											{book.genres.map((genre) => (
												<HighlightedGenrePill
													key={genre}
													href={`/genres/${genre}`}
													fontSize="0.875rem"
													height="2rem"
													paddingBlock="0.45rem"
													paddingInline="1rem"
												>
													{formatGenreLabel(genre)}
												</HighlightedGenrePill>
											))}
										</GenreRow>
									</GenresBlock>
								</BookFactsSection>
							) : null}
						</BookFactsGrid>
					) : null}
					<BookSeriesBlock book={book} />
				</RightColumn>
			</ContentGrid>
			{authModalMode ? (
				<AuthModal
					mode={authModalMode}
					redirectOnSuccess={false}
					onClose={() => setAuthModalMode(null)}
					onModeChange={setAuthModalMode}
				/>
			) : null}
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
		--detail-cover-offset: 4rem;
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
	width: fit-content;
	padding-top: var(--detail-cover-offset);

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

const BookFactsGrid = styled.div`
	display: grid;
	align-items: start;
	gap: 1.25rem;
	margin-top: 1.8rem;
	grid-template-columns: minmax(0, 1.4fr) minmax(11rem, 0.7fr);

	@media (max-width: 56rem) {
		grid-template-columns: 1fr;
	}
`;

const BookFactsSection = styled.section`
	min-width: 0;
`;

const BookFactsTitle = styled.h2`
	margin: 0 0 0.65rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.15rem;
	font-weight: 500;
	line-height: 1.15;
`;

const BookInfoBlock = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.55rem;
	font-family: ${theme.fonts.sans};
	line-height: 1.35;
`;

const BookInfoChip = styled.span`
	display: inline-flex;
	align-items: center;
	max-width: 100%;
	min-height: 2rem;
	gap: 0.42rem;
	border: 0.0625rem solid rgb(255 255 255 / 0.24);
	border-radius: 62.4375rem;
	background: rgb(174 176 178 / 0.82);
	padding: 0.34rem 0.72rem;
	box-shadow: 0 0.25rem 0.85rem rgb(4 18 26 / 0.05);
`;

const BookInfoLabel = styled.span`
	color: rgb(255 255 255 / 0.7);
	font-size: 0.7rem;
	font-weight: 800;
	letter-spacing: 0.04em;
	text-transform: uppercase;
`;

const BookInfoValue = styled.span`
	min-width: 0;
	overflow: hidden;
	color: ${theme.colors.white};
	font-size: 0.9rem;
	font-weight: 800;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const GenresBlock = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.65rem 0.8rem;
	font-family: ${theme.fonts.sans};
`;

const GenreRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
`;

const HighlightedGenrePill = styled(GenrePill)`
	&& {
		border-color: rgb(218 142 91 / 0.25);
		background: rgb(242 239 237 / 0.86);
		color: ${theme.colors.orangeDark};
		font-weight: 700;
		box-shadow: 0 0.25rem 0.85rem rgb(4 18 26 / 0.04);

		&:hover,
		&:focus-visible {
			background: ${theme.colors.orangeLight};
			color: ${theme.colors.invertedText};
		}
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

const Stars = styled(Rating)`
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

const QuickRatingBlock = styled.div`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 0.45rem;
	margin-top: 1rem;
	border-top: 0.0625rem solid rgb(242 239 237 / 0.72);
	padding-top: 0.95rem;
`;

const QuickRatingTitle = styled.h3`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.05rem;
	font-weight: 600;
	line-height: 1.2;
`;

const QuickMuiRating = styled(Rating)`
	color: ${theme.colors.orangePrimary};

	& .MuiRating-icon {
		width: 1.8rem;
		height: 1.8rem;
	}

	& .MuiSvgIcon-root {
		width: 1.2rem;
		height: 1.2rem;
	}
`;

const QuickRatingStars = styled.div`
	display: none;
	gap: 0.05rem;
`;

const QuickRatingStar = styled.button`
	display: inline-grid;
	width: 1.8rem;
	height: 1.8rem;
	place-items: center;
	border: 0;
	background: transparent;
	padding: 0;
	color: ${theme.colors.orangePrimary};
	cursor: pointer;

	& svg {
		width: 1.15rem;
		height: 1.15rem;
	}

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const QuickRatingButton = styled.button`
	align-self: flex-start;
	border: 0;
	border-radius: 62.4375rem;
	background: ${theme.colors.surface};
	padding: 0.45rem 0.9rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font-family: ${theme.fonts.serif};
	font-size: 0.95rem;
	font-weight: 700;
	line-height: 1.2;
	transition:
		background 180ms ease,
		color 180ms ease;

	&:hover,
	&:focus-visible {
		background: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
		outline: none;
	}
`;

const QuickReviewLink = styled.button`
	align-self: flex-start;
	border: 0;
	background: transparent;
	padding: 0;
	color: ${theme.colors.softForeground};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 0.82rem;
	line-height: 1.35;
	text-decoration: underline;
	text-underline-offset: 0.18rem;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const QuickRatingStatus = styled.p`
	margin: 0;
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.sans};
	font-size: 0.78rem;
	line-height: 1.35;
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
