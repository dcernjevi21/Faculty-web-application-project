export interface FilmoviTmdbI {
	page: number;
	results: Array<FilmTmdbI>;
	total_pages: number;
	total_results: number;
}

export interface FilmTmdbI {
	id: number;
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	poster_path: string;
	release_date: string;
	title: string;
}

export interface OsobeTmdbI {
	page: number;
	results: Array<OsobaTmdbI>;
	total_pages: number;
	total_results: number;
}

export interface OsobaTmdbI {
	id: number;
	name: string;
	known_for: {
		title: string;
		id: number;
	}[];
	popularity: string;
	profile_path: string;
}

export interface ImageDataI {
      file_path: string,
  }
