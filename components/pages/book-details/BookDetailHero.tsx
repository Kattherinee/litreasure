"use client";

import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

import type { IBook } from "@/shared/api/books";
import {
	type IUserBookStatus,
	useDeleteBookTrackingMutation,
	useUpdateBookTrackingMutation,
} from "@/shared/api/user-books";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";

import { BookCollectionModal } from "./BookCollectionModal";

interface IBookDetailHeroProps {
	book: IBook;
	onAuthRequired?: () => void;
}

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

const BookDetailHero = ({ book, onAuthRequired }: IBookDetailHeroProps) => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const updateTrackingMutation = useUpdateBookTrackingMutation();
	const deleteTrackingMutation = useDeleteBookTrackingMutation();
	const [trackingOverride, setTrackingOverride] = useState<
		IBook["myTracking"] | undefined
	>();
	const [collectionIdsOverride, setCollectionIdsOverride] = useState<
		Set<string> | undefined
	>();
	const [trackingStatus, setTrackingStatus] = useState("");
	const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
	const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
	const seriesTag = getSeriesTag(book);
	const primaryAuthor = book.authors?.[0];
	const authorName = primaryAuthor?.name ?? book.author;
	const authorPhotoUrl = primaryAuthor?.photoUrl;
	const trackingState =
		trackingOverride === undefined ? (book.myTracking ?? null) : trackingOverride;
	const collectionIds =
		collectionIdsOverride ?? new Set(book.myCollectionIds ?? []);
	const currentStatus = trackingState?.status;
	const isBookTracked = Boolean(currentStatus);
	const currentStatusLabel = currentStatus
		? statusLabels[currentStatus]
		: "Add to library";
	const isTrackingPending =
		updateTrackingMutation.isPending || deleteTrackingMutation.isPending;

	const saveStatus = async (status: IUserBookStatus) => {
		setTrackingStatus("");
		setIsStatusMenuOpen(false);

		if (!isAuthenticated) {
			onAuthRequired?.();
			return;
		}

		try {
			const nextTracking = await updateTrackingMutation.mutateAsync({
				bookId: book.id,
				payload: {
					currentPage: trackingState?.currentPage,
					isRereading: status === "rereading",
					readCount: trackingState?.readCount ?? 0,
					status,
				},
			});
			setTrackingOverride(nextTracking);
			setTrackingStatus(`Status: ${statusLabels[status]}`);
		} catch (error) {
			setTrackingStatus(
				error instanceof Error ? error.message : "Could not update the book.",
			);
		}
	};

	const handlePrimaryLibraryClick = () => {
		if (isBookTracked) {
			setIsStatusMenuOpen((current) => !current);
			return;
		}

		void saveStatus("planned");
	};

	const handleRemoveFromLibrary = async () => {
		setTrackingStatus("");

		if (!isAuthenticated) {
			onAuthRequired?.();
			return;
		}

		try {
			await deleteTrackingMutation.mutateAsync(book.id);
			setTrackingOverride(null);
			setTrackingStatus("Removed from library");
		} catch (error) {
			setTrackingStatus(
				error instanceof Error ? error.message : "Could not remove the book.",
			);
		}
	};

	const openCollectionModal = () => {
		if (!isAuthenticated) {
			onAuthRequired?.();
			return;
		}

		setIsCollectionModalOpen(true);
	};

	return (
		<HeaderBlock>
			{seriesTag ? <SeriesTag>{seriesTag}</SeriesTag> : null}
			<Title>
				<TitleText>{book.title}</TitleText>
				{currentStatus === "finished" ? (
					<FinishedMark aria-label="Finished">
						<CheckCircleOutlinedIcon aria-hidden="true" />
						<span>Finished</span>
					</FinishedMark>
				) : null}
			</Title>
			{primaryAuthor ? (
				<AuthorLink href={`/authors/${primaryAuthor.id}`}>
					<AuthorBy>by</AuthorBy>
					{authorPhotoUrl ? <AuthorPhoto $photoUrl={authorPhotoUrl} /> : null}
					<AuthorName>{authorName}</AuthorName>
				</AuthorLink>
			) : (
				<Author>
					<AuthorBy>by</AuthorBy>
					<AuthorName>{authorName}</AuthorName>
				</Author>
			)}

			<ActionRow>
				<LibraryAction
					onBlur={(event) => {
						if (!event.currentTarget.contains(event.relatedTarget)) {
							setIsStatusMenuOpen(false);
						}
					}}
				>
					<LibraryMainButton
						$isTracked={isBookTracked}
						aria-expanded={isBookTracked ? isStatusMenuOpen : undefined}
						aria-haspopup={isBookTracked ? "menu" : undefined}
						disabled={isTrackingPending}
						type="button"
						onClick={handlePrimaryLibraryClick}
					>
						<span>{currentStatusLabel}</span>
						{isBookTracked ? <KeyboardArrowDownIcon aria-hidden="true" /> : null}
					</LibraryMainButton>
					{isBookTracked ? null : (
						<LibraryMenuButton
							aria-expanded={isStatusMenuOpen}
							aria-label="Change book status"
							$isTracked={isBookTracked}
							disabled={isTrackingPending}
							type="button"
							onClick={() => setIsStatusMenuOpen((current) => !current)}
						>
							<KeyboardArrowDownIcon aria-hidden="true" />
						</LibraryMenuButton>
					)}
					{isStatusMenuOpen ? (
						<StatusMenu role="menu">
							{bookStatuses.map((status) => (
								<StatusMenuItem
									key={status.id}
									$isActive={currentStatus === status.id}
									role="menuitem"
									type="button"
									onClick={() => void saveStatus(status.id)}
								>
									<span>{status.label}</span>
									{currentStatus === status.id ? (
										<CheckIcon aria-hidden="true" />
									) : null}
								</StatusMenuItem>
							))}
							{isBookTracked ? (
								<>
									<StatusMenuDivider />
									<StatusMenuItem
										$isActive={false}
										role="menuitem"
										type="button"
										onClick={() => void handleRemoveFromLibrary()}
									>
										<span>Remove</span>
									</StatusMenuItem>
								</>
							) : null}
						</StatusMenu>
					) : null}
				</LibraryAction>
				<RoundAction
					type="button"
					aria-label="Book shelves"
					onClick={openCollectionModal}
				>
					<AutoStoriesOutlinedIcon aria-hidden="true" />
				</RoundAction>
				<RoundAction type="button" aria-label="More actions">
					<MoreHorizIcon aria-hidden="true" />
				</RoundAction>
			</ActionRow>
			{trackingStatus ? (
				<VisuallyHidden role="status">{trackingStatus}</VisuallyHidden>
			) : null}
			{isCollectionModalOpen ? (
				<BookCollectionModal
					bookId={book.id}
					collectionIds={collectionIds}
					onCollectionIdsChange={setCollectionIdsOverride}
					onClose={() => setIsCollectionModalOpen(false)}
				/>
			) : null}
		</HeaderBlock>
	);
};

