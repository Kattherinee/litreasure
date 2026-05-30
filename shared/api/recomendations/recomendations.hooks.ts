"use client";

import { useQuery } from "@tanstack/react-query";

import {
	getRecomendationsByBook,
	getRecomendationsByPrompt,
	getRecomendationsWeekBooks,
} from "./recomendations.api";
import type {
	IByBookRecomendationsParams,
	IByPromptRecomendationsParams,
} from "./recomendations.types";

export const recomendationsQueryKeys = {
	byPrompt: (params: IByPromptRecomendationsParams) =>
		["recomendations", "prompt", params] as const,
	byBook: (params: IByBookRecomendationsParams) =>
		["recomendations", "book", params] as const,
	weekBooks: () => ["recomendations", "week-books"] as const,
};

export const useRecomendationsByPromptQuery = (
	params: IByPromptRecomendationsParams,
	options?: { enabled?: boolean },
) => {
	return useQuery({
		enabled: options?.enabled,
		queryFn: () => getRecomendationsByPrompt({ params }),
		queryKey: recomendationsQueryKeys.byPrompt(params),
	});
};

export const useRecomendationsWeekBooksQuery = (options?: {
	enabled?: boolean;
}) => {
	return useQuery({
		enabled: options?.enabled,
		queryFn: getRecomendationsWeekBooks,
		queryKey: recomendationsQueryKeys.weekBooks(),
	});
};

export const useRecomendationsByBookQuery = (
	params: IByBookRecomendationsParams,
	options?: { enabled?: boolean },
) => {
	return useQuery({
		enabled: options?.enabled,
		queryFn: () => getRecomendationsByBook({ params }),
		queryKey: recomendationsQueryKeys.byBook(params),
	});
};
