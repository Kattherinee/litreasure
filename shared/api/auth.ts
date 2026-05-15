"use client";

import { useMutation } from "@tanstack/react-query";

import { request } from "@/shared/api/books";
import type { AuthSession, AuthUser } from "@/shared/store/auth-store";

export type RegisterPayload = {
	email: string;
	password: string;
	name: string;
	username: string;
	avatarUrl?: string;
};

export type LoginPayload = {
	email: string;
	password: string;
};

type RawAuthResponse = {
	accessToken?: unknown;
	avatarUrl?: unknown;
	email?: unknown;
	id?: unknown;
	name?: unknown;
	refreshToken?: unknown;
	token?: unknown;
	user?: unknown;
	username?: unknown;
};

const normalizeUser = (source: unknown, fallbackEmail: string): AuthUser => {
	const user =
		source && typeof source === "object" ? (source as RawAuthResponse) : {};

	return {
		id: typeof user.id === "string" ? user.id : undefined,
		email: typeof user.email === "string" ? user.email : fallbackEmail,
		name: typeof user.name === "string" ? user.name : undefined,
		username: typeof user.username === "string" ? user.username : undefined,
		avatarUrl: typeof user.avatarUrl === "string" ? user.avatarUrl : undefined,
	};
};

const normalizeAuthResponse = (
	response: RawAuthResponse,
	fallbackEmail: string,
): AuthSession => {
	const rawUser = response.user ?? response;
	const user = normalizeUser(rawUser, fallbackEmail);
	const accessToken =
		typeof response.accessToken === "string"
			? response.accessToken
			: typeof response.token === "string"
				? response.token
				: undefined;

	return {
		accessToken,
		refreshToken:
			typeof response.refreshToken === "string"
				? response.refreshToken
				: undefined,
		user,
	};
};

export const register = async (payload: RegisterPayload) => {
	const response = await request<RawAuthResponse>("/auth/register", {
		body: JSON.stringify(payload),
		method: "POST",
	});

	return normalizeAuthResponse(response, payload.email);
};

export const checkUsernameAvailability = async (
	username: string,
): Promise<boolean> => {
	try {
		const result = await request<{ available?: boolean }>(
			`/users/check-username?username=${encodeURIComponent(username)}`,
		);
		return result.available !== false;
	} catch {
		// If endpoint doesn't exist or network error — allow proceeding
		return true;
	}
};

export const login = async (payload: LoginPayload) => {
	const response = await request<RawAuthResponse>("/auth/login", {
		body: JSON.stringify(payload),
		method: "POST",
	});

	return normalizeAuthResponse(response, payload.email);
};

export const useRegisterMutation = () =>
	useMutation({
		mutationFn: register,
	});

export const useLoginMutation = () =>
	useMutation({
		mutationFn: login,
	});