export default BookDetailHero;

const getSeriesTag = (book: IBook) => {
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
	min-width: 0;
	flex-direction: column;
	padding-top: var(--detail-cover-offset);

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
	overflow: hidden;
	border: 0.0625rem solid rgb(242 239 237 / 0.22);
	border-radius: 62.4375rem;
	background: rgb(242 239 237 / 0.12);
	padding: 0.42rem 0.78rem;
	color: ${theme.colors.orangeLight};
	font-family: ${theme.fonts.sans};
	font-size: 0.82rem;
	font-weight: 600;
	line-height: 1;
	text-overflow: ellipsis;
	white-space: nowrap;

	@media (max-width: 74.9375rem) {
		font-size: 0.72rem;
	}
`;

const Title = styled.h1`
	display: flex;
	align-items: center;
	gap: 0.7rem;
	max-width: 100%;
	margin: 1.1rem 0 0;
	color: ${theme.colors.invertedText};
	font-family: ${theme.fonts.serif};
	font-size: 2.35rem;
	font-weight: 500;
	line-height: 1.12;
	overflow-wrap: anywhere;

	@media (max-width: 74.9375rem) {
		font-size: 1.72rem;
	}

	@media (max-width: 47.9375rem) {
		font-size: 2rem;
	}
`;

const TitleText = styled.span`
	display: -webkit-box;
	min-width: 0;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
`;

const FinishedMark = styled.span`
	display: inline-flex;
	flex: 0 0 auto;
	align-items: center;
	justify-content: center;
	gap: 0.35rem;
	border: 0.0625rem solid rgb(242 239 237 / 0.22);
	border-radius: 62.4375rem;
	background: rgb(242 239 237 / 0.12);
	padding: 0.42rem 0.78rem;
	color: ${theme.colors.orangeLight};
	font-family: ${theme.fonts.sans};
	font-size: 0.82rem;
	font-weight: 600;
	line-height: 1;

	& svg {
		width: 1rem;
		height: 1rem;
	}

	@media (max-width: 74.9375rem) {
		padding: 0.36rem 0.64rem;
		font-size: 0.72rem;

		& svg {
			width: 0.9rem;
			height: 0.9rem;
		}
	}
`;

const Author = styled.p`
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
	max-width: 100%;
	overflow: hidden;
	margin: 0.55rem 0 0;
	color: ${theme.colors.orangeLight};
	font-family: ${theme.fonts.sans};
	font-size: 1.125rem;
	line-height: 1.4;
	text-overflow: ellipsis;
	white-space: nowrap;

	@media (max-width: 74.9375rem) {
		font-size: 0.95rem;
	}

	@media (max-width: 47.9375rem) {
		font-size: 1.1rem;
	}
`;

const AuthorLink = styled(Link)`
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
	width: fit-content;
	max-width: 100%;
	overflow: hidden;
	margin: 0.35vw 0 0;
	color: ${theme.colors.orangeLight};
	font-family: ${theme.fonts.sans};
	font-size: 1.1vw;
	line-height: 1.4;
	text-decoration: none;
	text-overflow: ellipsis;
	white-space: nowrap;

	&:hover,
	&:focus-visible {
		outline: none;
		text-decoration: underline;
	}

	@media (max-width: 74.9375rem) {
		font-size: 0.95rem;
	}

	@media (max-width: 47.9375rem) {
		font-size: 1.1rem;
	}
`;

const AuthorBy = styled.span`
	color: ${theme.colors.orangeLight};
	${AuthorLink}:hover & {
		text-decoration: none !important;
	}
`;

const AuthorPhoto = styled.span<{ $photoUrl?: string }>`
	display: inline-flex;
	width: 1.75rem;
	height: 1.75rem;
	flex: 0 0 auto;
	align-items: center;
	justify-content: center;
	border: 0.0625rem solid rgb(242 239 237 / 0.36);
	border-radius: 50%;
	background: url("${({ $photoUrl }) => $photoUrl}") center / cover no-repeat;
	color: ${theme.colors.orangeLight};
	font-family: ${theme.fonts.serif};
	font-size: 0.85rem;
	font-weight: 600;
	line-height: 1;
`;

const AuthorName = styled.span`
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
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

const LibraryAction = styled.div`
	position: relative;
	display: inline-flex;
	align-items: stretch;
	margin-top: 0.1rem;
`;

const LibraryButtonBase = styled.button<{ $isTracked: boolean }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 2.65rem;
	border: 0;
	background: ${({ $isTracked }) =>
		$isTracked ? theme.colors.surface : theme.colors.orangeLight};
	color: ${({ $isTracked }) =>
		$isTracked ? theme.colors.darkerOrangeLight : theme.colors.invertedText};
	cursor: pointer;
	font-family: ${theme.fonts.serif};
	font-size: 1.1rem;
	font-weight: 700;
	line-height: 1.2;
	transition:
		background 180ms ease,
		color 180ms ease,
		transform 180ms ease;

	&:hover,
	&:focus-visible {
		background: ${({ $isTracked }) =>
			$isTracked ? theme.colors.orangeLight : theme.colors.surface};
		color: ${({ $isTracked }) =>
			$isTracked ? theme.colors.invertedText : theme.colors.darkerOrangeLight};
		outline: none;
	}

	&:disabled {
		cursor: wait;
		opacity: 0.72;
	}

	@media (max-width: 74.9375rem) {
		min-height: 2.35rem;
		font-size: 0.95rem;
	}
`;

const LibraryMainButton = styled(LibraryButtonBase)`
	min-width: ${({ $isTracked }) => ($isTracked ? "7.8rem" : "10.5rem")};
	gap: 0.35rem;
	border-radius: ${({ $isTracked }) =>
		$isTracked
			? "62.4375rem"
			: "62.4375rem 0 0 62.4375rem"};
	padding: ${({ $isTracked }) =>
		$isTracked ? "0.58rem 1.25rem" : "0.58rem 0.9rem 0.58rem 1.2rem"};

	@media (max-width: 74.9375rem) {
		min-width: ${({ $isTracked }) => ($isTracked ? "6.8rem" : "8.6rem")};
		padding: ${({ $isTracked }) =>
			$isTracked ? "0.5rem 1rem" : "0.5rem 0.8rem 0.5rem 1rem"};
	}

	& svg {
		width: 1.35rem;
		height: 1.35rem;
		transition: transform 160ms ease;
	}

	&[aria-expanded="true"] svg {
		transform: rotate(180deg);
	}
`;

const LibraryMenuButton = styled(LibraryButtonBase)`
	width: 2.55rem;
	border-radius: 0 62.4375rem 62.4375rem 0;
	border-left: 0.0625rem solid rgb(242 239 237 / 0.46);
	padding: 0;

	& svg {
		width: 1.45rem;
		height: 1.45rem;
		transition: transform 160ms ease;
	}

	&[aria-expanded="true"] svg {
		transform: rotate(180deg);
	}

	@media (max-width: 74.9375rem) {
		width: 2.35rem;
	}
`;

const StatusMenu = styled.div`
	position: absolute;
	top: calc(100% + 0.55rem);
	left: 0;
	z-index: 20;
	display: grid;
	width: 13.5rem;
	overflow: hidden;
	border: 0.0625rem solid ${theme.colors.orangeLight};
	border-radius: 0.9rem;
	background: #f2efed;
	box-shadow: 0 1rem 2rem rgb(4 18 26 / 0.16);
	padding: 0.35rem;
	text-align: left;
`;

const StatusMenuItem = styled.button<{ $isActive: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	border: 0;
	border-radius: 0.65rem;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.16)" : "transparent"} !important;
	padding: 0.65rem 0.75rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeDark : theme.colors.foreground} !important;
	cursor: pointer;
	font: inherit;
	font-size: 0.95rem;
	font-weight: ${({ $isActive }) => ($isActive ? 700 : 500)};

	& svg {
		width: 1.1rem;
		height: 1.1rem;
		color: ${theme.colors.orangeDark};
	}

	&:hover,
	&:focus-visible {
		background: ${({ $isActive }) =>
			$isActive
				? "rgb(218 142 91 / 0.22)"
				: "rgb(238 179 141 / 0.16)"} !important;
		color: ${theme.colors.orangeDark} !important;
		outline: none;
	}
`;

const StatusMenuDivider = styled.div`
	height: 0.0625rem;
	margin: 0.25rem;
	background: rgb(238 179 141 / 0.55);
`;

const VisuallyHidden = styled.span`
	position: absolute;
	width: 1px;
	height: 1px;
	overflow: hidden;
	clip: rect(0 0 0 0);
	white-space: nowrap;
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
