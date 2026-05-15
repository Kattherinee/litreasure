import { request } from "../base";
import type { Genre, GenreCategory } from "./genres.types";

export const getGenres = (): Promise<Genre[]> => request<Genre[]>("/genres");

export const getGenresByCategory = (): Promise<GenreCategory[]> =>
	request<GenreCategory[]>("/genres/byCategory");
