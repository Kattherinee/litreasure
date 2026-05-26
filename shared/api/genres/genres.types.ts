export interface IGenre {
	id: string;
	name: string;
	slug: string;
	bookCount?: number;
	category?: string;
	group?: string;
	isSaved?: boolean;
}

export interface IGenreGroup {
	key: string;
	name: string;
	category: string;
	bookCount: number;
	genres: IGenre[];
}

export interface IGenresByCategoryResponse {
	groups: IGenreGroup[];
	recommendations: IGenre[];
}
