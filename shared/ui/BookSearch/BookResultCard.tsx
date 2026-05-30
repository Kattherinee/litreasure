import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

import type { ISearchBook } from "@/shared/api/search";
import {
	type IUserBookStatus,
	useUpdateBookTrackingMutation,
} from "@/shared/api/user-books";
import { BookLibraryAction } from "@/shared/ui/BookLibraryAction";

import {
	ResultAuthor,
	ResultCover,
	ResultCoverLink,
	ResultItem,
	ResultLink,
	ResultMain,
	ResultMeta,
	ResultDescription,
	ResultSeries,
	ResultTitle,
} from "./SearchResultCard.styles";
import {
	getSupplementalSearchMatch,
	HighlightedText,
	lineHasMatch,
	SearchMatchBadge,
} from "./SearchResultCard.utils";

interface IBookResultCardProps {
	book: ISearchBook;
	closeSearch: () => void;
	query: string;
	saveRecentSearch: () => void;
}

export const BookResultCard = ({
	book,
	closeSearch,
	query,
	saveRecentSearch,
}: IBookResultCardProps) => {
	const updateTrackingMutation = useUpdateBookTrackingMutation();
	const [isSaved, setIsSaved] = useState<IUserBookStatus | null>(null);
	const seriesLine = book.seriesTitle
		? `${book.orderInSeries}/${book.bookCountInSeries} of  ${book.seriesTitle}`
		: null;
	const titleMatches = lineHasMatch(book.title, book.searchMatches, query, [
		"book",
		"title",
	]);
	const authorMatches = lineHasMatch(book.author, book.searchMatches, query, [
		"author",
		"authors",
	]);
	const seriesMatches = seriesLine
		? lineHasMatch(seriesLine, book.searchMatches, query, [
				"series",
				"seriesTitle",
			])
		: false;
	const supplementalMatch = getSupplementalSearchMatch(
		book.searchMatches,
		query,
		{
			author: authorMatches,
			series: seriesMatches,
			title: titleMatches,
		},
	);
	const handleOpenResult = () => {
		saveRecentSearch();
		closeSearch();
	};
	const handleSaveBook = async (status: IUserBookStatus) => {
		if (updateTrackingMutation.isPending) return;

		try {
			await updateTrackingMutation.mutateAsync({
				bookId: book.id,
				payload: {
					isRereading: status === "rereading",
					readCount: 0,
					status,
				},
			});
			setIsSaved(status);
		} catch {
			setIsSaved(null);
		}
	};

	return (
		<ResultItem>
			<ResultMain>
				<ResultCoverLink href={`/books/${book.id}`} onClick={handleOpenResult}>
					<ResultCover
						alt=""
						src={book.coverUrl ?? "/images/book-placeholder.svg"}
					/>
				</ResultCoverLink>
				<ResultMeta>
					<ResultLink href={`/books/${book.id}`} onClick={handleOpenResult}>
						{seriesLine ? (
							<ResultSeries>
								<HighlightedText query={query} text={seriesLine} />
							</ResultSeries>
						) : null}
						<ResultTitle>
							<HighlightedText query={query} text={book.title} />
						</ResultTitle>
					</ResultLink>
					{book.description ? (
						<ResultDescription>
							<HighlightedText query={query} text={book.description} />
						</ResultDescription>
					) : null}
					<ResultAuthor>
						<StyledResultLink
							href={`/authors/${book.authorId}`}
							onClick={handleOpenResult}
						>
							<HighlightedText query={query} text={book.author} />
						</StyledResultLink>
					</ResultAuthor>
					<SearchMatchBadge match={supplementalMatch} query={query} />
				</ResultMeta>
			</ResultMain>
			<BookLibraryAction
				currentStatus={isSaved}
				disabled={updateTrackingMutation.isPending}
				size="small"
				onSaveStatus={handleSaveBook}
			/>
		</ResultItem>
	);
};
export const StyledResultLink = styled(Link)`
	text-decoration: none;
	color: inherit;

	&:hover {
		color: inherit;
	}
`;
