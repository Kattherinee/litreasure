"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authorsQueryKeys } from "../authors";
import { booksQueryKeys } from "../books";
import {
	getMySeries,
	getSeriesDetails,
	saveSeries,
	unsaveSeries,
	type ISeriesListParams,
} from "./series.api";

export const seriesQueryKeys = {
	all: ["series"] as const,
	byId: (id: string) => ["series", id] as const,
	mine: (params: ISeriesListParams = {}) => ["series", "mine", params] as const,
};

export const useMySeriesQuery = (
	params: ISeriesListParams = {},
	options?: { enabled?: boolean },
) =>
	useQuery({
		enabled: options?.enabled ?? true,
		queryFn: () => getMySeries(params),
		queryKey: seriesQueryKeys.mine(params),
	});

export const useSeriesQuery = (id: string, options?: { enabled?: boolean }) =>
	useQuery({
		enabled: Boolean(id) && (options?.enabled ?? true),
		queryFn: () => getSeriesDetails(id),
		queryKey: seriesQueryKeys.byId(id),
	});

export const useSaveSeriesMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => saveSeries(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: seriesQueryKeys.byId(id) });
			queryClient.invalidateQueries({ queryKey: seriesQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: ["series", "mine"] });
			queryClient.invalidateQueries({ queryKey: booksQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: authorsQueryKeys.all });
		},
	});
};

export const useUnsaveSeriesMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => unsaveSeries(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: seriesQueryKeys.byId(id) });
			queryClient.invalidateQueries({ queryKey: seriesQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: ["series", "mine"] });
			queryClient.invalidateQueries({ queryKey: booksQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: authorsQueryKeys.all });
		},
	});
};
