import { useQuery } from "@tanstack/react-query";
import { request } from "./books";

export interface Genre {
	id: string;
	name: string;
	slug: string;
}

export interface GenreItem {
	id: string;
	name: string;
	slug: string;
	category: string;
	subcategory: string;
}

export interface GenreSubcategory {
	subcategory: string;
	genres: GenreItem[];
}

export interface GenreCategory {
	category: string;
	subcategories: GenreSubcategory[];
}

export const getGenres = async () => {
	const genres = await request<Genre[]>("/genres");

	return genres;
};
export const useGenresQuery = () =>
	useQuery({
		queryFn: getGenres,
		queryKey: ["genres"],
	});

export const getGenresByCategory = async () =>
	request<GenreCategory[]>("/genres/byCategory");

export const useGenresByCategoryQuery = () =>
	useQuery({
		queryFn: getGenresByCategory,
		queryKey: ["genres", "byCategory"],
	});
