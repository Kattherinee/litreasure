"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createCollection,
	deleteCollection,
	getCollection,
	getMyCollections,
	getPublicCollections,
	updateCollection,
} from "./collections.api";
import type {
	ICollectionsListParams,
	ICreateCollectionPayload,
	IUpdateCollectionPayload,
} from "./collections.types";

export const collectionsQueryKeys = {
	all: ["collections"] as const,
	byId: (id: string) => ["collections", id] as const,
	mine: (params: ICollectionsListParams) =>
		["collections", "mine", params] as const,
	public: (params: ICollectionsListParams) =>
		["collections", "public", params] as const,
};

export const usePublicCollectionsQuery = (params: ICollectionsListParams = {}) =>
	useQuery({
		queryFn: () => getPublicCollections(params),
		queryKey: collectionsQueryKeys.public(params),
	});

export const useMyCollectionsQuery = (params: ICollectionsListParams = {}) =>
	useQuery({
		queryFn: () => getMyCollections(params),
		queryKey: collectionsQueryKeys.mine(params),
	});

export const useCollectionQuery = (id: string) =>
	useQuery({
		enabled: Boolean(id),
		queryFn: () => getCollection(id),
		queryKey: collectionsQueryKeys.byId(id),
	});

export const useCreateCollectionMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ICreateCollectionPayload) =>
			createCollection(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.all });
		},
	});
};

export const useUpdateCollectionMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: IUpdateCollectionPayload;
		}) => updateCollection(id, payload),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.byId(id) });
			queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.all });
		},
	});
};

export const useDeleteCollectionMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteCollection(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.byId(id) });
			queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.all });
		},
	});
};
