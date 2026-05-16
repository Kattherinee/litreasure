export interface IBook {
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
	relationType?: IBookSeriesRelationType;
	searchMatches?: IBookSearchMatch[];
	seriesLabel?: string;
	seriesRelationType?: IBookSeriesRelationType;
	seriesTitle?: string;
	authors: string[];
	series?: {
		id?: string;
		title?: string;
		openLibrarySeriesKey?: string;
		seriesId: string;
		orderInSeries?: number;
		relationType?: IBookSeriesRelationType;
		seriesLabel?: string;
		books?: Array<{
			id: string;
			title: string;
			author?: string;
			coverUrl?: string;
			orderInSeries?: number;
			relationType?: IBookSeriesRelationType;
			seriesLabel?: string;
		}>;
	};
	createdAt: string;
	updatedAt: string;
}

export interface IBookSearchMatch {
	field: string;
	value: string;
}

export type IBookSeriesRelationType =
	| "collection"
	| "main"
	| "omnibus"
	| "spin_off"
	| "unknown";

export interface ICreateBookPayload {
	title: string;
	author: string;
	description?: string;
	coverUrl?: string;
	genres: string[];
	publishedYear?: number;
	rating?: number;
}

export type IUpdateBookPayload = Partial<ICreateBookPayload>;

export type IBookSort = "newest" | "popular" | "rating";

export type IBookSearchScope =
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
	searchScope?: IBookSearchScope;
	sort?: IBookSort;
}
