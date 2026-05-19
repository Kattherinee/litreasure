export interface ISearchMatch {
	field: string;
	value: string;
}

export interface ISearchBook {
	id: string;
	title: string;
	author: string;
	bookCountInSeries?: number;
	coverUrl?: string;
	orderInSeries?: number;
	searchMatches?: ISearchMatch[];
	seriesTitle?: string;
	authorId?: string;
}

export interface ISearchAuthor {
	id: string;
	bookCount?: number;
	name: string;
	photoUrl?: string;
	searchMatches?: ISearchMatch[];
}

export interface ISearchSeries {
	id: string;
	authorName?: string;
	authorPhotoUrl?: string;
	bookCount?: number;
	coverUrl?: string;
	openLibrarySeriesKey?: string;
	searchMatches?: ISearchMatch[];
	authorId?: string;
	title: string;
}

export interface ISearchGenre {
	id: string;
	name: string;
	searchMatches?: ISearchMatch[];
	slug: string;
}

export interface ISearchCollection {
	id: string;
	bookCount?: number;
	description?: string;
	ownerAvatarUrl?: string;
	ownerName?: string;
	searchMatches?: ISearchMatch[];
	title: string;
}

export type ISearchResultType =
	| "author"
	| "book"
	| "collection"
	| "genre"
	| "series";

export interface ISearchTabResponse<T> {
	items: T[];
	limit: number;
	page: number;
	total: number;
}

export interface ISearchAllResponse {
	authors: ISearchAuthor[];
	authorsTotal?: number;
	books: ISearchBook[];
	booksTotal?: number;
	collections: ISearchCollection[];
	collectionsTotal?: number;
	genres: ISearchGenre[];
	genresTotal?: number;
	limit: number;
	page: number;
	series: ISearchSeries[];
	seriesTotal?: number;
	total: number;
}
