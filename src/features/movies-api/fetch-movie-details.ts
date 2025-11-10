import { env } from "@/env";
import { TMDB_API_BASE } from "./const";
import { Movie } from "./types";
import { StatusCodes } from "http-status-codes";

export async function fetchMovieDetails(
  movieId: number,
): Promise<Movie | null> {
  try {
    const url = `${TMDB_API_BASE}/movie/${movieId}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.TMDB_API_KEY}`,
      },
    });

    if (!response.ok) {
      if (response.status === StatusCodes.NOT_FOUND) {
        return null;
      }

      throw new Error(
        `TMDB API error for movie ${movieId}: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as Movie;

    return data;
  } catch (error) {
    console.error(`Error fetching movie details for movie ${movieId}:`, error);
    return null;
  }
}
