import { requestAuth, requestOptionalAuth } from "../base";

export interface ISeriesPreview {
	id: string;
	title: string;
	openLibrarySeriesKey?: string;
	description?: string;
	coverUrl?: string;
	bookCount?: number;
	authorId?: string;
	authorName?: string;
	authorPhotoUrl?: string;
	isSaved: boolean;
}

export interface ISeriesGenre {
	id: string;
	name: string;
	slug: string;
}

export interface ISeriesBook {
	id: string;
	title: string;
	author: string;
	authorId?: string;
	coverUrl?: string;
	seriesTitle?: string;
	orderInSeries?: number;
	bookCountInSeries?: number;
}

export interface ISeriesDetails extends ISeriesPreview {
	genres: ISeriesGenre[];
	books: ISeriesBook[];
}

export interface ISeriesListParams {
	page?: number;
	limit?: number;
}

export interface ISeriesListResponse {
	items: ISeriesPreview[];
	total: number;
	page: number;
	limit: number;
}

const getSeriesQuery = (params: ISeriesListParams = {}) => {
	const query = new URLSearchParams();

	if (params.page && params.page > 1) query.set("page", String(params.page));
	if (params.limit && params.limit > 0) query.set("limit", String(params.limit));

	const queryString = query.toString();
	return queryString ? `?${queryString}` : "";
};

export const getMySeries = (
	params: ISeriesListParams = {},
): Promise<ISeriesListResponse> =>
	requestAuth<ISeriesListResponse>(`/series/mine${getSeriesQuery(params)}`);

export const getSeriesDetails = (id: string): Promise<ISeriesDetails> =>
	requestOptionalAuth<ISeriesDetails>(`/series/${id}`);

export const saveSeries = (id: string): Promise<unknown> =>
	requestAuth(`/series/${id}/save`, { method: "POST" });

export const unsaveSeries = (id: string): Promise<unknown> =>
	requestAuth(`/series/${id}/save`, { method: "DELETE" });
