import type { ISearchAuthor } from "@/shared/api/search";

import {
	ResultArrow,
	ResultLinkCard,
	ResultMeta,
	ResultSeries,
	ResultTitle,
	RoundImage,
} from "./SearchResultCard.styles";
import {
	getBooksCountLabel,
	getEntitySupplementalMatch,
	HighlightedText,
	SearchMatchBadge,
} from "./SearchResultCard.utils";

interface IAuthorResultCardProps {
	author: ISearchAuthor;
	closeSearch: () => void;
	query: string;
	saveRecentSearch: () => void;
}

export const AuthorResultCard = ({
	author,
	closeSearch,
	query,
	saveRecentSearch,
}: IAuthorResultCardProps) => (
	<ResultLinkCard
		href={`/authors/${author.id}`}
		onClick={() => {
			saveRecentSearch();
			closeSearch();
		}}
	>
		<RoundImage $photoUrl={author.photoUrl ?? "/favicon.ico"} />
		<ResultMeta>
			<ResultTitle>
				<HighlightedText query={query} text={author.name} />
			</ResultTitle>
			<ResultSeries>{getBooksCountLabel(author.bookCount ?? 0)}</ResultSeries>
			<SearchMatchBadge
				match={getEntitySupplementalMatch(author.searchMatches, query, [
					"author",
					"authors",
					"name",
				])}
				query={query}
			/>
		</ResultMeta>
		<ResultArrow aria-hidden="true" />
	</ResultLinkCard>
);
