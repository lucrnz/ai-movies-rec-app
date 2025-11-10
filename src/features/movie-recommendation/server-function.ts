"use server";

import { buildMovieRecommendationAgent } from "./agent/movie-rec-agent";
import { clone } from "@es-toolkit/es-toolkit";
import { RecommendedMovie } from "./agent/schema";

export const recommendMovies = async (movieCriteria: string) => {
  const resultPromise = new Promise<RecommendedMovie[]>(async (resolve) => {
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

  return await resultPromise;
};
