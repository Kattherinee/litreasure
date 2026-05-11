"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Book = {
	id: string;
	title: string;
	author: string;
	description?: string;
	coverUrl?: string;
	pagesCount?: number;
	genres: string[];
	setting: string[];
	publishedYear?: number;
	firstPublishDate?: string;
	publisher?: string;
	rating?: number;
	ratingAvg?: number;
	ratingsCount?: number;
	ratingsByStars: number[];
	language?: string;
	openLibraryWorkKey?: string;
	orderInSeries?: number;
	relationType?: BookSeriesRelationType;
	seriesLabel?: string;
	authors: string[];
	series?: {
		id?: string;
		title?: string;
		openLibrarySeriesKey?: string;
		seriesId: string;
		orderInSeries?: number;
		relationType?: BookSeriesRelationType;
		seriesLabel?: string;
		books?: Array<{
			id: string;
			title: string;
			author?: string;
			coverUrl?: string;
			orderInSeries?: number;
			relationType?: BookSeriesRelationType;
			seriesLabel?: string;
		}>;
	};
	createdAt: string;
	updatedAt: string;
};

export type BookSeriesRelationType =
	| "collection"
	| "main"
	| "omnibus"
	| "spin_off"
	| "unknown";

type RawBook = Omit<
	Book,
	| "author"
	| "authors"
	| "genres"
	| "ratingsByStars"
	| "relationType"
	| "series"
	| "seriesLabel"
	| "setting"
