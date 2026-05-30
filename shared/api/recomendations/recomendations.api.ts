import { requestOptionalAuth } from "../base";
import type {
	IByBookRecomendationsParams,
	IByPromptRecomendationsParams,
	IBookRecomendation,
	IWeekBookRecomendation,
} from "./recomendations.types";

export const getRecomendationsByPrompt = async ({
	params,
}: {
	params: IByPromptRecomendationsParams;
}): Promise<IWeekBookRecomendation[]> => {
	const response = await requestOptionalAuth<IWeekBookRecomendation[]>(
		`/recommendations/prompt`,
		{
			body: JSON.stringify(params),
			method: "POST",
		},
	);

	return response;
};

export const getRecomendationsWeekBooks = (): Promise<
	IWeekBookRecomendation[]
> =>
	requestOptionalAuth<IWeekBookRecomendation[]>("/recommendations/week-books");

export const getRecomendationsByBook = async ({
	params,
}: {
	params: IByBookRecomendationsParams;
}): Promise<IBookRecomendation[]> => {
	const response = await requestOptionalAuth<IBookRecomendation[]>(
		`/recommendations/book`,
		{
			body: JSON.stringify(params),
			method: "POST",
		},
	);

	return response;
};
