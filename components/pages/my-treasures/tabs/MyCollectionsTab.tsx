"use client";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import styled from "styled-components";

import { theme } from "@/shared/theme";
import { ResultSeries } from "@/shared/ui/BookSearch/SearchResultCard.styles";
import { ChipTabs } from "@/shared/ui/ChipTabs";
import {
	HeaderActionButton,
	NextIcon,
	PrevIcon,
	RailControlButton,
	RailControls,
	ViewAllLink,
} from "@/components/pages/my-treasures/ui";
import type { ICollectionTreasureFilter } from "../types";

const collectionFilterTabs: Array<{ id: ICollectionTreasureFilter; label: string }> = [
	{ id: "all", label: "All" },
	{ id: "created", label: "Created" },
	{ id: "subscribed", label: "Subscribed" },
];

interface IMyCollectionsTabProps {
	activeCollectionFilter: ICollectionTreasureFilter;
	collectionRailControls: {
		canScrollNext: boolean;
		canScrollPrev: boolean;
		hasOverflow: boolean;
	};
	collectionsRailRef: { current: HTMLDivElement | null };
	isCollectionsLoading: boolean;
	visibleCollections: Array<{ bookCount: number; coverUrl?: string; id: string; title: string }>;
	visibleCollectionsTotal: number;
	onChangeCollectionFilter: (filter: ICollectionTreasureFilter) => void;
	onCreateCollection: () => void;
	onOpenCollection: (id: string) => void;
	onScrollCollections: (direction: "next" | "prev") => void;
}

export const MyCollectionsTab = ({
	activeCollectionFilter,
	collectionRailControls,
	collectionsRailRef,
	isCollectionsLoading,
	visibleCollections,
	visibleCollectionsTotal,
	onChangeCollectionFilter,
	onCreateCollection,
	onOpenCollection,
	onScrollCollections,
}: IMyCollectionsTabProps) => (
	<Panel>
		<Header>
			<Row>
				<Title>My Collections</Title>
				<ViewAllLink href="/collections/_username">
					<span>View all</span>
					<KeyboardArrowRightIcon aria-hidden="true" />
				</ViewAllLink>
			</Row>
			<HeaderActionButton type="button" onClick={onCreateCollection}>
				Create
			</HeaderActionButton>
		</Header>
		<FilterRow>
			<ChipTabs
				activeId={activeCollectionFilter}
				ariaLabel="Collection filters"
				items={collectionFilterTabs}
				onChange={(id) => onChangeCollectionFilter(id as ICollectionTreasureFilter)}
			/>
			<RightMeta>
				<Total>
					<TotalLabel>Total</TotalLabel>
					<TotalValue>{visibleCollectionsTotal}</TotalValue>
				</Total>
				{collectionRailControls.hasOverflow ? (
					<RailControls aria-label="Collection carousel controls">
						<RailControlButton
							aria-label="Previous collections"
							disabled={!collectionRailControls.canScrollPrev}
							type="button"
							onClick={() => onScrollCollections("prev")}
						>
							<PrevIcon aria-hidden="true" />
						</RailControlButton>
						<RailControlButton
							aria-label="Next collections"
							disabled={!collectionRailControls.canScrollNext}
							type="button"
							onClick={() => onScrollCollections("next")}
						>
							<NextIcon aria-hidden="true" />
						</RailControlButton>
					</RailControls>
				) : null}
			</RightMeta>
		</FilterRow>
		{isCollectionsLoading ? (
			<Text>Loading your collections...</Text>
		) : visibleCollections.length > 0 ? (
			<Rail ref={collectionsRailRef}>
				{visibleCollections.map((collection) => (
					<Chip
						key={collection.id}
						role="link"
						tabIndex={0}
						onClick={() => onOpenCollection(collection.id)}
						onKeyDown={(event) => {
							if (event.key !== "Enter" && event.key !== " ") return;
							event.preventDefault();
							onOpenCollection(collection.id);
						}}
					>
						<Cover $coverUrl={collection.coverUrl} />
						<Meta>
							<Name>{collection.title}</Name>
							<BookCount>{collection.bookCount} books</BookCount>
						</Meta>
					</Chip>
				))}
			</Rail>
		) : (
			<Text>
				Create your first collection for favorite books, moods, and future shelves.
			</Text>
		)}
	</Panel>
);

const Panel = styled.div``;
const Header = styled.div`display:flex;justify-content:space-between;gap:1rem;margin-bottom:.75rem;`;
const Row = styled.div`display:flex;align-items:center;gap:.85rem;`;
const Title = styled.h2`margin:0;color:${theme.colors.foreground};font-family:${theme.fonts.serif};font-size:1.35rem;`;
const FilterRow = styled.div`display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem;`;
const RightMeta = styled.div`display:flex;align-items:center;gap:.85rem;`;
const Total = styled.span`display:inline-flex;align-items:baseline;gap:.3rem;`;
const TotalLabel = styled.span`color:${theme.colors.softForeground};font-size:.78rem;text-transform:uppercase;letter-spacing:.03em;`;
const TotalValue = styled.span`color:${theme.colors.orangeDark};font-family:${theme.fonts.serif};font-size:1.25rem;font-weight:600;line-height:1;`;
const Rail = styled.div`
	display:flex;
	gap:.75rem;
	overflow-x:auto;
	padding:.1rem 0 .25rem;
	scrollbar-width: none;
	-ms-overflow-style: none;
	&::-webkit-scrollbar { display: none; }
`;
const Chip = styled.article`display:grid;min-width:15rem;grid-template-columns:4.25rem minmax(0,1fr);gap:.75rem;align-items:center;border:.0625rem solid rgb(211 202 196 / .72);border-radius:.75rem;background:rgb(255 255 255 /.64);padding:.55rem;cursor:pointer;`;
const Cover = styled.div<{ $coverUrl?: string }>`width:4.25rem;aspect-ratio:1/1;border-radius:.6rem;background:linear-gradient(rgb(4 18 26 / .08), rgb(4 18 26 / .08)),url("${({ $coverUrl }) => $coverUrl || "/images/book-placeholder.svg"}") center / cover;`;
const Meta = styled.div`min-width:0;overflow:hidden;`;
const Name = styled.h3`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.05rem;
	font-weight: 600;
	line-height: 1.12;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	word-break: break-word;
`;
const BookCount = styled(ResultSeries)`margin-top:.3rem;`;
const Text = styled.p`margin:0;color:${theme.colors.softForeground};font-size:.95rem;line-height:1.45;`;
