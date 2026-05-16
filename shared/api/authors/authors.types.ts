import type { IGenre } from "../genres";

export interface IAuthorBookCard {
	id: string;
	title: string;
	coverUrl?: string;
	publishedYear?: number;
	orderInSeries?: number;
	seriesRelationType?: "collection" | "main" | "omnibus" | "spin_off" | "unknown";
	seriesLabel?: string;
}

export interface IAuthorSeries {
	id: string;
	title: string;
	openLibrarySeriesKey?: string;
	books: IAuthorBookCard[];
}

export interface IAuthorPreview {
	id: string;
	name: string;
	bio?: string;
	photoUrl?: string;
	isPublic: boolean;
	bookCount: number;
	mainGenre?: IGenre;
}

export interface IAuthorDetails extends IAuthorPreview {
	books: IAuthorBookCard[];
	series: IAuthorSeries[];
}

export interface IAuthorsListParams {
	limit?: number;
	page?: number;
}

export interface IAuthorsListResponse {
	items: IAuthorPreview[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}

export interface ICreateAuthorPayload {
	name: string;
	bio?: string;
	photoUrl?: string;
}

export type IUpdateAuthorPayload = Partial<ICreateAuthorPayload>;
