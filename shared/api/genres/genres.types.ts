export interface IGenre {
	id: string;
	name: string;
	slug: string;
}

export interface IGenreItem {
	id: string;
	name: string;
	slug: string;
	category: string;
	subcategory: string;
}

export interface IGenreSubcategory {
	subcategory: string;
	genres: IGenreItem[];
}

export interface IGenreCategory {
	category: string;
	subcategories: IGenreSubcategory[];
}
