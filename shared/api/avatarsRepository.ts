import { request } from "./books";
import { useQuery } from "@tanstack/react-query";

export type IAvatar = {
	id: string;
	url: string;
};

type AvatarsResponse = IAvatar[] | { avatars?: unknown };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const normalizeAvatars = (response: AvatarsResponse): IAvatar[] => {
	const avatars = Array.isArray(response) ? response : response.avatars;

	if (!Array.isArray(avatars)) {
		return [];
	}

	return avatars.flatMap((avatar) => {
		if (!avatar || typeof avatar !== "object") {
			return [];
		}

		const candidate = avatar as { id?: unknown; url?: unknown };

		if (typeof candidate.id !== "string" || typeof candidate.url !== "string") {
			return [];
		}

		return [
			{
				id: candidate.id,
				url: candidate.url,
			},
		];
	});
};

export const getAvatarAssetUrl = (url?: string) => {
	if (!url) {
		return undefined;
	}

	if (/^https?:\/\//i.test(url)) {
		return url;
	}

	return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

export const getAvatars = async () => {
	const avatars = await request<AvatarsResponse>("/avatars/options");

	return normalizeAvatars(avatars);
};

export const useAvatarsQuery = (options?: { enabled?: boolean }) =>
	useQuery<IAvatar[]>({
		enabled: options?.enabled,
		queryFn: getAvatars,
		queryKey: ["avatars"],
	});
