export type IChallengePeriodType = "month" | "week" | "year";
export type IChallengeType = "books";

export interface IBookChallenge {
	id: string;
	type: IChallengeType;
	periodType: IChallengePeriodType;
	targetValue: number;
	startDate: string;
	endDate: string;
	isActive: boolean;
}

export interface ICreateBookChallengePayload {
	type: IChallengeType;
	periodType: IChallengePeriodType;
	targetValue: number;
	startDate: string;
	endDate: string;
	isActive?: boolean;
}

export type IUpdateBookChallengePayload = Partial<ICreateBookChallengePayload>;
