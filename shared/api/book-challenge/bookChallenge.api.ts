import { requestAuth } from "../base";
import type {
	IBookChallenge,
	ICreateBookChallengePayload,
	IUpdateBookChallengePayload,
} from "./bookChallenge.types";

export const createChallenge = (
	payload: ICreateBookChallengePayload,
): Promise<IBookChallenge> =>
	requestAuth<IBookChallenge>("/book-challenge", {
		body: JSON.stringify(payload),
		method: "POST",
	});

export const getChallenges = (): Promise<IBookChallenge[]> =>
	requestAuth<IBookChallenge[]>("/book-challenge");

export const getChallengeById = (id: string): Promise<IBookChallenge> =>
	requestAuth<IBookChallenge>(`/book-challenge/${id}`);

export const updateChallenge = (
	id: string,
	payload: IUpdateBookChallengePayload,
): Promise<IBookChallenge> =>
	requestAuth<IBookChallenge>(`/book-challenge/${id}`, {
		body: JSON.stringify(payload),
		method: "PATCH",
	});

export const deleteChallenge = (id: string): Promise<void> =>
	requestAuth<void>(`/book-challenge/${id}`, { method: "DELETE" });
