import { requestAuth } from "../base";
import type {
	IUpdateUserGenresPayload,
	IUpdateUserProfilePayload,
} from "./users.types";

export const updateUserGenres = (
	userId: string,
	payload: IUpdateUserGenresPayload,
): Promise<void> =>
	requestAuth<void>(`/users/${userId}/genres`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});

export const updateUserProfile = (
	userId: string,
	payload: IUpdateUserProfilePayload,
): Promise<void> =>
	requestAuth<void>(`/users/${userId}`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});
