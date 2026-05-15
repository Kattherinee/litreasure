"use client";

import { useMutation } from "@tanstack/react-query";

import { updateUserGenres, updateUserProfile } from "./users.api";
import type {
	UpdateUserGenresPayload,
	UpdateUserProfilePayload,
} from "./users.types";

export const useUpdateUserGenresMutation = () =>
	useMutation({
		mutationFn: ({
			userId,
			payload,
		}: {
			userId: string;
			payload: UpdateUserGenresPayload;
		}) => updateUserGenres(userId, payload),
	});

export const useUpdateUserProfileMutation = () =>
	useMutation({
		mutationFn: ({
			userId,
			payload,
		}: {
			userId: string;
			payload: UpdateUserProfilePayload;
		}) => updateUserProfile(userId, payload),
	});
