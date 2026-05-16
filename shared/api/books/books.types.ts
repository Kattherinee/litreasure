import { IGenre } from "../genres";

export interface IBook {
	id: string;
	title: string;
	author: string;
	authors?: IAuthorShort[];
	description?: string;
	coverUrl?: string;
	isbns?: string[];
	pagesCount?: number;
	genres: IGenre[];
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

export interface IAuthorShort {
	id: string;
	name: string;
	photoUrl?: string;
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
	genre?: string;
	limit?: number;
	page?: number;
	search?: string;
	searchScope?: IBookSearchScope;
	sort?: IBookSort;
}

export interface IBookCardsResponse {
	items: IBook[];
	limit: number;
	page: number;
	pages: number;
	total: number;
}
