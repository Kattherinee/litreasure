"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import styled from "styled-components";

import type { Book } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import GenrePill from "@/shared/ui/GenrePill/GenrePill";

import BookDetailHero from "./BookDetailHero";
import BookDetailRating from "./BookDetailRating";
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

const BookDetailContent = ({ book }: BookDetailContentProps) => {
	const coverSrc = book.coverUrl?.trim()
		? book.coverUrl
		: "/images/book-placeholder.svg";
	return (
		<ContentWrap>
			<Backdrop aria-hidden="true" />

			<ContentGrid>
				<LeftColumn>
					<CoverWrap>
						<CoverImage src={coverSrc} alt={`Обложка «${book.title}»`} />
					</CoverWrap>

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

					<DetailButton type="button">
						<span>Detail information</span>
						<KeyboardArrowDownIcon aria-hidden="true" />
					</DetailButton>
				</LeftColumn>

				<RightColumn>
					<BookDetailHero book={book} />
					<BookDetailTabs book={book} />
					<BookSeriesBlock book={book} />
					<BookDetailRating book={book} />
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
		--detail-cover-offset: 3rem;
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
	background:
		linear-gradient(90deg, rgb(4 18 26 / 0.38), rgb(4 18 26 / 0.2)),
		url("/images/coverDetailCard.png") center / cover no-repeat;

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
	column-gap: 3rem;
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
	overflow: hidden;
	width: fit-content;
	border-radius: 0.5rem;
	background: ${theme.colors.surface};
	box-shadow: 0 0 0.9375rem rgb(0 0 0 / 0.45);

	@media (max-width: 47.9375rem) {
		max-width: 100%;
	}
`;

const CoverImage = styled.img`
	display: block;
	width: auto;
	height: auto;
	max-width: var(--detail-cover-max-width);
	max-height: var(--detail-cover-max-height);
	object-fit: contain;
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

const DetailButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 2.95rem;
	margin-top: 1.4rem;
	border: 0.0625rem solid ${theme.colors.muted};
	border-radius: 1.25rem;
	background: ${theme.colors.transparent};
	color: ${theme.colors.foreground};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 1.125rem;
	line-height: 1;
	transition:
		border-color 180ms ease,
		color 180ms ease;

	& svg {
		width: 1.5rem;
		height: 1.5rem;
		margin-left: 0.75rem;
	}

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeDark};
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const RightColumn = styled.div`
	min-width: 0;
	padding-bottom: 2rem;

	@media (max-width: 47.9375rem) {
		padding-top: 2rem;
	}
`;
