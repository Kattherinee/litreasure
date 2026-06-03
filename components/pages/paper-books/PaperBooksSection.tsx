"use client";

import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import Link from "next/link";
import { useRouter } from "next/navigation";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import type { MouseEvent, SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styled from "styled-components";

import {
	type IPaperBookStatus,
	usePaperBookStatusCountsQuery,
	usePaperBooksQuery,
} from "@/shared/api/paper-books";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { AppPagination } from "@/shared/ui/AppPagination";
import { ChipTabs } from "@/shared/ui/ChipTabs";
import { CoverPlaceholder } from "@/shared/ui/Skeleton";

const pageSize = 18;
const previewSize = 7;

const combinedStatus = "owned_and_given_away" as const;
const noteBubbleEstimate = {
	height: 144,
	width: 240,
};
const noteBubbleGap = 12;

type IPaperBooksFilter = IPaperBookStatus | typeof combinedStatus;

const statusTabs: Array<{ id: IPaperBooksFilter; label: string }> = [
	{ id: combinedStatus, label: "All mine" },
	{ id: "owned", label: "Owned" },
	{ id: "wanted_to_buy", label: "Want to buy" },
	{ id: "given_away", label: "Gifted away" },
];

type INotePlacementDirection =
	| "up-right"
	| "up-left"
	| "down-right"
	| "down-left";

interface INotePlacement {
	direction: INotePlacementDirection;
	left: number;
	top: number;
}

export interface IPaperBooksSectionProps {
	variant?: "preview" | "page";
}

export const PaperBooksSection = ({
	variant = "preview",
}: IPaperBooksSectionProps) => {
	const router = useRouter();
	const session = useAuthStore((state) => state.session);
	const [page, setPage] = useState(1);
	const [activeStatus, setActiveStatus] =
		useState<IPaperBooksFilter>(combinedStatus);
	const [openNote, setOpenNote] = useState<{
		id: string;
		note: string;
	} | null>(null);
	const [notePlacement, setNotePlacement] = useState<INotePlacement | null>(
		null,
	);
	const noteAnchorRef = useRef<HTMLButtonElement | null>(null);
	const noteBubbleRef = useRef<HTMLDivElement | null>(null);
	const isSessionReady = Boolean(session);
	const [previewViewportRef, previewEmblaApi] = useEmblaCarousel({
		align: "start",
		containScroll: "trimSnaps",
		dragFree: false,
		loop: false,
	});
	const { data: counts } = usePaperBookStatusCountsQuery({
		enabled: isSessionReady,
	});
	const combinedCount = (counts?.owned ?? 0) + (counts?.given_away ?? 0);
	const resolvedLimit =
		variant === "page" && activeStatus === combinedStatus
			? Math.max(counts?.total ?? pageSize, pageSize)
			: variant === "page"
				? pageSize
				: previewSize;
	const resolvedStatus =
		activeStatus === combinedStatus ? undefined : activeStatus;
	const {
		data: paperBooksResponse,
		error,
		isError,
		isLoading,
	} = usePaperBooksQuery(
		{
			limit: resolvedLimit,
			page: variant === "page" && activeStatus !== combinedStatus ? page : 1,
			status: resolvedStatus,
		},
		{ enabled: isSessionReady },
	);
	const items = paperBooksResponse?.items ?? [];
	const visibleItems =
		activeStatus === combinedStatus
			? items.filter(
					(item) => item.status === "owned" || item.status === "given_away",
				)
			: items;
	const total = counts?.total ?? paperBooksResponse?.total ?? 0;
	const pages =
		activeStatus === combinedStatus && variant === "page"
			? Math.max(1, Math.ceil(visibleItems.length / pageSize))
			: (paperBooksResponse?.pages ?? 1);
	const currentStatusCount = useMemo(() => {
		if (activeStatus === combinedStatus) return combinedCount;
		return counts?.[activeStatus] ?? 0;
	}, [activeStatus, combinedCount, counts]);
	const previewItems =
		variant === "preview"
			? visibleItems.slice(0, previewSize)
			: visibleItems.slice((page - 1) * pageSize, page * pageSize);

	useEffect(() => {
		if (!session) {
			router.replace("/?auth=required");
		}
	}, [router, session]);

	const closeNote = useCallback(() => {
		setOpenNote(null);
		setNotePlacement(null);
		noteAnchorRef.current = null;
	}, []);

	const updateNotePlacement = useCallback(() => {
		const anchor = noteAnchorRef.current;

		if (!anchor) {
			return;
		}

		setNotePlacement(getNotePlacement(anchor.getBoundingClientRect()));
	}, []);

	const toggleNote = useCallback(
		(id: string, note: string, anchor: HTMLButtonElement) => {
			if (openNote?.id === id) {
				closeNote();
				return;
			}

			noteAnchorRef.current = anchor;
			setOpenNote({ id, note });
			setNotePlacement(getNotePlacement(anchor.getBoundingClientRect()));
		},
		[closeNote, openNote?.id],
	);

	useEffect(() => {
		if (!openNote) {
			return;
		}

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;

			if (!(target instanceof Node)) {
				return;
			}

			if (
				noteAnchorRef.current?.contains(target) ||
				noteBubbleRef.current?.contains(target)
			) {
				return;
			}

			closeNote();
		};

		const handleViewportChange = () => updateNotePlacement();

		document.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("resize", handleViewportChange);
		window.addEventListener("scroll", handleViewportChange, true);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("resize", handleViewportChange);
			window.removeEventListener("scroll", handleViewportChange, true);
		};
	}, [closeNote, openNote, updateNotePlacement]);

	if (!session) {
		return null;
	}

	return (
		<>
			<Panel $variant={variant}>
				<Header>
					<HeaderTop>
						<TitleGroup>
							<Title>
								{variant === "page" ? "My paper books" : "Paper books"}
							</Title>
							{variant === "preview" ? (
								<ViewAllLink href="/treasures/paper-books">
									<span>View all</span>
									<KeyboardArrowRightIcon aria-hidden="true" />
								</ViewAllLink>
							) : null}
						</TitleGroup>
						<CountBadge aria-label={`Paper books: ${total}`}>
							<CountValue>{total}</CountValue>
							<CountLabel>total</CountLabel>
						</CountBadge>
					</HeaderTop>
					{variant === "page" ? (
						<Lead>
							Owned copies, books you want to buy, and books you have given
							away. Notes open right from the card.
						</Lead>
					) : null}
				</Header>

				<FiltersRow>
					<ChipTabs
						activeId={activeStatus}
						ariaLabel="Paper books filters"
						items={statusTabs.map((status) => ({
							count:
								status.id === combinedStatus
									? combinedCount
									: (counts?.[status.id] ?? 0),
							id: status.id,
							label: status.label,
						}))}
						onChange={(id) => {
							setActiveStatus(id as IPaperBooksFilter);
							setPage(1);
							closeNote();
							previewEmblaApi?.scrollTo(0);
						}}
					/>
					<FilterMeta>{currentStatusCount} shown</FilterMeta>
				</FiltersRow>

				{isLoading ? (
					<StateMessage>Loading paper books...</StateMessage>
				) : isError ? (
					<StateMessage>
						Failed to load paper books:{" "}
						{error instanceof Error ? error.message : "request error"}
					</StateMessage>
				) : items.length === 0 ? (
					<EmptyState>
						<EmptyTitle>No paper books yet</EmptyTitle>
						<EmptyText>
							Add a paper status on a book page to see it here.
						</EmptyText>
					</EmptyState>
				) : variant === "preview" ? (
					<PreviewViewport ref={previewViewportRef}>
						<PreviewTrack>
							{previewItems.map((item) => (
								<PreviewSlide key={item.id}>
									<PaperBookCard
										item={item}
										onToggleNote={(event) => {
											event.stopPropagation();
											toggleNote(item.id, item.note ?? "", event.currentTarget);
										}}
										showStatusChip={activeStatus === combinedStatus}
										onOpen={() => router.push(`/books/${item.book.id}`)}
									/>
								</PreviewSlide>
							))}
						</PreviewTrack>
					</PreviewViewport>
				) : (
					<>
						<Grid>
							{previewItems.map((item) => (
								<PaperBookCard
									key={item.id}
									item={item}
									onToggleNote={(event) => {
										event.stopPropagation();
										toggleNote(item.id, item.note ?? "", event.currentTarget);
									}}
									showStatusChip={activeStatus === combinedStatus}
									onOpen={() => router.push(`/books/${item.book.id}`)}
								/>
							))}
						</Grid>
						{pages > 1 ? (
							<PaginationWrap>
								<AppPagination
									count={pages}
									page={page}
									onChange={(nextPage) => {
										setPage(nextPage);
										closeNote();
									}}
								/>
							</PaginationWrap>
						) : null}
					</>
				)}
			</Panel>
			{openNote && notePlacement
				? createPortal(
						<NoteBubble
							ref={noteBubbleRef}
							$direction={notePlacement.direction}
							$left={notePlacement.left}
							$top={notePlacement.top}
							role="dialog"
							onClick={(event) => event.stopPropagation()}
						>
							{openNote.note}
						</NoteBubble>,
						document.body,
					)
				: null}
		</>
	);
};

