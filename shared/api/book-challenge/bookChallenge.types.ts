export type ChallengePeriodType = "month" | "week" | "year";
export type ChallengeType = "books";

export type BookChallenge = {
	id: string;
	type: ChallengeType;
	periodType: ChallengePeriodType;
	targetValue: number;
	startDate: string;
	endDate: string;
	isActive: boolean;
};

export type CreateBookChallengePayload = {
	type: ChallengeType;
	periodType: ChallengePeriodType;
	targetValue: number;
	startDate: string;
	endDate: string;
	isActive?: boolean;
};

export type UpdateBookChallengePayload = Partial<CreateBookChallengePayload>;
