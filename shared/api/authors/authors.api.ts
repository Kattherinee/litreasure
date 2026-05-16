import { requestAuth, requestOptionalAuth } from "../base";
import type {
	IAuthorDetails,
	IAuthorsListParams,
	IAuthorsListResponse,
	ICreateAuthorPayload,
	IUpdateAuthorPayload,
} from "./authors.types";

const normalizeAuthorsList = (
	response: IAuthorsListResponse | IAuthorsListResponse["items"],
	params: IAuthorsListParams = {},
): IAuthorsListResponse => {
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

const getAuthorsQuery = (params: IAuthorsListParams = {}) => {
	const searchParams = new URLSearchParams();

	if (params.limit) searchParams.set("limit", String(params.limit));
	if (params.page) searchParams.set("page", String(params.page));

	const query = searchParams.toString();

	return query ? `?${query}` : "";
};

export const getAuthors = async (
	params: IAuthorsListParams = {},
): Promise<IAuthorsListResponse> => {
	const response = await requestOptionalAuth<
		IAuthorsListResponse | IAuthorsListResponse["items"]
	>(`/authors${getAuthorsQuery(params)}`);

	return normalizeAuthorsList(response, params);
};

export const getAuthor = (id: string): Promise<IAuthorDetails> =>
	requestOptionalAuth<IAuthorDetails>(`/authors/${id}`);

export const createAuthor = (
	payload: ICreateAuthorPayload,
): Promise<IAuthorDetails> =>
	requestAuth<IAuthorDetails>("/authors", {
		body: JSON.stringify(payload),
		method: "POST",
	});

export const updateAuthor = (
	id: string,
	payload: IUpdateAuthorPayload,
): Promise<IAuthorDetails> =>
	requestAuth<IAuthorDetails>(`/authors/${id}`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});

export const deleteAuthor = (id: string): Promise<IAuthorDetails> =>
	requestAuth<IAuthorDetails>(`/authors/${id}`, { method: "DELETE" });
