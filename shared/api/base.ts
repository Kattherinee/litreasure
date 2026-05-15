const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const AUTH_STORAGE_KEY = "litreasure-auth";

export { API_BASE_URL };

export const getStoredAccessToken = (): string | null => {
	if (typeof window === "undefined") return null;
	try {
		const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
		if (!rawAuth) return null;
		const parsed = JSON.parse(rawAuth) as {
			state?: { session?: { accessToken?: unknown } };
		};
		const token = parsed.state?.session?.accessToken;
		return typeof token === "string" && token.trim() ? token : null;
	} catch {
		return null;
	}
};

const handleResponse = async <T>(response: Response): Promise<T> => {
	if (!response.ok) {
		let message: string;
		try {
			const body = (await response.json()) as {
				message?: unknown;
				error?: unknown;
			};
			message =
				typeof body.message === "string"
					? body.message
					: typeof body.error === "string"
						? body.error
						: `Request failed: ${response.status}`;
		} catch {
			message = (await response.text()) || `Request failed: ${response.status}`;
		}
		throw new Error(message);
	}
	if (response.status === 204) return undefined as T;
	return response.json() as Promise<T>;
};

/** Public request — no Authorization header. */
export const request = async <T>(
	path: string,
	options: RequestInit = {},
): Promise<T> => {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
	});
	return handleResponse<T>(response);
};

/**
 * Authenticated request — always attaches the Bearer token.
 * Throws if no token is stored.
 */
export const requestAuth = async <T>(
	path: string,
	options: RequestInit = {},
): Promise<T> => {
	const token = getStoredAccessToken();
	if (!token) throw new Error("Требуется авторизация");
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
			...options.headers,
		},
	});
	return handleResponse<T>(response);
};
