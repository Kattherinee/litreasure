import { request } from "../base";
import type {
	IBook,
	IBookSearchMatch,
	IBookSeriesRelationType,
	ICreateBookPayload,
	IBookCardsParams,
	IUpdateBookPayload,
} from "./books.types";

// ── Raw type (before normalisation) ──────────────────────────────────────────

interface IRawBook extends Omit<
	IBook,
	| "author"
	| "authors"
	| "genres"
	| "ratingsByStars"
	| "relationType"
	| "searchMatches"
	| "series"
	| "seriesLabel"
	| "seriesRelationType"
	| "seriesTitle"
	| "setting"
> {
	author?: unknown;
	authors?: unknown;
	genres?: unknown;
	ratingsByStars?: unknown;
	relationType?: unknown;
	searchMatches?: unknown;
	series?: unknown;
	seriesLabel?: unknown;
	seriesRelationType?: unknown;
	seriesTitle?: unknown;
	setting?: unknown;
}

// ── Normalisation helpers ─────────────────────────────────────────────────────

const normalizeGenre = (genre: unknown) => {
	if (typeof genre === "string") return genre;
	if (genre && typeof genre === "object") {
		const g = genre as { name?: unknown; slug?: unknown };
		if (typeof g.slug === "string") return g.slug;
		if (typeof g.name === "string") return g.name;
	}
	return null;
};

const normalizeNamedValue = (value: unknown) => {
	if (typeof value === "string") return value;
	if (value && typeof value === "object") {
		const v = value as { name?: unknown; slug?: unknown; title?: unknown };
		if (typeof v.name === "string") return v.name;
		if (typeof v.title === "string") return v.title;
		if (typeof v.slug === "string") return v.slug;
	}
	return null;
};

const normalizeSeriesId = (seriesId: unknown): string => {
	if (typeof seriesId === "string") return seriesId;
	if (seriesId && typeof seriesId === "object") {
		const s = seriesId as { id?: unknown; name?: unknown; title?: unknown };
		if (typeof s.id === "string") return s.id;
		if (typeof s.name === "string") return s.name;
		if (typeof s.title === "string") return s.title;
	}
	return "";
};

