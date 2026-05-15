"use client";

import { useQuery } from "@tanstack/react-query";

import { getGenres, getGenresByCategory } from "./genres.api";

export const useGenresQuery = () =>
	useQuery({ queryFn: getGenres, queryKey: ["genres"] });

export const useGenresByCategoryQuery = () =>
	useQuery({
		queryFn: getGenresByCategory,
		queryKey: ["genres", "byCategory"],
	});
