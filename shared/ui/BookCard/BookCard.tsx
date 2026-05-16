"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent, SyntheticEvent } from "react";
import { useState } from "react";
import styled from "styled-components";

import type { IBookSeriesRelationType } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { PlusIcon } from "@/shared/ui/PlusIcon";
import { CoverPlaceholder } from "@/shared/ui/Skeleton";

export interface IBookCardData {
	id: string;
	title: string;
	author?: string;
	coverUrl?: string;
	orderInSeries?: number;
	relationType?: IBookSeriesRelationType;
	seriesLabel?: string;
}

export type IBookCardSize = "default" | "compact";

interface IBookCardProps {
	book: IBookCardData;
	isActive?: boolean;
	size?: IBookCardSize;
}

const BookCard = ({
	book,
	isActive = false,
	size = "default",
}: IBookCardProps) => {
	const {
		author = "",
		coverUrl,
		orderInSeries,
		relationType,
		seriesLabel,
		title,
	} = book;
	const seriesBadgeLabel = getSeriesBadgeLabel({
		orderInSeries,
		relationType,
		seriesLabel,
	});
	const coverSrc = coverUrl?.trim() ? coverUrl : "/images/book-placeholder.svg";
	const [coverWidth, setCoverWidth] = useState<number | null>(null);
	const [loadedCoverSrc, setLoadedCoverSrc] = useState("");
	const router = useRouter();
	const isCoverLoaded = loadedCoverSrc === coverSrc;

	const openBookPage = () => {
		router.push(`/books/${book.id}`, { scroll: true });
	};

	const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (event.key !== "Enter" && event.key !== " ") {
			return;
		}

		event.preventDefault();
		openBookPage();
	};

	const handleAddButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
	};

	const handleAddButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		event.stopPropagation();
	};

	const handleCoverLoad = (event: SyntheticEvent<HTMLImageElement>) => {
		const image = event.currentTarget;

		if (!image.naturalWidth || !image.naturalHeight) {
			return;
		}

		setCoverWidth(
			(image.naturalWidth / image.naturalHeight) * image.clientHeight,
		);
		setLoadedCoverSrc(coverSrc);
	};

	return (
		<BookCardWrapper
			$coverWidth={coverWidth}
			$isActive={isActive}
			$size={size}
			aria-label={`${title}, ${author}`}
			aria-current={isActive ? "page" : undefined}
			role="link"
			tabIndex={0}
			onClick={openBookPage}
			onKeyDown={handleCardKeyDown}
		>
			<BookCover $size={size}>
				{isCoverLoaded ? null : <CoverPlaceholder aria-hidden="true" />}
				{seriesBadgeLabel ? (
					<SeriesBadge>{seriesBadgeLabel}</SeriesBadge>
				) : null}
				<BookCoverImage
					$isLoaded={isCoverLoaded}
					src={coverSrc}
					alt={`Обложка «${title}»`}
					onLoad={handleCoverLoad}
				/>

				<BookAddButton
					type="button"
					aria-label="Добавить в коллекцию"
					onClick={handleAddButtonClick}
					onKeyDown={handleAddButtonKeyDown}
				>
					<PlusIcon />
				</BookAddButton>
			</BookCover>

			<BookMeta>
				<BookTitle $size={size}>{title}</BookTitle>
				<BookAuthor $size={size}>{author}</BookAuthor>
			</BookMeta>
		</BookCardWrapper>
	);
};

export default BookCard;

const getSeriesBadgeLabel = ({
	orderInSeries,
	relationType,
	seriesLabel,
}: {
	orderInSeries?: number;
	relationType?: IBookSeriesRelationType;
	seriesLabel?: string;
}) => {
	if (relationType === "spin_off") {
		return "spin-off";
	}

	if (relationType === "collection" || relationType === "omnibus") {
		return seriesLabel?.trim() || "bundle";
	}

	if (orderInSeries && orderInSeries > 0) {
		return String(orderInSeries);
	}

	return null;
};