const normalizeSeriesRelationType = (
	relationType: unknown,
): IBookSeriesRelationType | undefined => {
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

const normalizeSearchMatches = (searchMatches: unknown): IBookSearchMatch[] => {
	if (!Array.isArray(searchMatches)) return [];
	return searchMatches.flatMap((match) => {
		if (!match || typeof match !== "object") return [];
		const m = match as { field?: unknown; value?: unknown };
		if (typeof m.field !== "string" || typeof m.value !== "string") return [];
		return [{ field: m.field, value: m.value }];
	});
};

const normalizeSeries = (series: unknown): IBook["series"] => {
	if (!series || typeof series !== "object") return undefined;

	const s = series as {
		books?: unknown;
		id?: unknown;
		openLibrarySeriesKey?: unknown;
		orderInSeries?: unknown;
		relationType?: unknown;
		seriesId?: unknown;
		seriesLabel?: unknown;
		title?: unknown;
	};
	const seriesId = normalizeSeriesId(s.seriesId ?? s.id);
	const books = Array.isArray(s.books)
		? s.books.flatMap((book) => {
				if (!book || typeof book !== "object") return [];
				const b = book as {
					author?: unknown;
					coverUrl?: unknown;
					id?: unknown;
					orderInSeries?: unknown;
					relationType?: unknown;
					seriesLabel?: unknown;
					title?: unknown;
				};
				if (typeof b.id !== "string" || typeof b.title !== "string") return [];
				return [
					{
						id: b.id,
						title: b.title,
						author: typeof b.author === "string" ? b.author : undefined,
						coverUrl: typeof b.coverUrl === "string" ? b.coverUrl : undefined,
						orderInSeries:
							typeof b.orderInSeries === "number" ? b.orderInSeries : undefined,
						relationType: normalizeSeriesRelationType(b.relationType),
						seriesLabel:
							typeof b.seriesLabel === "string" ? b.seriesLabel : undefined,
					},
				];
			})
		: undefined;

	return {
		id: typeof s.id === "string" ? s.id : seriesId,
		openLibrarySeriesKey:
			typeof s.openLibrarySeriesKey === "string"
				? s.openLibrarySeriesKey
				: undefined,
		seriesId,
		title: typeof s.title === "string" ? s.title : undefined,
		books,
		orderInSeries:
			typeof s.orderInSeries === "number" ? s.orderInSeries : undefined,
		relationType: normalizeSeriesRelationType(s.relationType),
		seriesLabel: typeof s.seriesLabel === "string" ? s.seriesLabel : undefined,
	};
};

export const normalizeBook = (book: IRawBook): IBook => ({
	...book,
	author:
		typeof book.author === "string"
			? book.author
			: Array.isArray(book.authors)
				? (book.authors.map(normalizeNamedValue).find(Boolean) ?? "")
				: "",
	authors: Array.isArray(book.authors)
		? book.authors.flatMap((a) => {
				const n = normalizeNamedValue(a);
				return n ? [n] : [];
			})
		: typeof book.author === "string"
			? [book.author]
			: [],
	genres: Array.isArray(book.genres)
		? book.genres.flatMap((g) => {
				const n = normalizeGenre(g);
				return n ? [n] : [];
			})
		: [],
	ratingsByStars: Array.isArray(book.ratingsByStars)
		? book.ratingsByStars.filter((v): v is number => typeof v === "number")
		: [],
	relationType: normalizeSeriesRelationType(
		book.relationType ?? book.seriesRelationType,
	),
	searchMatches: normalizeSearchMatches(book.searchMatches),
	series:
		normalizeSeries(book.series) ??
		(typeof book.seriesTitle === "string" ||
		typeof book.orderInSeries === "number" ||
		typeof book.seriesRelationType === "string"
			? {
					seriesId: "",
					title:
						typeof book.seriesTitle === "string" ? book.seriesTitle : undefined,
					orderInSeries:
						typeof book.orderInSeries === "number"
							? book.orderInSeries
							: undefined,
					relationType: normalizeSeriesRelationType(book.seriesRelationType),
					seriesLabel:
						typeof book.seriesLabel === "string" ? book.seriesLabel : undefined,
				}
			: undefined),
	seriesLabel:
		typeof book.seriesLabel === "string" ? book.seriesLabel : undefined,
	seriesRelationType: normalizeSeriesRelationType(book.seriesRelationType),
	seriesTitle:
		typeof book.seriesTitle === "string" ? book.seriesTitle : undefined,
	setting: Array.isArray(book.setting)
		? book.setting.flatMap((s) => {
				const n = normalizeNamedValue(s);
				return n ? [n] : [];
			})
		: [],
});

// ── API functions ─────────────────────────────────────────────────────────────

export const getBooks = async (): Promise<IBook[]> => {
	const books = await request<IRawBook[]>("/books");
	return books.map(normalizeBook);
};

export const getBookCards = async ({
	params,
}: {
	params: IBookCardsParams;
}): Promise<IBook[]> => {
	const searchParams = new URLSearchParams();
	if (params.genre) searchParams.set("genre", params.genre);
	if (params.limit) searchParams.set("limit", String(params.limit));
	if (params.search) searchParams.set("search", params.search);
	if (params.searchScope) searchParams.set("searchScope", params.searchScope);
	if (params.sort) searchParams.set("sort", params.sort);
	const query = searchParams.toString();
	const books = await request<IRawBook[]>(
		query ? `/books/cards?${query}` : "/books/cards",
	);
	return books.map(normalizeBook);
};

export const getBook = async (id: string): Promise<IBook> => {
	const book = await request<IRawBook>(`/books/${id}`);
	return normalizeBook(book);
};

export const createBook = async (payload: ICreateBookPayload): Promise<IBook> => {
	const book = await request<IRawBook>("/books", {
		body: JSON.stringify(payload),
		method: "POST",
	});
	return normalizeBook(book);
};

export const updateBook = async (
	id: string,
	payload: IUpdateBookPayload,
): Promise<IBook> => {
	const book = await request<IRawBook>(`/books/${id}`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});
	return normalizeBook(book);
};

export const deleteBook = (id: string): Promise<void> =>
	request<void>(`/books/${id}`, { method: "DELETE" });
