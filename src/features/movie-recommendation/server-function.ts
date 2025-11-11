"use server";

import type { RecommendedMovie } from "./types";
import type { AgentResultItem } from "./agent";
import { buildMovieRecommendationAgent } from "./agent";
import { clone } from "@es-toolkit/es-toolkit";
import { fetchMovieDetails } from "../movies-api/fetch-movie-details";

export const recommendMovies = async (movieCriteria: string) => {
  const resultPromise = new Promise<AgentResultItem[]>(async (resolve) => {
    const { agent } = buildMovieRecommendationAgent({
      recommendedMoviesTotalTarget: 5,
      onResult: (result) => {
        resolve(clone(result));
      },
    });

    await agent.generate({
      prompt: movieCriteria,
    });
  });

  const results = await resultPromise;

  // Fetch poster URLs for all movies in parallel
  const resultsWithDetails = (
    await Promise.all(
      results.map(async (movie) => {
        const movieDetails = await fetchMovieDetails(movie.id);

        if (!movieDetails) {
          return null;
        }

        const item: RecommendedMovie = {
          ...movie,
          posterUrl: movieDetails.poster_path ?? null,
          overview: movieDetails.overview ?? null,
          releaseDate: movieDetails.release_date ?? null,
        };

        return item;
      }),
    )
  ).filter((x) => x !== null);

  return resultsWithDetails;
};
