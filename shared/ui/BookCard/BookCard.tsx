"use client";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent, SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import type { IAuthorShort, IBookSeriesRelationType } from "@/shared/api/books";
import {
	type IUserBookStatus,
	useUpdateBookTrackingMutation,
} from "@/shared/api/user-books";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { PlusIcon } from "@/shared/ui/PlusIcon";
import { CoverPlaceholder } from "@/shared/ui/Skeleton";

const statusLabels: Record<IUserBookStatus, string> = {
	dropped: "Dropped",
	finished: "Finished",
	paused: "Paused",
	planned: "Planned",
	reading: "Reading",
	rereading: "Rereading",
};

const bookStatuses: Array<{ id: IUserBookStatus; label: string }> = [
	{ id: "planned", label: statusLabels.planned },
	{ id: "reading", label: statusLabels.reading },
	{ id: "finished", label: statusLabels.finished },
	{ id: "paused", label: statusLabels.paused },
	{ id: "rereading", label: statusLabels.rereading },
	{ id: "dropped", label: statusLabels.dropped },
];

export interface IBookCardData {
	id: string;
	title: string;
	author?: string;
	authorId?: string;
	authors?: IAuthorShort[];
	coverUrl?: string;
	orderInSeries?: number;
	relationType?: IBookSeriesRelationType;
	seriesLabel?: string;
	isTracked?: boolean;
	myStatus?: IUserBookStatus | null;
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
	size = "compact",
}: IBookCardProps) => {
	const {
		author,
		authorId,
		authors,
		coverUrl,
		isTracked,
		myStatus,
		orderInSeries,
		relationType,
		seriesLabel,
		title,
	} = book;
	const primaryAuthor = authors?.[0];
	const authorName = author ?? primaryAuthor?.name ?? "";
	const resolvedAuthorId = authorId ?? primaryAuthor?.id;
	const seriesBadgeLabel = getSeriesBadgeLabel({
		orderInSeries,
		relationType,
		seriesLabel,
	});
	const coverSrc = coverUrl?.trim() ? coverUrl : "/images/book-placeholder.svg";
	const [coverWidth, setCoverWidth] = useState<number | null>(null);
	const [loadedCoverSrc, setLoadedCoverSrc] = useState("");
	const router = useRouter();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const updateTrackingMutation = useUpdateBookTrackingMutation();
	const [addStatus, setAddStatus] = useState("");
	const [localStatus, setLocalStatus] = useState<IUserBookStatus | null>(
		myStatus ?? null,
	);
	const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
	const isCoverLoaded = loadedCoverSrc === coverSrc;
	const isBookTracked = Boolean(isTracked || localStatus);
	const currentStatusLabel = localStatus ? statusLabels[localStatus] : "Saved";

	useEffect(() => {
		if (!addStatus) return;

		const timeoutId = window.setTimeout(() => {
			setAddStatus("");
		}, 2200);

		return () => window.clearTimeout(timeoutId);
	}, [addStatus]);

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

	const saveStatus = async (status: IUserBookStatus) => {
		setAddStatus("");
		setIsStatusMenuOpen(false);

		if (!isAuthenticated) {
			router.push("/auth/login");
			return;
		}

		try {
			const nextTracking = await updateTrackingMutation.mutateAsync({
				bookId: book.id,
				payload: {
					isRereading: false,
					readCount: 0,
					status,
				},
			});
			setLocalStatus(nextTracking.status);
			setAddStatus(`Status: ${statusLabels[nextTracking.status]}`);
		} catch (error) {
			setAddStatus(
				error instanceof Error ? error.message : "Не удалось добавить книгу",
			);
		}
	};

	const handleAddButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();

		if (isBookTracked) {
			setIsStatusMenuOpen((current) => !current);
			return;
		}

		void saveStatus("planned");
	};

	const handleStatusMenuButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		setIsStatusMenuOpen((current) => !current);
	};

	const handleAddButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		event.stopPropagation();
	};

	const stopNestedNavigation = (
		event: MouseEvent<HTMLAnchorElement> | KeyboardEvent<HTMLAnchorElement>,
	) => {
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
			aria-label={`${title}, ${authorName}`}
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
				{isBookTracked ? (
					<SavedBookmark aria-label="Book is in your library">
						<BookmarkIcon aria-hidden="true" />
					</SavedBookmark>
				) : null}
				<BookCoverImage
					$isLoaded={isCoverLoaded}
					src={coverSrc}
					alt={`Обложка «${title}»`}
					onLoad={handleCoverLoad}
				/>

				<CardLibraryAction
					$isTracked={isBookTracked}
					onBlur={(event) => {
						if (!event.currentTarget.contains(event.relatedTarget)) {
							setIsStatusMenuOpen(false);
						}
					}}
				>
					<BookAddButton
						$isTracked={isBookTracked}
						type="button"
						aria-expanded={isBookTracked ? isStatusMenuOpen : undefined}
						aria-haspopup={isBookTracked ? "menu" : undefined}
						aria-label={
							isBookTracked
								? "Change book status"
								: "Add to library as planned"
						}
						disabled={updateTrackingMutation.isPending}
						onClick={handleAddButtonClick}
						onKeyDown={handleAddButtonKeyDown}
					>
						{isBookTracked ? (
							<>
								<span>{currentStatusLabel}</span>
								<KeyboardArrowDownIcon aria-hidden="true" />
							</>
						) : (
							<PlusIcon />
						)}
					</BookAddButton>
					{isBookTracked ? null : (
						<BookStatusMenuButton
							aria-expanded={isStatusMenuOpen}
							aria-label="Choose book status"
							disabled={updateTrackingMutation.isPending}
							type="button"
							onClick={handleStatusMenuButtonClick}
							onKeyDown={handleAddButtonKeyDown}
						>
							<KeyboardArrowDownIcon aria-hidden="true" />
						</BookStatusMenuButton>
					)}
					{isStatusMenuOpen ? (
						<CardStatusMenu role="menu">
							{bookStatuses.map((status) => (
								<CardStatusMenuItem
									key={status.id}
									$isActive={localStatus === status.id}
									role="menuitem"
									type="button"
									onClick={(event) => {
										event.stopPropagation();
										void saveStatus(status.id);
									}}
								>
									<span>{status.label}</span>
									{localStatus === status.id ? (
										<CheckIcon aria-hidden="true" />
									) : null}
								</CardStatusMenuItem>
							))}
						</CardStatusMenu>
					) : null}
				</CardLibraryAction>
				{addStatus ? <AddStatus>{addStatus}</AddStatus> : null}
			</BookCover>

			<BookMeta $coverWidth={coverWidth}>
				<BookTitle $size={size}>{title}</BookTitle>
				{resolvedAuthorId ? (
					<BookAuthorLink
						$size={size}
						href={`/authors/${resolvedAuthorId}`}
						onClick={stopNestedNavigation}
						onKeyDown={stopNestedNavigation}
					>
						{authorName}
					</BookAuthorLink>
				) : (
					<BookAuthor $size={size}>{authorName}</BookAuthor>
				)}
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
	width: min-content;
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
	overflow: visible;
	width: fit-content;
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

const SavedBookmark = styled.span`
	position: absolute;
	top: 0.45rem;
	right: 0.45rem;
	z-index: 2;
	display: inline-flex;
	width: 1.6rem;
	height: 1.6rem;
	align-items: center;
	justify-content: center;
	border: 0.0625rem solid rgb(242 239 237 / 0.62);
	border-radius: 50%;
	background: rgb(242 239 237 / 0.9);
	box-shadow: 0 0.25rem 0.75rem rgb(4 18 26 / 0.16);
	color: ${theme.colors.orangePrimary};

	& svg {
		width: 0.95rem;
		height: 0.95rem;
	}
`;

const BookMeta = styled.div<{ $coverWidth: number | null }>`
	display: flex;
	flex-direction: column;
	${({ $coverWidth }) =>
		$coverWidth ? `width: ${$coverWidth}px;` : `width: 0; min-width: 100%;`}
	overflow: hidden;
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

const BookAuthorLink = styled(Link)<{ $size: IBookCardSize }>`
	margin-block: 0;
	color: ${theme.colors.lightText};
	font-size: ${({ $size }) => ($size === "compact" ? "0.76rem" : "0.875rem")};
	line-height: 1.3334;
	overflow-wrap: anywhere;
	text-decoration: none;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
		text-decoration: underline;
	}
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

