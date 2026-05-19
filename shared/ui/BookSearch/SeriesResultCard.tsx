import type { ISearchSeries } from "@/shared/api/search";

import {
	ResultArrow,
	ResultAuthor,
	ResultEntityCard,
	ResultMeta,
	ResultSeries,
	ResultTitle,
	SeriesStack,
	SeriesStackCover,
	WantButton,
} from "./SearchResultCard.styles";
import {
	getBooksCountLabel,
	getEntitySupplementalMatch,
	getSeriesAuthorLine,
	getSeriesCoverUrl,
	HighlightedText,
	SearchMatchBadge,
} from "./SearchResultCard.utils";
import { StyledResultLink } from "./BookResultCard";

interface ISeriesResultCardProps {
	closeSearch?: () => void;
	query: string;
	saveRecentSearch: () => void;
	series: ISearchSeries;
}

export const SeriesResultCard = ({
	closeSearch,
	query,
	saveRecentSearch,
	series,
}: ISeriesResultCardProps) => {
	const coverUrl = getSeriesCoverUrl(series);
	const authorLine = getSeriesAuthorLine(series);

	const handleOpenResult = () => {
		saveRecentSearch();
		if (closeSearch) {
			closeSearch();
		}
	};

	return (
		<ResultEntityCard>
			<SeriesStack>
				{Array.from({ length: 3 }, (_, index) => (
					<SeriesStackCover
						key={index}
						$index={index}
						alt=""
						src={coverUrl ?? "/images/book-placeholder.svg"}
					/>
				))}
			</SeriesStack>
			<ResultMeta>
				<ResultTitle>
					<HighlightedText query={query} text={series.title} />
				</ResultTitle>
				{authorLine ? (
					<ResultAuthor>
						<StyledResultLink
							href={`/authors/${series.authorId}`}
							onClick={handleOpenResult}
						>
							<HighlightedText query={query} text={authorLine} />
						</StyledResultLink>
					</ResultAuthor>
				) : null}
				<ResultSeries>{getBooksCountLabel(series.bookCount ?? 0)}</ResultSeries>
				<SearchMatchBadge
					match={getEntitySupplementalMatch(series.searchMatches, query, [
						"series",
						"seriesTitle",
						"title",
						"author",
					])}
					query={query}
				/>
			</ResultMeta>
			<WantButton buttonType="oxygenPill" type="button">
				Add to library
			</WantButton>
			<ResultArrow aria-hidden="true" />
		</ResultEntityCard>
	);
};
