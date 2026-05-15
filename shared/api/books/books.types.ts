export type Book = {
	id: string;
	title: string;
	author: string;
	description?: string;
	coverUrl?: string;
	pagesCount?: number;
	genres: string[];
	setting: string[];
	publishedYear?: number;
	firstPublishDate?: string;
	publisher?: string;
	rating?: number;
	ratingAvg?: number;
	ratingsCount?: number;
	ratingsByStars: number[];
	language?: string;
	openLibraryWorkKey?: string;
	orderInSeries?: number;
	relationType?: BookSeriesRelationType;
	searchMatches?: BookSearchMatch[];
	seriesLabel?: string;
	seriesRelationType?: BookSeriesRelationType;
	seriesTitle?: string;
	authors: string[];
	series?: {
		id?: string;
		title?: string;
		openLibrarySeriesKey?: string;
		seriesId: string;
		orderInSeries?: number;
		relationType?: BookSeriesRelationType;
		seriesLabel?: string;
		books?: Array<{
			id: string;
			title: string;
			author?: string;
			coverUrl?: string;
			orderInSeries?: number;
			relationType?: BookSeriesRelationType;
			seriesLabel?: string;
		}>;
	};
	createdAt: string;
	updatedAt: string;
};

export type BookSearchMatch = {
	field: string;
	value: string;
};

export type BookSeriesRelationType =
	| "collection"
	| "main"
	| "omnibus"
	| "spin_off"
	| "unknown";

export type CreateBookPayload = {
	title: string;
	author: string;
	description?: string;
	coverUrl?: string;
	genres: string[];
	publishedYear?: number;
	rating?: number;
};

export type UpdateBookPayload = Partial<CreateBookPayload>;

export type BookSort = "newest" | "popular" | "rating";

export type BookSearchScope =
	| "authors"
	| "books"
	| "collections"
	| "genres"
	| "publishers"
	| "series";

export interface IBookCardsParams {
	limit?: number;
	genre?: string;
	search?: string;
	searchScope?: BookSearchScope;
	sort?: BookSort;
}