const CardLibraryAction = styled.div<{ $isTracked: boolean }>`
	position: absolute;
	right: 0.5rem;
	bottom: 0.5rem;
	z-index: 3;
	display: inline-flex;
	align-items: center;
	opacity: 0;
	transform: translateY(0.25rem);
	transition:
		opacity 0.2s ease,
		transform 0.15s ease;

	${BookCardWrapper}:hover &,
	${BookCardWrapper}:focus-within & {
		opacity: 1;
		transform: translateY(0);
	}
`;

const CoverActionButton = styled.button`
	display: inline-flex;
	min-height: 1.72rem;
	align-items: center;
	justify-content: center;
	border: 0;
	cursor: pointer;
	font-family: ${theme.fonts.serif};
	font-size: 0.76rem;
	font-weight: 700;
	line-height: 1;
	transition:
		background 0.2s ease,
		color 0.2s ease;

	& svg {
		width: 1rem;
		height: 1rem;
	}

	& svg path {
		fill: currentColor;
		transition: fill 0.2s ease;
	}

	&:hover,
	&:focus-visible {
		outline: none;
	}
`;

const BookAddButton = styled(CoverActionButton)<{ $isTracked: boolean }>`
	gap: 0.12rem;
	min-width: ${({ $isTracked }) => ($isTracked ? "4.8rem" : "1.72rem")};
	border-radius: ${({ $isTracked }) =>
		$isTracked ? "62.4375rem" : "62.4375rem 0 0 62.4375rem"};
	background: ${({ $isTracked }) =>
		$isTracked ? theme.colors.surface : theme.colors.orangeLight};
	padding: ${({ $isTracked }) => ($isTracked ? "0 0.42rem 0 0.56rem" : "0")};
	color: ${({ $isTracked }) =>
		$isTracked ? theme.colors.darkerOrangeLight : theme.colors.invertedText};

	&:hover,
	&:focus-visible {
		background: ${({ $isTracked }) =>
			$isTracked ? theme.colors.orangeLight : theme.colors.surface};
		color: ${({ $isTracked }) =>
			$isTracked ? theme.colors.invertedText : theme.colors.darkerOrangeLight};
	}

	&[aria-expanded="true"] svg {
		transform: rotate(180deg);
	}
`;

