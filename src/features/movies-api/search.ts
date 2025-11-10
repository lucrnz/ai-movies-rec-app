import { env } from "@/env";
import { MoviePaginatedResponse } from "./types";

export async function searchMovies(query: string, page: number) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?${new URLSearchParams({
      query,
      page: page.toString(),
    })}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.TMDB_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to search movies: ${response.statusText}`);
  }

  const data: MoviePaginatedResponse = await response.json();
  return data;
}
