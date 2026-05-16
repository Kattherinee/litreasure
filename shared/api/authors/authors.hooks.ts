"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createAuthor,
	deleteAuthor,
	getAuthor,
	getAuthors,
	updateAuthor,
} from "./authors.api";
import type {
	IAuthorsListParams,
	ICreateAuthorPayload,
	IUpdateAuthorPayload,
} from "./authors.types";

export const authorsQueryKeys = {
	all: ["authors"] as const,
	byId: (id: string) => ["authors", id] as const,
	list: (params: IAuthorsListParams) => ["authors", "list", params] as const,
};

export const useAuthorsQuery = (params: IAuthorsListParams = {}) =>
	useQuery({
		queryFn: () => getAuthors(params),
		queryKey: authorsQueryKeys.list(params),
	});

export const useAuthorQuery = (id: string) =>
	useQuery({
		enabled: Boolean(id),
		queryFn: () => getAuthor(id),
		queryKey: authorsQueryKeys.byId(id),
	});

export const useCreateAuthorMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ICreateAuthorPayload) => createAuthor(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authorsQueryKeys.all });
		},
	});
};

export const useUpdateAuthorMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: IUpdateAuthorPayload;
		}) => updateAuthor(id, payload),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: authorsQueryKeys.byId(id) });
			queryClient.invalidateQueries({ queryKey: authorsQueryKeys.all });
		},
	});
};

export const useDeleteAuthorMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteAuthor(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: authorsQueryKeys.byId(id) });
			queryClient.invalidateQueries({ queryKey: authorsQueryKeys.all });
		},
	});
};
