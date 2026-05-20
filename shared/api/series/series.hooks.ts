"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authorsQueryKeys } from "../authors";
import { booksQueryKeys } from "../books";
import { saveSeries, unsaveSeries } from "./series.api";

export const seriesQueryKeys = {
	all: ["series"] as const,
	byId: (id: string) => ["series", id] as const,
};

export const useSaveSeriesMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => saveSeries(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: seriesQueryKeys.byId(id) });
			queryClient.invalidateQueries({ queryKey: seriesQueryKeys.all });
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
			queryClient.invalidateQueries({ queryKey: booksQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: authorsQueryKeys.all });
		},
	});
};
