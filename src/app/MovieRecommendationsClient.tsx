"use client";

import type { RecommendedMovie } from "@/features/movie-recommendation/types";
import { recommendMovies } from "@/features/movie-recommendation/server-function";
import { useState, useTransition } from "react";
import Image from "next/image";
import { TMDB_IMAGE_BASE } from "@/features/movies-api/const";

export function MovieRecommendationsClient() {
  const [results, setResults] = useState<RecommendedMovie[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    const form = ev.currentTarget;
    const formData = new FormData(form);
    const query = formData.get("query") as string;
    ev.preventDefault();

    startTransition(async () => {
      const data = await recommendMovies(query);
      setResults(data);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        className="textarea min-w-3xs"
        placeholder="Enter your movie criteria"
        name="query"
        required
      ></textarea>

      <button type="submit" disabled={isPending} className="btn btn-primary">
        {isPending && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="animate-spin"
          >
            <path
              fill="currentColor"
              d="M12 22q-2.05 0-3.875-.788t-3.187-2.15t-2.15-3.187T2 12q0-2.075.788-3.887t2.15-3.175t3.187-2.15T12 2q.425 0 .713.288T13 3t-.288.713T12 4Q8.675 4 6.337 6.338T4 12t2.338 5.663T12 20t5.663-2.337T20 12q0-.425.288-.712T21 11t.713.288T22 12q0 2.05-.788 3.875t-2.15 3.188t-3.175 2.15T12 22"
            />
          </svg>
        )}
        {isPending ? "Searching..." : "Search"}
      </button>

      {results.length > 0 && (
        <ul className="list-none flex flex-col gap-4">
          {results.map((result) => (
            <li
              key={result.id}
              className="border border-gray-300 rounded-md p-4 flex gap-4"
            >
              {result.posterUrl && (
                <Image
                  decoding="async"
                  src={`${TMDB_IMAGE_BASE}${result.posterUrl}`}
                  alt={`${result.title} poster`}
                  width={500}
                  height={735}
                  className="w-[500px] aspect-auto object-cover rounded-md flex-shrink-0"
                />
              )}
              <div className="flex flex-col gap-2">
                <h3 className="font-display font-semibold">{result.title}</h3>
                <p>{result.releaseDate}</p>
                <p>{result.overview}</p>
                <p>Recommended because: {result.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
