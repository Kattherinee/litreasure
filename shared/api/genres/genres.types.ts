export interface IGenre {
	id: string;
	name: string;
	slug: string;
	bookCount?: number;
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
