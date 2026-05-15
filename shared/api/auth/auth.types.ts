export type RegisterPayload = {
	email: string;
	password: string;
};

export type LoginPayload = {
	email: string;
	password: string;
};

export type RawAuthResponse = {
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
