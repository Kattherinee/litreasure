import { request } from "../base";
import type { IGenre, IGenreCategory } from "./genres.types";

export const getGenres = (): Promise<IGenre[]> => request<IGenre[]>("/genres");

export const getGenresByCategory = (): Promise<IGenreCategory[]> =>
	request<IGenreCategory[]>("/genres/byCategory");
