import type { ISearchGenre } from "@/shared/api/search";

import {
	GenreMark,
	ResultArrow,
	ResultLinkCard,
	ResultMeta,
	ResultTitle,
} from "./SearchResultCard.styles";
import {
	getEntitySupplementalMatch,
	HighlightedText,
	SearchMatchBadge,
} from "./SearchResultCard.utils";

interface IGenreResultCardProps {
	closeSearch: () => void;
	genre: ISearchGenre;
	query: string;
	saveRecentSearch: () => void;
}

export const GenreResultCard = ({
	closeSearch,
	genre,
	query,
	saveRecentSearch,
}: IGenreResultCardProps) => (
	<ResultLinkCard
		href={`/genres/${genre.slug}`}
		onClick={() => {
			saveRecentSearch();
			closeSearch();
		}}
	>
		<GenreMark>#</GenreMark>
		<ResultMeta>
			<ResultTitle>
				<HighlightedText query={query} text={genre.name} />
			</ResultTitle>
			<SearchMatchBadge
				match={getEntitySupplementalMatch(genre.searchMatches, query, [
					"genre",
					"genres",
					"name",
				])}
				query={query}
			/>
		</ResultMeta>
		<ResultArrow aria-hidden="true" />
	</ResultLinkCard>
);
