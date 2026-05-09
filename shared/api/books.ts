"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Book = {
	id: string;
	title: string;
	author: string;
	description?: string;
	coverUrl?: string;
	genres: string[];
	publishedYear?: number;
	rating?: number;
	createdAt: string;
	updatedAt: string;
};

export type CreateBookPayload = {
	title: string;
	author: string;
	description?: string;
	coverUrl?: string;
	genres: string[];
	publishedYear?: number;
	rating?: number;
};

export type UpdateBookPayload = Partial<CreateBookPayload>;

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const booksQueryKeys = {
	all: ["books"] as const,
	detail: (id: string) => ["books", id] as const,
};

const request = async <T>(
	path: string,
	options: RequestInit = {},
): Promise<T> => {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || `Request failed with status ${response.status}`);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
};

const normalizeBook = (book: Book): Book => ({
	...book,
	genres: Array.isArray(book.genres) ? book.genres : [],
});

export const getBooks = async () => {
	const books = await request<Book[]>("/books");

	return books.map(normalizeBook);
};

export const getBook = async (id: string) => {
	const book = await request<Book>(`/books/${id}`);

	return normalizeBook(book);
};

export const createBook = async (payload: CreateBookPayload) => {
	const book = await request<Book>("/books", {
		body: JSON.stringify(payload),
		method: "POST",
	});

	return normalizeBook(book);
};

export const updateBook = async (id: string, payload: UpdateBookPayload) => {
	const book = await request<Book>(`/books/${id}`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});

	return normalizeBook(book);
};

export const deleteBook = (id: string) =>
	request<void>(`/books/${id}`, {
		method: "DELETE",
	});

export const useBooksQuery = () =>
	useQuery({
		queryFn: getBooks,
		queryKey: booksQueryKeys.all,
	});

export const useBookQuery = (id: string) =>
	useQuery({
		enabled: Boolean(id),
		queryFn: () => getBook(id),
		queryKey: booksQueryKeys.detail(id),
	});

export const useCreateBookMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createBook,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: booksQueryKeys.all });
		},
	});
};

export const useUpdateBookMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateBookPayload }) =>
			updateBook(id, payload),
		onSuccess: (book) => {
			queryClient.setQueryData(booksQueryKeys.detail(book.id), book);
			void queryClient.invalidateQueries({ queryKey: booksQueryKeys.all });
		},
	});
};

export const useDeleteBookMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteBook,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: booksQueryKeys.all });
		},
	});
};
