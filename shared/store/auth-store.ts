"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
	id?: string;
	email: string;
	name?: string;
	username?: string;
	avatarUrl?: string;
};

export type AuthSession = {
	accessToken?: string;
	refreshToken?: string;
	user: AuthUser;
};

type AuthStoreState = {
	session: AuthSession | null;
	isAuthenticated: boolean;
	setSession: (session: AuthSession) => void;
	logout: () => void;
};

export const AUTH_STORAGE_KEY = "litreasure-auth";

export const useAuthStore = create<AuthStoreState>()(
	persist(
		(set) => ({
			session: null,
			isAuthenticated: false,
			setSession: (session) =>
				set({
					session,
					isAuthenticated: true,
				}),
			logout: () =>
				set({
					session: null,
					isAuthenticated: false,
				}),
		}),
		{
			name: AUTH_STORAGE_KEY,
			partialize: (state) => ({
				session: state.session,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
