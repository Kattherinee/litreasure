import type { IAuthorShort, IBookSeriesRelationType } from "../books";
import type { IUserBookStatus } from "../user-books";

export interface IByPromptRecomendationsParams {
	prompt: string;
	limit?: number;
}

export interface IByBookRecomendationsParams {
	bookId: string;
	limit?: number;
}

export interface IWeekBookRecomendation {
	id: string;
	title: string;
	author?: string;
	authors?: IAuthorShort[];
	searchMatches?: Array<{ field: string; value: string }>;
	coverUrl?: string;
	description?: string;
	relationType?: IBookSeriesRelationType | null;
	seriesLabel?: string | null;
	seriesTitle?: string | null;
	orderInSeries?: number | null;
	bookCountInSeries?: number | null;
}

export interface IBookRecomendation {
	id: string;
	title: string;
	author?: string;
	authors?: IAuthorShort[];
	authorId?: string;
	coverUrl?: string;
	publisher?: string;
	isTracked?: boolean;
	myStatus?: IUserBookStatus | null;
	relationType?: IBookSeriesRelationType;
	seriesLabel?: string;
	seriesTitle?: string;
	orderInSeries?: number;
	bookCountInSeries?: number;
}
