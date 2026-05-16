import { request } from "../base";
import type {
	IBook,
	IBookCardsParams,
	IBookCardsResponse,
	ICreateBookPayload,
	IUpdateBookPayload,
} from "./books.types";

const getBookCardsQuery = (params: IBookCardsParams) => {
	const searchParams = new URLSearchParams();

	if (params.genre) searchParams.set("genre", params.genre);
	if (params.limit) searchParams.set("limit", String(params.limit));
	if (params.page) searchParams.set("page", String(params.page));
	if (params.search) searchParams.set("search", params.search);
	if (params.searchScope) searchParams.set("searchScope", params.searchScope);
	if (params.sort) searchParams.set("sort", params.sort);

	const query = searchParams.toString();

	return query ? `?${query}` : "";
};

export const getBooks = (): Promise<IBook[]> => request<IBook[]>("/books");

export const getBookCards = async ({
	params,
}: {
	params: IBookCardsParams;
}): Promise<IBookCardsResponse> => {
	const response = await request<IBookCardsResponse | IBook[]>(
		`/books/cards${getBookCardsQuery(params)}`,
	);

	if (Array.isArray(response)) {
		return {
			items: response,
			limit: params.limit ?? response.length,
			page: params.page ?? 1,
			pages: 1,
			total: response.length,
		};
	}

	return response;
};

export const getBook = (id: string): Promise<IBook> =>
	request<IBook>(`/books/${id}`);

export const createBook = (payload: ICreateBookPayload): Promise<IBook> =>
	request<IBook>("/books", {
		body: JSON.stringify(payload),
		method: "POST",
	});

export const updateBook = (
	id: string,
	payload: IUpdateBookPayload,
): Promise<IBook> =>
	request<IBook>(`/books/${id}`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});

export const deleteBook = (id: string): Promise<void> =>
	request<void>(`/books/${id}`, { method: "DELETE" });
