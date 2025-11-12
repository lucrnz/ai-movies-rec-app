"use client";

import { createContext, useContext, useState, useRef } from "react";
import { env } from "@/env";
import {
  sseEventSchema,
  type RecommendedMovie,
} from "@/features/movie-recommendation/schemas/sse-events";
import toast from "react-hot-toast";
import { AlertCircleIcon } from "lucide-react";

type MovieRecommendationsContextType = {
  results: RecommendedMovie[];
  query: string;
  isPending: boolean;
  progressMessage: string;
  provideRecommendations: (query: string, turnstileToken?: string) => void;
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

  const provideRecommendations = (
    newQuery: string,
    turnstileToken?: string,
  ) => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setQuery(newQuery);
    setResults([]);
    setIsPending(true);
    setProgressMessage("");

    const params = new URLSearchParams({ query: newQuery });
    if (turnstileToken) {
      params.set("turnstileToken", turnstileToken);
    }

    const url = `${env.NEXT_PUBLIC_BASE_PATH}api/recommend?${params}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    const notifyErrorToast = (message: string) => {
      toast.error(message, {
        icon: <AlertCircleIcon />,
      });
    };

    eventSource.addEventListener("message", (event) => {
      try {
        const data = sseEventSchema.parse(JSON.parse(event.data));

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
            notifyErrorToast(data.message);
            setIsPending(false);
            eventSource.close();
            eventSourceRef.current = null;
            break;

          case "captcha-error":
            notifyErrorToast(data.message);
            setIsPending(false);
            setProgressMessage("");
            eventSource.close();
            eventSourceRef.current = null;
            break;
        }
      } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : "Unknown error");

        toast.error("Something went wrong. Please try again.", {
          icon: <AlertCircleIcon />,
        });

        setIsPending(false);
        eventSource.close();
        eventSourceRef.current = null;
      }
    });

    eventSource.addEventListener("error", (event) => {
      console.error("SSE connection error", event);
      notifyErrorToast("Connection error occurred. Please try again.");
      setIsPending(false);
      eventSource.close();
      eventSourceRef.current = null;
      return;
    });
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
