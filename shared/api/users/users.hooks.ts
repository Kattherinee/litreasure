"use client";

import { useMutation } from "@tanstack/react-query";

import { updateUserGenres, updateUserProfile } from "./users.api";
import type {
	IUpdateUserGenresPayload,
	IUpdateUserProfilePayload,
} from "./users.types";

export const useUpdateUserGenresMutation = () =>
	useMutation({
		mutationFn: ({
			userId,
			payload,
		}: {
			userId: string;
			payload: IUpdateUserGenresPayload;
		}) => updateUserGenres(userId, payload),
	});

export const useUpdateUserProfileMutation = () =>
	useMutation({
		mutationFn: ({
			userId,
			payload,
		}: {
			userId: string;
			payload: IUpdateUserProfilePayload;
		}) => updateUserProfile(userId, payload),
	});
