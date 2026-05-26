import { request, requestOptionalAuth } from "../base";
import type { IGenre, IGenresByCategoryResponse } from "./genres.types";

export const getGenres = (): Promise<IGenre[]> => request<IGenre[]>("/genres");

interface IGenresByCategoryParams {
	includeCounts?: boolean;
	selected?: string[];
}

export const getGenresByCategory = ({
	includeCounts,
	selected,
}: IGenresByCategoryParams = {}): Promise<IGenresByCategoryResponse> => {
	const searchParams = new URLSearchParams();

	if (includeCounts) {
		searchParams.set("includeCounts", "true");
	}

	const selectedGenres = selected?.filter(Boolean);
	if (selectedGenres?.length) {
		searchParams.set("selected", selectedGenres.join(","));
	}

	const query = searchParams.toString();

	return requestOptionalAuth<IGenresByCategoryResponse>(
		`/genres/byCategory${query ? `?${query}` : ""}`,
	);
};
