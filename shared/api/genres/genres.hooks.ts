"use client";

import { useQuery } from "@tanstack/react-query";

import { getGenres, getGenresByCategory } from "./genres.api";
import { useAuthStore } from "@/shared/store/auth-store";

export const useGenresQuery = () =>
	useQuery({ queryFn: getGenres, queryKey: ["genres"] });

interface IUseGenresByCategoryQueryParams {
	includeCounts?: boolean;
	selected?: string[];
}

export const useGenresByCategoryQuery = ({
	includeCounts = false,
	selected = [],
}: IUseGenresByCategoryQueryParams = {}) => {
	const sessionKey = useAuthStore(
		(state) => state.session?.user.id ?? state.session?.user.email ?? "guest",
	);

	return useQuery({
		queryFn: () => getGenresByCategory({ includeCounts, selected }),
		queryKey: [
			"genres",
			"byCategory",
			includeCounts,
			selected.join(","),
			sessionKey,
		],
	});
};
