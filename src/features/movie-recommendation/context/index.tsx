"use client";

import { createContext, useContext, useState, useRef } from "react";
import { env } from "@/env";
import {
  sseEventSchema,
  type RecommendedMovie,
} from "@/features/movie-recommendation/schemas/sse-events";

type MovieRecommendationsContextType = {
  results: RecommendedMovie[];
  query: string;
  isPending: boolean;
  progressMessage: string;
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
  const [isPending, setIsPending] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);

  const provideRecommendations = (newQuery: string) => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setQuery(newQuery);
    setResults([]);
    setIsPending(true);
    setProgressMessage("");

    const url = `${env.NEXT_PUBLIC_BASE_PATH}api/recommend?${new URLSearchParams({ query: newQuery })}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const parsedData: unknown = JSON.parse(event.data);
        // Validate the incoming SSE event with Zod
        const data = sseEventSchema.parse(parsedData);

        switch (data.type) {
          case "progress":
            setProgressMessage(data.message);
            break;

          case "movie":
            setResults((prev) => [...prev, data.data]);
            break;

          case "done":
            setIsPending(false);
            setProgressMessage("");
            eventSource.close();
            eventSourceRef.current = null;
            break;

          case "error":
            console.error("SSE Error:", data.message);
            setIsPending(false);
            setProgressMessage(`Error: ${data.message}`);
            eventSource.close();
            eventSourceRef.current = null;
            break;
        }
      } catch (error) {
        console.error("Failed to parse or validate SSE message:", error);
        setIsPending(false);
        setProgressMessage("Error: Invalid data received from server");
        eventSource.close();
        eventSourceRef.current = null;
      }
    };

    eventSource.onerror = () => {
      console.error("EventSource error");
      setIsPending(false);
      setProgressMessage("Connection error occurred");
      eventSource.close();
      eventSourceRef.current = null;
    };
  };

  return (
    <MovieRecommendationsContext.Provider
      value={{
        results,
        query,
        isPending,
        progressMessage,
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
