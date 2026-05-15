"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createBook,
	deleteBook,
	getBook,
	getBookCards,
	getBooks,
	updateBook,
} from "./books.api";
import type {
	CreateBookPayload,
	IBookCardsParams,
	UpdateBookPayload,
} from "./books.types";

export const booksQueryKeys = {
	all: ["books"] as const,
	byId: (id: string) => ["books", id] as const,
	cards: (params: IBookCardsParams) => ["books", "cards", params] as const,
};

export const useBooksQuery = () =>
	useQuery({ queryFn: getBooks, queryKey: booksQueryKeys.all });

export const useBookCardsQuery = (params: IBookCardsParams) =>
	useQuery({
		queryFn: () => getBookCards({ params }),
		queryKey: booksQueryKeys.cards(params),
	});

export const useBookQuery = (id: string) =>
	useQuery({
		enabled: Boolean(id),
		queryFn: () => getBook(id),
		queryKey: booksQueryKeys.byId(id),
	});

export const useCreateBookMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateBookPayload) => createBook(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: booksQueryKeys.all });
		},
	});
};

export const useUpdateBookMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateBookPayload }) =>
			updateBook(id, payload),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: booksQueryKeys.byId(id) });
			queryClient.invalidateQueries({ queryKey: booksQueryKeys.all });
		},
	});
};

export const useDeleteBookMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteBook(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: booksQueryKeys.all });
		},
	});
};