> & {
	author?: unknown;
	authors?: unknown;
	genres?: unknown;
	ratingsByStars?: unknown;
	relationType?: unknown;
	series?: unknown;
	seriesLabel?: unknown;
	setting?: unknown;
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

export type BookSort = "newest" | "popular" | "rating";

export interface IBookCardsParams {
	limit?: number;
	genre?: string;
	search?: string;
	sort?: BookSort;
}

export type UpdateBookPayload = Partial<CreateBookPayload>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const booksQueryKeys = {
	all: ["books"] as const,
	detail: (id: string) => ["books", id] as const,
};

export const request = async <T>(
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

const normalizeGenre = (genre: unknown) => {
	if (typeof genre === "string") {
		return genre;
	}

	if (genre && typeof genre === "object") {
		const genreObject = genre as { name?: unknown; slug?: unknown };

		if (typeof genreObject.slug === "string") {
			return genreObject.slug;
		}

		if (typeof genreObject.name === "string") {
			return genreObject.name;
		}
	}

	return null;
};

const normalizeNamedValue = (value: unknown) => {
	if (typeof value === "string") {
		return value;
	}

	if (value && typeof value === "object") {
		const valueObject = value as { name?: unknown; slug?: unknown; title?: unknown };

		if (typeof valueObject.name === "string") {
			return valueObject.name;
		}

		if (typeof valueObject.title === "string") {
			return valueObject.title;
		}

		if (typeof valueObject.slug === "string") {
			return valueObject.slug;
		}
	}

	return null;
};

const normalizeSeriesId = (seriesId: unknown) => {
	if (typeof seriesId === "string") {
		return seriesId;
	}

	if (seriesId && typeof seriesId === "object") {
		const seriesObject = seriesId as { id?: unknown; name?: unknown; title?: unknown };

		if (typeof seriesObject.id === "string") {
			return seriesObject.id;
		}

		if (typeof seriesObject.name === "string") {
			return seriesObject.name;
		}

		if (typeof seriesObject.title === "string") {
			return seriesObject.title;
		}
	}

	return "";
};

const normalizeSeriesRelationType = (
	relationType: unknown,
): BookSeriesRelationType | undefined => {
	if (
		relationType === "collection" ||
		relationType === "main" ||
		relationType === "omnibus" ||
		relationType === "spin_off" ||
		relationType === "unknown"
	) {
		return relationType;
	}

	return undefined;
};

const normalizeSeries = (series: unknown): Book["series"] => {
	if (!series || typeof series !== "object") {
		return undefined;
	}

	const seriesObject = series as {
		books?: unknown;
		id?: unknown;
		openLibrarySeriesKey?: unknown;
		orderInSeries?: unknown;
		relationType?: unknown;
		seriesId?: unknown;
		seriesLabel?: unknown;
		title?: unknown;
	};
	const seriesId = normalizeSeriesId(seriesObject.seriesId ?? seriesObject.id);
	const books = Array.isArray(seriesObject.books)
		? seriesObject.books.flatMap((book) => {
				if (!book || typeof book !== "object") {
					return [];
				}

				const seriesBook = book as {
					author?: unknown;
					coverUrl?: unknown;
					id?: unknown;
					orderInSeries?: unknown;
					relationType?: unknown;
					seriesLabel?: unknown;
					title?: unknown;
				};

				if (
					typeof seriesBook.id !== "string" ||
					typeof seriesBook.title !== "string"
				) {
					return [];
				}

				return [
					{
						id: seriesBook.id,
						title: seriesBook.title,
						author:
							typeof seriesBook.author === "string"
								? seriesBook.author
								: undefined,
						coverUrl:
							typeof seriesBook.coverUrl === "string"
								? seriesBook.coverUrl
								: undefined,
						orderInSeries:
							typeof seriesBook.orderInSeries === "number"
								? seriesBook.orderInSeries
								: undefined,
						relationType: normalizeSeriesRelationType(
							seriesBook.relationType,
						),
						seriesLabel:
							typeof seriesBook.seriesLabel === "string"
								? seriesBook.seriesLabel
								: undefined,
					},
				];
			})
		: undefined;

	return {
		id: typeof seriesObject.id === "string" ? seriesObject.id : seriesId,
		openLibrarySeriesKey:
			typeof seriesObject.openLibrarySeriesKey === "string"
				? seriesObject.openLibrarySeriesKey
				: undefined,
		seriesId,
		title:
			typeof seriesObject.title === "string" ? seriesObject.title : undefined,
		books,
		orderInSeries:
			typeof seriesObject.orderInSeries === "number"
				? seriesObject.orderInSeries
				: undefined,
		relationType: normalizeSeriesRelationType(seriesObject.relationType),
		seriesLabel:
			typeof seriesObject.seriesLabel === "string"
				? seriesObject.seriesLabel
				: undefined,
	};
};

const normalizeBook = (book: RawBook): Book => ({
	...book,
	author:
		typeof book.author === "string"
			? book.author
			: Array.isArray(book.authors)
				? (book.authors.map(normalizeNamedValue).find(Boolean) ?? "")
				: "",
	authors: Array.isArray(book.authors)
		? book.authors.flatMap((author) => {
				const normalizedAuthor = normalizeNamedValue(author);

				return normalizedAuthor ? [normalizedAuthor] : [];
			})
		: typeof book.author === "string"
			? [book.author]
			: [],
	genres: Array.isArray(book.genres)
		? book.genres.flatMap((genre) => {
				const normalizedGenre = normalizeGenre(genre);

				return normalizedGenre ? [normalizedGenre] : [];
			})
		: [],
	ratingsByStars: Array.isArray(book.ratingsByStars)
		? book.ratingsByStars.filter(
				(ratingValue): ratingValue is number => typeof ratingValue === "number",
			)
		: [],
	relationType: normalizeSeriesRelationType(book.relationType),
	series: normalizeSeries(book.series),
	seriesLabel:
		typeof book.seriesLabel === "string" ? book.seriesLabel : undefined,
	setting: Array.isArray(book.setting)
		? book.setting.flatMap((setting) => {
				const normalizedSetting = normalizeNamedValue(setting);

				return normalizedSetting ? [normalizedSetting] : [];
			})
		: [],
});

export const getBooks = async () => {
	const books = await request<RawBook[]>("/books");

	return books.map(normalizeBook);
};
export const getBookCards = async ({
	params,
}: {
	params: IBookCardsParams;
}) => {
	const searchParams = new URLSearchParams();

	if (params.genre) {
		searchParams.set("genre", params.genre);
	}

	if (params.limit) {
		searchParams.set("limit", String(params.limit));
	}

	if (params.search) {
		searchParams.set("search", params.search);
	}

	if (params.sort) {
		searchParams.set("sort", params.sort);
	}

	const query = searchParams.toString();
	const books = await request<RawBook[]>(
		query ? `/books/cards?${query}` : "/books/cards",
	);

	return books.map(normalizeBook);
};

export const getBook = async (id: string) => {
	const book = await request<RawBook>(`/books/${id}`);

	return normalizeBook(book);
};

export const createBook = async (payload: CreateBookPayload) => {
	const book = await request<RawBook>("/books", {
		body: JSON.stringify(payload),
		method: "POST",
	});

	return normalizeBook(book);
};

export const updateBook = async (id: string, payload: UpdateBookPayload) => {
	const book = await request<RawBook>(`/books/${id}`, {
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

export const useBookCardsQuery = (
	params: IBookCardsParams,
	options?: { enabled?: boolean },
) =>
	useQuery({
		enabled: options?.enabled,
		queryFn: () => getBookCards({ params }),
		queryKey: [...booksQueryKeys.all, "cards", params],
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
