"use client";

import { useQuery } from "@tanstack/react-query";

import { getGenres, getGenresByCategory } from "./genres.api";

export const useGenresQuery = () =>
	useQuery({ queryFn: getGenres, queryKey: ["genres"] });

interface IUseGenresByCategoryQueryParams {
	includeCounts?: boolean;
	selected?: string[];
}

export const useGenresByCategoryQuery = ({
	includeCounts = false,
	selected = [],
}: IUseGenresByCategoryQueryParams = {}) =>
	useQuery({
		queryFn: () => getGenresByCategory({ includeCounts, selected }),
		queryKey: ["genres", "byCategory", includeCounts, selected.join(",")],
	});
