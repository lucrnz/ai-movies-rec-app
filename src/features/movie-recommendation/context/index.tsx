"use client";

import { createContext, useContext, useState, useTransition } from "react";
import type {} from "@/features/movie-recommendation/server-function";
import {
  recommendMovies,
  type RecommendedMovie,
} from "@/features/movie-recommendation/server-function";

type MovieRecommendationsContextType = {
  results: RecommendedMovie[];
  query: string;
  isPending: boolean;
  provideRecommendations: (query: string) => void;
};

const MovieRecommendationsContext = createContext<
  MovieRecommendationsContextType | undefined
>(undefined);

export function MovieRecommendationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [results, setResults] = useState<RecommendedMovie[]>([]);
  const [query, setQuery] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const provideRecommendations = (newQuery: string) => {
    setQuery(newQuery);
    startTransition(async () => {
      const data = await recommendMovies(newQuery);
      setResults(data);
    });
  };

  return (
    <MovieRecommendationsContext.Provider
      value={{
        results,
        query,
        isPending,
        provideRecommendations,
      }}
    >
      {children}
    </MovieRecommendationsContext.Provider>
  );
}

export function useMovieRecommendations() {
  const context = useContext(MovieRecommendationsContext);
  if (context === undefined) {
    throw new Error(
      "useMovieRecommendations must be used within a MovieRecommendationsProvider",
    );
  }
  return context;
}
