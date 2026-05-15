export interface Genre {
	id: string;
	name: string;
	slug: string;
}

export interface GenreItem {
	id: string;
	name: string;
	slug: string;
	category: string;
	subcategory: string;
}

export interface GenreSubcategory {
	subcategory: string;
	genres: GenreItem[];
}

export interface GenreCategory {
	category: string;
	subcategories: GenreSubcategory[];
}