const BookStatusMenuButton = styled(CoverActionButton)`
	width: 1.72rem;
	border-left: 0.0625rem solid rgb(242 239 237 / 0.46);
	border-radius: 0 62.4375rem 62.4375rem 0;
	background: ${theme.colors.orangeLight};
	padding: 0;
	color: ${theme.colors.invertedText};

	&:hover,
	&:focus-visible {
		background: ${theme.colors.surface};
		color: ${theme.colors.darkerOrangeLight};
	}

	&[aria-expanded="true"] svg {
		transform: rotate(180deg);
	}
`;

const CardStatusMenu = styled.div`
	position: absolute;
	right: 0;
	bottom: calc(100% + 0.45rem);
	z-index: 4;
	display: grid;
	width: 9.4rem;
	overflow: hidden;
	border: 0.0625rem solid ${theme.colors.orangeLight};
	border-radius: 0.75rem;
	background: ${theme.colors.surface};
	box-shadow: 0 0.8rem 1.6rem rgb(4 18 26 / 0.18);
	padding: 0.25rem;
	text-align: left;
`;

const CardStatusMenuItem = styled.button<{ $isActive: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.45rem;
	border: 0;
	border-radius: 0.55rem;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.16)" : "transparent"};
	padding: 0.5rem 0.55rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeDark : theme.colors.foreground};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 0.78rem;
	font-weight: ${({ $isActive }) => ($isActive ? 700 : 500)};
	line-height: 1;

	& svg {
		width: 0.92rem;
		height: 0.92rem;
		color: ${theme.colors.orangeDark};
	}

	&:hover,
	&:focus-visible {
		background: rgb(238 179 141 / 0.16);
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const AddStatus = styled.span`
	position: absolute;
	right: 0.45rem;
	bottom: 2.65rem;
	z-index: 2;
	max-width: calc(100% - 0.9rem);
	overflow: hidden;
	border-radius: 999px;
	background: rgb(242 239 237 / 0.92);
	padding: 0.25rem 0.5rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.68rem;
	font-weight: 700;
	line-height: 1;
	text-overflow: ellipsis;
	white-space: nowrap;
`;
