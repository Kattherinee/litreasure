import { requestAuth } from "../base";
import type {
	UpdateUserGenresPayload,
	UpdateUserProfilePayload,
} from "./users.types";

export const updateUserGenres = (
	userId: string,
	payload: UpdateUserGenresPayload,
): Promise<void> =>
	requestAuth<void>(`/users/${userId}/genres`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});

export const updateUserProfile = (
	userId: string,
	payload: UpdateUserProfilePayload,
): Promise<void> =>
	requestAuth<void>(`/users/${userId}`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});
