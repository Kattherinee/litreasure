export type UpdateUserGenresPayload = {
	genreIds: string[];
};

export type UpdateUserProfilePayload = {
	name?: string;
	username?: string;
	avatarUrl?: string;
};
