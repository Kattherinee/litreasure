import type { ISearchCollection } from "@/shared/api/search";

import {
	CollectionMark,
	ResultArrow,
	ResultDescription,
	ResultLinkCard,
	ResultMeta,
	ResultSeries,
	ResultTitle,
} from "./SearchResultCard.styles";
import {
	getBooksCountLabel,
	getEntitySupplementalMatch,
	HighlightedText,
	SearchMatchBadge,
} from "./SearchResultCard.utils";

interface ICollectionResultCardProps {
	closeSearch: () => void;
	collection: ISearchCollection;
	query: string;
	saveRecentSearch: () => void;
}

export const CollectionResultCard = ({
	closeSearch,
	collection,
	query,
	saveRecentSearch,
}: ICollectionResultCardProps) => (
	<ResultLinkCard
		href={`/collections/${collection.id}`}
		onClick={() => {
			saveRecentSearch();
			closeSearch();
		}}
	>
		<CollectionMark />
		<ResultMeta>
			<ResultTitle>
				<HighlightedText query={query} text={collection.title} />
			</ResultTitle>
			{collection.description ? (
				<ResultDescription>
					<HighlightedText query={query} text={collection.description} />
				</ResultDescription>
			) : null}
			<ResultSeries>
				{getBooksCountLabel(collection.bookCount ?? 0)}
			</ResultSeries>
			<SearchMatchBadge
				match={getEntitySupplementalMatch(collection.searchMatches, query, [
					"collection",
					"collections",
					"title",
					"description",
				])}
				query={query}
			/>
		</ResultMeta>
		<ResultArrow aria-hidden="true" />
	</ResultLinkCard>
);
