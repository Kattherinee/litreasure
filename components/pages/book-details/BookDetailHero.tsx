"use client";

import AddIcon from "@mui/icons-material/Add";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import styled from "styled-components";

import type { Book } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { Button } from "@/shared/ui/Button";

type BookDetailHeroProps = {
	book: Book;
};

const BookDetailHero = ({ book }: BookDetailHeroProps) => {
	const seriesTag = getSeriesTag(book);

	return (
		<HeaderBlock>
			{seriesTag ? <SeriesTag>{seriesTag}</SeriesTag> : null}
			<Title>{book.title}</Title>
			<Author>{book.author}</Author>

			<ActionRow>
				<ActionButton variant="containedInverted">
					<span>Add to library</span>
					<AddIcon aria-hidden="true" />
				</ActionButton>
				<RoundAction type="button" aria-label="Книжные полки">
					<AutoStoriesOutlinedIcon aria-hidden="true" />
				</RoundAction>
				<RoundAction type="button" aria-label="Больше действий">
					<MoreHorizIcon aria-hidden="true" />
				</RoundAction>
			</ActionRow>
		</HeaderBlock>
	);
};

export default BookDetailHero;

const getSeriesTag = (book: Book) => {
	const series = book.series;
	const seriesTitle = series?.title;

	if (!series || !seriesTitle) {
		return null;
	}

	const orderInSeries = series.orderInSeries ?? book.orderInSeries;
	const relationType = series.relationType ?? book.relationType;
	const mainBooksCount =
		series.books?.filter(
			(seriesBook) =>
				(seriesBook.relationType === "main" ||
					!seriesBook.relationType ||
					seriesBook.relationType === "unknown") &&
				(seriesBook.orderInSeries ?? 0) > 0,
		).length ?? 0;

	if (relationType === "spin_off") {
		return `Spin-off in ${seriesTitle}`;
	}

	if (relationType === "collection" || relationType === "omnibus") {
		return `${series.seriesLabel ?? book.seriesLabel ?? "Collection"} in ${seriesTitle}`;
	}

	if (orderInSeries && orderInSeries > 0) {
		return mainBooksCount > 0
			? `Book ${orderInSeries} of ${mainBooksCount} in ${seriesTitle}`
			: `Book ${orderInSeries} in ${seriesTitle}`;
	}

	return `Part of ${seriesTitle}`;
};

const HeaderBlock = styled.section`
	display: flex;
	height: var(--detail-backdrop-height);
	flex-direction: column;
	padding-top: var(--detail-cover-offset);
	padding-bottom: 2rem;

	@media (max-width: 47.9375rem) {
		align-items: center;
		min-height: auto;
		padding-top: 0;
		padding-bottom: 0;
		text-align: center;
	}
`;

const SeriesTag = styled.div`
	display: inline-flex;
	align-items: center;
	width: fit-content;
	max-width: 100%;

	border: 0.0625rem solid rgb(242 239 237 / 0.22);
	border-radius: 62.4375rem;
	background: rgb(242 239 237 / 0.12);
	padding: 0.42rem 0.78rem;
	color: ${theme.colors.orangeLight};
	font-family: ${theme.fonts.sans};
	font-size: 0.82rem;
	font-weight: 600;
	line-height: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	@media (max-width: 74.9375rem) {
		font-size: 0.72rem;
	}
`;

const Title = styled.h1`
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	margin: 0.8rem 0 0;

	color: ${theme.colors.invertedText};
	font-family: ${theme.fonts.serif};
	font-size: 2.35rem;
	font-weight: 500;
	line-height: 1.12;

	@media (max-width: 74.9375rem) {
		font-size: 1.72rem;
	}

	@media (max-width: 47.9375rem) {
		font-size: 2rem;
	}
`;

const Author = styled.p`
	margin: 1rem 0 0;
	color: ${theme.colors.orangeLight};
	font-family: ${theme.fonts.sans};
	font-size: 1.125rem;
	line-height: 1.4;
	margin-block: 0;
	margin-top: 0.55rem;

	@media (max-width: 74.9375rem) {
		font-size: 0.95rem;
	}

	@media (max-width: 47.9375rem) {
		font-size: 1.1rem;
	}
`;

const ActionRow = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;

	padding-top: 1.4rem;

	@media (max-width: 74.9375rem) {
		gap: 0.75rem;
		padding-top: 1rem;
	}

	@media (max-width: 47.9375rem) {
		justify-content: center;
	}

	@media (max-width: 32rem) {
		flex-wrap: wrap;
	}
`;

const ActionButton = styled(Button)`
	&& {
		padding: 0.58rem 1.25rem;
		font-size: 1.1rem;
		gap: 0.45rem;
		margin-top: 0.1rem;
		background: ${theme.colors.darkerOrangeLight};
		border-color: ${theme.colors.darkerOrangeLight};

		@media (max-width: 74.9375rem) {
			padding: 0.5rem 1.05rem;
			font-size: 0.95rem;
		}
	}
`;

const RoundAction = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2.65rem;
	height: 2.65rem;
	border: 0;
	border-radius: 50%;
	background: ${theme.colors.surface};
	color: ${theme.colors.darkerOrangeLight};
	cursor: pointer;
	transition:
		background 180ms ease,
		color 180ms ease,
		transform 180ms ease;

	& svg {
		width: 1.65rem;
		height: 1.65rem;
	}

	@media (max-width: 74.9375rem) {
		width: 2.35rem;
		height: 2.35rem;

		& svg {
			width: 1.45rem;
			height: 1.45rem;
		}
	}

	&:hover,
	&:focus-visible {
		background: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
		outline: none;
		transform: translateY(-0.0625rem);
	}
`;
