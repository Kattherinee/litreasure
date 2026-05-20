import { requestAuth } from "../base";
import type {
	IUpdateBookTrackingPayload,
	IUserBooksParams,
	IUserBooksResponse,
	IUserBookStatusCounts,
	IUserBookTracking,
} from "./userBooks.types";

const buildUserBooksQuery = (params: IUserBooksParams = {}) => {
	const searchParams = new URLSearchParams();

	if (params.status) searchParams.set("status", params.status);
	if (params.page && params.page > 0) searchParams.set("page", String(params.page));
	if (params.limit && params.limit > 0) searchParams.set("limit", String(params.limit));

	const query = searchParams.toString();
	return query ? `?${query}` : "";
};

export const getUserBooks = (
	params: IUserBooksParams = {},
): Promise<IUserBooksResponse> =>
	requestAuth<IUserBooksResponse>(`/user-books${buildUserBooksQuery(params)}`);

export const getUserBookTracking = (
	bookId: string,
): Promise<IUserBookTracking> =>
	requestAuth<IUserBookTracking>(`/user-books/${bookId}`);

export const getUserBookStatusCounts =
	(): Promise<IUserBookStatusCounts> =>
		requestAuth<IUserBookStatusCounts>("/user-books/status-counts");

export const updateBookTracking = (
	bookId: string,
	payload: IUpdateBookTrackingPayload,
): Promise<IUserBookTracking> =>
	requestAuth<IUserBookTracking>(`/user-books/${bookId}`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});

export const deleteBookTracking = (bookId: string): Promise<IUserBookTracking> =>
	requestAuth<IUserBookTracking>(`/user-books/${bookId}`, {
		method: "DELETE",
	});
