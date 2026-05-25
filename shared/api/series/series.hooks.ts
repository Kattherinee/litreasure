"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authorsQueryKeys } from "../authors";
import { booksQueryKeys } from "../books";
import { getMySeries, saveSeries, unsaveSeries } from "./series.api";

export const seriesQueryKeys = {
	all: ["series"] as const,
	byId: (id: string) => ["series", id] as const,
	mine: ["series", "mine"] as const,
};

export const useMySeriesQuery = (options?: { enabled?: boolean }) =>
	useQuery({
		enabled: options?.enabled ?? true,
		queryFn: getMySeries,
		queryKey: seriesQueryKeys.mine,
	});

export const useSaveSeriesMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => saveSeries(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: seriesQueryKeys.byId(id) });
			queryClient.invalidateQueries({ queryKey: seriesQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: seriesQueryKeys.mine });
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
			queryClient.invalidateQueries({ queryKey: seriesQueryKeys.mine });
			queryClient.invalidateQueries({ queryKey: booksQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: authorsQueryKeys.all });
		},
	});
};
