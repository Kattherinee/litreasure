import type { IGenre } from "../genres/genres.types";

export interface ICollectionBookCard {
	id: string;
	title: string;
	author: string;
	coverUrl?: string;
	seriesTitle?: string;
	orderInSeries?: number;
}

export interface ICollectionOwner {
	id: string;
	name: string;
	username?: string;
	avatarUrl?: string;
}

export type ICollectionSource = "open_library" | "user";

export interface ICollectionPreview {
	id: string;
	title: string;
	description: string;
	isPublic: boolean;
	topGenres: IGenre[];
	owner: ICollectionOwner;
	bookCount: number;
	previewBooks: ICollectionBookCard[];
	source: ICollectionSource;
	sourceUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ICollectionsListParams {
	page?: number;
	limit?: number;
}

export interface ICollectionsListResponse {
	items: ICollectionPreview[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}

export interface ICollectionDetails extends ICollectionPreview {
	books: ICollectionBookCard[];
}

export interface ICreateCollectionPayload {
	title: string;
	description?: string;
	isPublic?: boolean;
	bookIds?: string[];
}

export type IUpdateCollectionPayload = Partial<ICreateCollectionPayload>;
