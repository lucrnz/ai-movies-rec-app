"use client";

import { LoaderCircleIcon, SearchIcon } from "lucide-react";
import { useMovieRecommendations } from "../context";
import { useRef } from "react";
import clsx from "clsx";

const EXAMPLE_QUERIES = [
  "existential sci-fi about identity",
  "slow-burn thrillers with brilliant twists",
  "dark comedies about dysfunctional families",
  "aesthetic indie films with surreal vibes",
];

export const MovieRecommendationsSearch = () => {
  const { isPending, results, progressMessage, provideRecommendations } =
    useMovieRecommendations();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    const form = ev.currentTarget;
    const formData = new FormData(form);
    const query = (formData.get("query") ?? "") as string;
    ev.preventDefault();
    if (!query) return;
    provideRecommendations(query);
  };

  const handleSelectExampleQuery = (query: string) => {
    const form = formRef.current;
    if (!form) return;
    const input = form.querySelector(
      "input[name='query']",
    ) as HTMLInputElement | null;

    if (!input) return;
    input.value = query;
    form.requestSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        "w-full flex flex-col gap-4 items-center justify-center",
        results.length > 0 && "mb-4",
      )}
      ref={formRef}
    >
      <div className="md:w-96 lg:w-[500px] flex flex-row gap-2 items-center">
        <input
          type="search"
          className="input w-full"
          placeholder="Enter your movie criteria"
          name="query"
          autoComplete="off"
          required
        ></input>

        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <SearchIcon />
          )}
          {isPending ? "Searching..." : "Search"}
        </button>
      </div>

      {isPending && progressMessage && (
        <div className="text-sm text-gray-600 animate-pulse">
          {progressMessage}
        </div>
      )}

      {!isPending && results.length === 0 && (
        <div className="flex flex-row gap-4">
          {EXAMPLE_QUERIES.map((query) => (
            <button
              type="button"
              key={query}
              className="btn btn-outline text-sm font-normal"
              onClick={() => handleSelectExampleQuery(query)}
            >
              {query}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};
