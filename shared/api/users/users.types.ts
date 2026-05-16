export interface IUpdateUserGenresPayload {
	genreIds: string[];
}

export interface IUpdateUserProfilePayload {
	name?: string;
	username?: string;
	avatarUrl?: string;
}