const BookCardWrapper = styled.article<{
	$coverWidth: number | null;
	$isActive: boolean;
	$size: IBookCardSize;
}>`
	position: relative;
	display: flex;
	width: ${({ $coverWidth }) =>
		$coverWidth ? `${$coverWidth}px` : "fit-content"};
	max-width: 100%;
	flex-direction: column;
	gap: 0.5rem;
	background: ${theme.colors.transparent};
	box-shadow: none;
	color: ${theme.colors.foreground};
	cursor: pointer;

	&:focus-visible {
		outline: 0.25rem solid ${theme.colors.orangeDark};
		outline-offset: 0.25rem;
	}
`;

const BookCover = styled.div<{ $size: IBookCardSize }>`
	position: relative;
	overflow: hidden;
	width: fit-content;
	min-width: ${({ $size }) => ($size === "compact" ? "7.5rem" : "10rem")};
	max-width: 100%;
	height: ${({ $size }) => ($size === "compact" ? "11.5rem" : "15.25rem")};

	border-radius: 0.7rem;
	transition:
		border-color 220ms ease,
		box-shadow 220ms ease,
		height 220ms ease,
		transform 300ms ease;
	${BookCardWrapper}[aria-current="page"] & {
		border: 0.175rem solid ${theme.colors.orangeDark};
	}

	${BookCardWrapper}:hover &,
	${BookCardWrapper}:focus-visible & {
		transform: scale(1.02);
	}
`;

const BookCoverImage = styled.img<{ $isLoaded: boolean }>`
	display: block;
	width: auto;
	max-width: 100%;
	height: 100%;
	object-fit: contain;
	border-radius: 0.7rem;
	opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0)};
	transition: opacity 220ms ease;
`;

const BookMeta = styled.div`
	display: flex;
	flex-direction: column;
`;

const BookTitle = styled.h2<{ $size: IBookCardSize }>`
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	margin-block: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: ${({ $size }) => ($size === "compact" ? "0.95rem" : "1.045rem")};
	font-weight: 500;
	line-height: ${({ $size }) => ($size === "compact" ? "1.18rem" : "1.55rem")};
	transition: color 220ms ease;
	overflow-wrap: anywhere;

	${BookCardWrapper}:hover &,
	${BookCardWrapper}:focus-visible & {
		color: ${theme.colors.orangeDark};
	}
`;

const BookAuthor = styled.p<{ $size: IBookCardSize }>`
	margin-block: 0;
	color: ${theme.colors.lightText};
	font-size: ${({ $size }) => ($size === "compact" ? "0.76rem" : "0.875rem")};
	line-height: 1.3334;
	overflow-wrap: anywhere;
`;

const SeriesBadge = styled.span`
	position: absolute;
	top: 0.45rem;
	left: 0.45rem;
	z-index: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 1.5rem;
	height: 1.5rem;
	padding-inline: 0.5rem;
	border: 0.0625rem solid rgb(242 239 237 / 0.55);
	border-radius: 62.4375rem;
	background: rgb(242 239 237 / 0.86);
	box-shadow: 0 0.25rem 0.75rem rgb(4 18 26 / 0.16);
	color: ${theme.colors.bluePrimary};
	font-family: ${theme.fonts.sans};
	font-size: 0.68rem;
	font-weight: 600;
	line-height: 1;
	text-transform: lowercase;
`;

const BookAddButton = styled.button`
	position: absolute;
	right: 0.5rem;
	bottom: 0.5rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.85rem;
	height: 1.85rem;
	border: 0.0625rem solid ${theme.alpha.coverActionBorder};
	border-radius: 50%;
	background: ${theme.alpha.coverActionBackground};
	padding: 0;
	color: ${theme.colors.invertedText};
	cursor: pointer;
	opacity: 0;
	transform: translateY(0.25rem);
	transition:
		background 0.2s ease,
		border-color 0.2s ease,
		color 0.2s ease,
		opacity 0.2s ease,
		transform 0.15s ease;

	& svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	& svg path {
		fill: currentColor;
		transition: fill 0.2s ease;
	}

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangePrimary};
		background: ${theme.colors.orangePrimary};
		color: ${theme.colors.white};
		opacity: 1;
		outline: none;
		transform: translateY(0);
	}

	${BookCardWrapper}:hover &,
	${BookCardWrapper}:focus-within & {
		opacity: 1;
		transform: translateY(0);
	}
`;
