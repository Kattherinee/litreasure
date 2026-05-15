import { requestAuth } from "../base";
import type {
	BookChallenge,
	CreateBookChallengePayload,
	UpdateBookChallengePayload,
} from "./bookChallenge.types";

export const createChallenge = (
	payload: CreateBookChallengePayload,
): Promise<BookChallenge> =>
	requestAuth<BookChallenge>("/book-challenge", {
		body: JSON.stringify(payload),
		method: "POST",
	});

export const getChallenges = (): Promise<BookChallenge[]> =>
	requestAuth<BookChallenge[]>("/book-challenge");

export const getChallengeById = (id: string): Promise<BookChallenge> =>
	requestAuth<BookChallenge>(`/book-challenge/${id}`);

export const updateChallenge = (
	id: string,
	payload: UpdateBookChallengePayload,
): Promise<BookChallenge> =>
	requestAuth<BookChallenge>(`/book-challenge/${id}`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});

export const deleteChallenge = (id: string): Promise<void> =>
	requestAuth<void>(`/book-challenge/${id}`, { method: "DELETE" });
