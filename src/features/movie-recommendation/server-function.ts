"use server";

import type { AgentResultItem } from "./agent";
import { buildMovieRecommendationAgent } from "./agent";
import { clone } from "@es-toolkit/es-toolkit";
import { fetchMovieDetails } from "../movies-api/fetch-movie-details";

export type RecommendedMovie = {
  id: number;
  title: string;
  reason: string;
  posterUrl: string | null;
  overview: string | null;
  releaseYear: string | null;
};

export const recommendMovies = async (movieCriteria: string) => {
  const resultPromise = new Promise<AgentResultItem[]>(async (resolve) => {
    const agent = buildMovieRecommendationAgent({
      recommendedMoviesTotalTarget: 5,
      onResult: (result) => {
        resolve(clone(result));
      },
    });

    await agent.generate({
      prompt: movieCriteria,
    });
  });

  // Wait for the agent to generate the results
  const results = await resultPromise;

  // Fetch movie details for all movies in parallel
  const resultsWithDetails = (
    await Promise.all(
      results.map(async (movie) => {
        const movieDetails = await fetchMovieDetails(movie.id);
        if (!movieDetails) return null;

        const item: RecommendedMovie = {
          ...movie,
          posterUrl: movieDetails.poster_path ?? null,
          overview: movieDetails.overview ?? null,
          releaseYear: movieDetails.release_date.includes("-")
            ? movieDetails.release_date.split("-")[0]
            : null,
        };

        return item;
      }),
    )
  ).filter((x) => x !== null);

  return resultsWithDetails;
};
