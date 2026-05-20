export interface IUpdateUserGenresPayload {
	genreIds: string[];
}

export interface IUpdateUserProfilePayload {
	email?: string;
	name?: string;
	username?: string;
	avatarUrl?: string;
}

export interface IUpdateUserPasswordPayload {
	newPassword: string;
}
