"use client";

import { useMutation } from "@tanstack/react-query";

import {
	deleteUserAccount,
	updateUserGenres,
	updateUserPassword,
	updateUserProfile,
} from "./users.api";
import type {
	IUpdateUserGenresPayload,
	IUpdateUserPasswordPayload,
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

export const useUpdateUserPasswordMutation = () =>
	useMutation({
		mutationFn: ({
			userId,
			payload,
		}: {
			userId: string;
			payload: IUpdateUserPasswordPayload;
		}) => updateUserPassword(userId, payload),
	});

export const useDeleteUserAccountMutation = () =>
	useMutation({
		mutationFn: (userId: string) => deleteUserAccount(userId),
	});
