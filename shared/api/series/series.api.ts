import { requestAuth } from "../base";

export interface ISeriesPreview {
	id: string;
	title: string;
	openLibrarySeriesKey?: string;
	description?: string;
	coverUrl?: string;
	isSaved: boolean;
}

export interface ISeriesListResponse {
	items: ISeriesPreview[];
	total: number;
}

export const getMySeries = (): Promise<ISeriesListResponse> =>
	requestAuth<ISeriesListResponse>("/series/mine");

export const saveSeries = (id: string): Promise<unknown> =>
	requestAuth(`/series/${id}/save`, { method: "POST" });

export const unsaveSeries = (id: string): Promise<unknown> =>
	requestAuth(`/series/${id}/save`, { method: "DELETE" });