const PaperBookCard = ({
	item,
	onOpen,
	onToggleNote,
	showStatusChip,
}: {
	item: {
		book: { author: string; coverUrl?: string; id: string; title: string };
		note?: string | null;
		status: IPaperBookStatus;
		updatedAt: string;
	};
	onOpen: () => void;
	onToggleNote: (event: MouseEvent<HTMLButtonElement>) => void;
	showStatusChip: boolean;
}) => {
	const hasNote = Boolean(item.note?.trim());
	const [coverWidth, setCoverWidth] = useState<number | null>(null);
	const [isCoverLoaded, setIsCoverLoaded] = useState(false);
	const coverSrc = item.book.coverUrl?.trim()
		? item.book.coverUrl
		: "/images/book-placeholder.svg";

	const handleCoverLoad = (event: SyntheticEvent<HTMLImageElement>) => {
		const image = event.currentTarget;

		if (!image.naturalWidth || !image.naturalHeight) {
			return;
		}

		setCoverWidth(
			(image.naturalWidth / image.naturalHeight) * image.clientHeight,
		);
		setIsCoverLoaded(true);
	};

	return (
		<Card
			role="link"
			tabIndex={0}
			onClick={onOpen}
			onKeyDown={(event) => {
				if (event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				onOpen();
			}}
		>
			<CardTop $coverWidth={coverWidth}>
				<CardDate>{formatPaperBookDate(item.updatedAt)}</CardDate>
			</CardTop>
			<CoverFrame $coverWidth={coverWidth}>
				<CoverShell>
					{isCoverLoaded ? null : <CoverPlaceholder aria-hidden="true" />}
					<Cover
						alt={item.book.title}
						src={coverSrc}
						decoding="async"
						loading="lazy"
						onLoad={handleCoverLoad}
					/>
					{hasNote ? (
						<NoteBadge
							aria-label="Open paper note"
							type="button"
							onClick={onToggleNote}
						>
							<EditNoteOutlinedIcon aria-hidden="true" />
						</NoteBadge>
					) : null}
				</CoverShell>
			</CoverFrame>
			<Meta $coverWidth={coverWidth}>
				<CardTitle>{item.book.title}</CardTitle>
				<CardAuthor>{item.book.author}</CardAuthor>
				{showStatusChip ? (
					<StatusChip $status={item.status}>
						{statusLabels[item.status]}
					</StatusChip>
				) : null}
			</Meta>
		</Card>
	);
};

const statusLabels: Record<IPaperBookStatus, string> = {
	given_away: "Given away",
	owned: "Owned",
	wanted_to_buy: "Want to buy",
};

const formatPaperBookDate = (value: string) =>
	new Intl.DateTimeFormat("en-US", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(new Date(value));

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

const getNotePlacement = (anchorRect: DOMRect): INotePlacement => {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const margin = 8;
	const bubbleWidth = Math.min(
		noteBubbleEstimate.width,
		Math.max(0, viewportWidth - margin * 2),
	);
	const bubbleHeight = Math.min(
		noteBubbleEstimate.height,
		Math.max(0, viewportHeight - margin * 2),
	);
	const roomRight = viewportWidth - anchorRect.right;
	const roomLeft = anchorRect.left;
	const roomTop = anchorRect.top;
	const roomBottom = viewportHeight - anchorRect.bottom;

	const chooseDirection = (): INotePlacementDirection => {
		if (
			roomRight >= bubbleWidth + noteBubbleGap &&
			roomTop >= bubbleHeight + noteBubbleGap
		) {
			return "up-right";
		}

		if (
			roomLeft >= bubbleWidth + noteBubbleGap &&
			roomTop >= bubbleHeight + noteBubbleGap
		) {
			return "up-left";
		}

		if (
			roomRight >= bubbleWidth + noteBubbleGap &&
			roomBottom >= bubbleHeight + noteBubbleGap
		) {
			return "down-right";
		}

		if (
			roomLeft >= bubbleWidth + noteBubbleGap &&
			roomBottom >= bubbleHeight + noteBubbleGap
		) {
			return "down-left";
		}

		if (roomRight >= roomLeft) {
			return roomTop >= roomBottom ? "up-right" : "down-right";
		}

		return roomTop >= roomBottom ? "up-left" : "down-left";
	};

	const direction = chooseDirection();

	const rawPosition = (() => {
		switch (direction) {
			case "up-right":
				return {
					left: anchorRect.right + noteBubbleGap,
					top: anchorRect.top - noteBubbleGap - bubbleHeight,
				};
			case "up-left":
				return {
					left: anchorRect.left - noteBubbleGap - bubbleWidth,
					top: anchorRect.top - noteBubbleGap - bubbleHeight,
				};
			case "down-right":
				return {
					left: anchorRect.right + noteBubbleGap,
					top: anchorRect.bottom + noteBubbleGap,
				};
			case "down-left":
				return {
					left: anchorRect.left - noteBubbleGap - bubbleWidth,
					top: anchorRect.bottom + noteBubbleGap,
				};
		}
	})();

	return {
		direction,
		left: clamp(rawPosition.left, margin, viewportWidth - bubbleWidth - margin),
		top: clamp(rawPosition.top, margin, viewportHeight - bubbleHeight - margin),
	};
};

const Panel = styled.section<{ $variant: "preview" | "page" }>`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	${({ $variant }) =>
		$variant === "preview"
			? `
				padding: 0;
			`
			: `
				width: min(76rem, calc(100% - 3rem));
				margin: 0 auto;
			`}
`;

const Header = styled.header`
	display: flex;
	flex-direction: column;
	gap: 0.55rem;
`;

const HeaderTop = styled.div`
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 1rem;
`;

const TitleGroup = styled.div`
	display: flex;
	align-items: baseline;
	gap: 0.85rem;
	min-width: 0;
`;

const Title = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.5rem;
	font-weight: 600;
	line-height: 1.1;
`;

const Lead = styled.p`
	max-width: 42rem;
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.45;
`;

const ViewAllLink = styled(Link)`
	display: inline-flex;
	align-items: center;
	gap: 0.12rem;
	color: ${theme.colors.orangeDark};
	font-size: 1rem;
	font-weight: 600;
	text-decoration: none;

	span::after {
		content: "";
		display: block;
		height: 0.0625rem;
		background: currentColor;
		opacity: 0;
		transform: translateY(0.1rem);
		transition:
			opacity 160ms ease,
			transform 160ms ease;
	}

	&:hover span::after,
	&:focus-visible span::after {
		opacity: 1;
		transform: translateY(0);
	}
`;

const CountBadge = styled.span`
	display: inline-flex;
	align-items: baseline;
	gap: 0.3rem;
	border: 0.0625rem solid rgb(218 142 91 / 0.22);
	border-radius: 62.4375rem;
	background: rgb(242 239 237 / 0.72);
	padding: 0.4rem 0.75rem;
	white-space: nowrap;
`;

const CountValue = styled.span`
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.serif};
	font-size: 1.15rem;
	font-weight: 600;
	line-height: 1;
`;

const CountLabel = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.8rem;
	line-height: 1;
`;

const FiltersRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;

	@media (max-width: ${theme.rubberSize.tablet}) {
		align-items: flex-start;
		flex-direction: column;
	}
`;

const FilterMeta = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.82rem;
	white-space: nowrap;
`;

const PreviewViewport = styled.div`
	overflow: hidden;
`;

const PreviewTrack = styled.div`
	display: flex;
	align-items: stretch;
	touch-action: pan-y pinch-zoom;
`;

const PreviewSlide = styled.div`
	flex: 0 0 auto;

	@media (max-width: ${theme.rubberSize.tablet}) {
		flex-basis: min(13.5rem, 74vw);
		padding-right: 0.65rem;
	}
`;

const Grid = styled.div`
	display: grid;
	gap: 0.85rem;
	grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	align-items: start;

	@media (max-width: ${theme.rubberSize.tablet}) {
		grid-template-columns: repeat(auto-fill, minmax(11.75rem, 1fr));
	}
`;

const PaginationWrap = styled.div`
	margin-top: 1rem;
`;

const StateMessage = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 0.98rem;
	line-height: 1.5;
`;

const EmptyState = styled.div`
	border: 0.0625rem dashed ${theme.colors.border};
	border-radius: 1rem;
	background: rgb(255 255 255 / 0.56);
	padding: 1.25rem;
`;

const EmptyTitle = styled.h3`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.3rem;
	line-height: 1.15;
`;

const EmptyText = styled.p`
	margin: 0.45rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 0.92rem;
	line-height: 1.45;
`;

const Card = styled.article`
	position: relative;
	display: flex;
	width: fit-content;
	flex-direction: column;
	align-items: center;
	height: fit-content;
	min-width: 0;
	border-radius: 1rem;

	padding: 0.75rem 0.75rem 0.8rem;
	cursor: pointer;
	overflow: visible;

	&:focus-visible {
		outline: 0.18rem solid ${theme.colors.orangeDark};
		outline-offset: 0.18rem;
	}
`;

const CardTop = styled.div<{ $coverWidth: number | null }>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: ${({ $coverWidth }) => ($coverWidth ? `${$coverWidth}px` : "7.65rem")};
	min-height: 1.25rem;
	margin-bottom: 0.45rem;
	padding-inline: 1.8rem;
`;

const CardDate = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.72rem;
	line-height: 1;
	text-align: center;
`;

const CoverFrame = styled.div<{ $coverWidth: number | null }>`
	display: flex;
	justify-content: center;
	width: ${({ $coverWidth }) => ($coverWidth ? `${$coverWidth}px` : "7.65rem")};
	padding-bottom: 0.65rem;
`;

const CoverShell = styled.div`
	position: relative;
	display: flex;
	width: fit-content;
	height: 9.3rem;
	max-width: 100%;
	align-items: stretch;
	justify-content: stretch;
`;

const Cover = styled.img`
	position: relative;
	width: auto;
	height: 9.3rem;
	border-radius: 0.85rem;
	object-fit: contain;
	background: rgb(242 239 237 / 0.56);
`;

const Meta = styled.div<{ $coverWidth: number | null }>`
	display: grid;
	width: ${({ $coverWidth }) => ($coverWidth ? `${$coverWidth}px` : "7.65rem")};
	min-width: 0;
	justify-items: center;
	padding-inline: 0.1rem;
	text-align: center;
`;

const CardTitle = styled.h3`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 0.9rem;
	font-weight: 500;
	line-height: 1.1;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	overflow-wrap: anywhere;
	text-align: center;
`;

const CardAuthor = styled.p`
	margin: 0.3rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 0.84rem;
	line-height: 1.3;
	text-align: center;
`;

const statusColorMap: Record<IPaperBookStatus, string> = {
	owned: "rgb(60 121 71 / 0.15)",
	wanted_to_buy: "rgb(218 142 91 / 0.16)",
	given_away: "rgb(84 110 122 / 0.16)",
};

const StatusChip = styled.span<{ $status: IPaperBookStatus }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-top: 0.35rem;
	border-radius: 999px;
	background: ${({ $status }) => statusColorMap[$status]};
	padding: 0.32rem 0.52rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.72rem;
	font-weight: 700;
	line-height: 1;
	white-space: nowrap;
`;

const NoteBadge = styled.button`
	position: absolute;
	top: -0.75rem;
	right: -0.75rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.8rem;
	height: 1.8rem;
	border: 0;
	border-radius: 999px 999px 999px 0;
	background: ${theme.colors.orangeLight};
	color: ${theme.colors.invertedText};
	cursor: pointer;
	box-shadow: 0 0.45rem 0.9rem rgb(4 18 26 / 0.16);
	font-size: 0.88rem;
	line-height: 1;

	svg {
		width: 1.2rem;
		height: 1.2rem;
	}

	&:focus-visible {
		background: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const NoteBubble = styled.div<{
	$direction: INotePlacementDirection;
	$left: number;
	$top: number;
}>`
	position: fixed;
	left: ${({ $left }) => $left}px;
	top: ${({ $top }) => $top}px;
	z-index: 2;
	width: min(14rem, calc(100vw - 1rem));
	max-height: min(12rem, calc(100vh - 1rem));
	overflow: auto;
	border: 0.0625rem solid rgb(218 142 91 / 0.34);
	border-radius: 0.75rem;
	background: rgb(242 239 237 / 0.98);
	padding: 0.6rem 0.7rem;
	color: ${theme.colors.foreground};
	font-size: 0.82rem;
	line-height: 1.45;
	box-shadow: 0 0.9rem 1.8rem rgb(4 18 26 / 0.14);
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	${({ $direction }) =>
		$direction === "up-right"
			? `
				transform-origin: left bottom;
			`
			: $direction === "up-left"
				? `
				transform-origin: right bottom;
			`
				: $direction === "down-right"
					? `
				transform-origin: left top;
			`
					: `
				transform-origin: right top;
			`}

	&::before {
		content: "";
		position: absolute;
		width: 0.72rem;
		height: 0.72rem;
		border: 0.0625rem solid rgb(218 142 91 / 0.34);
		background: rgb(242 239 237 / 0.98);
		transform: rotate(45deg);
	}

	${({ $direction }) =>
		$direction === "up-right"
			? `
				&::before {
					left: 1rem;
					bottom: -0.36rem;
					border-left: 0;
					border-top: 0;
				}
			`
			: $direction === "up-left"
				? `
				&::before {
					right: 1rem;
					bottom: -0.36rem;
					border-right: 0;
					border-top: 0;
				}
			`
				: $direction === "down-right"
					? `
				&::before {
					left: 1rem;
					top: -0.36rem;
					border-right: 0;
					border-bottom: 0;
				}
			`
					: `
				&::before {
					right: 1rem;
					top: -0.36rem;
					border-left: 0;
					border-bottom: 0;
				}
			`}
`;
