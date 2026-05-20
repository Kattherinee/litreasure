import { requestAuth } from "../base";

export const saveSeries = (id: string): Promise<unknown> =>
	requestAuth(`/series/${id}/save`, { method: "POST" });

export const unsaveSeries = (id: string): Promise<unknown> =>
	requestAuth(`/series/${id}/save`, { method: "DELETE" });
