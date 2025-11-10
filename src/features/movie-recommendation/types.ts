export type Movie = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
};

export type MoviePaginatedResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results: Movie[];
};
