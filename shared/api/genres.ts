import { useQuery } from "@tanstack/react-query";
import { request } from "./books";

export interface Genre {
	id: string;
	name: string;
	slug: string;
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
