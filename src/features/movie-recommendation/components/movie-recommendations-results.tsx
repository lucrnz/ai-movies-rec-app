"use client";

import Image from "next/image";
import { useMovieRecommendations } from "../context";
import { TMDB_IMAGE_BASE } from "@/features/movies-api/const";
import { LightbulbIcon } from "lucide-react";

export const MovieRecommendationsResults = () => {
  const { results } = useMovieRecommendations();
  return (
    <ul className="list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {results.map((result) => (
        <li
          key={result.id}
          className="card bg-base-100 w-96 shadow-sm hover:scale-105 transition-all duration-300 dark:border-neutral-600 dark:border pt-6"
        >
          <figure>
            {result.posterUrl ? (
              <Image
                decoding="async"
                src={`${TMDB_IMAGE_BASE}${result.posterUrl}`}
                alt={`${result.title} poster`}
                width={250}
                height={375}
                className="aspect-auto object-cover rounded-md shrink-0"
              />
            ) : (
              <div className="aspect-auto w-[250px] h-[375px] object-cover rounded-md shrink-0 bg-neutral-200 dark:bg-neutral-700 flex flex-col items-center justify-center select-none">
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  No poster available
                </p>
              </div>
            )}
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              <span className="flex flex-row items-center gap-2">
                <span className="text-2xl font-display font-semibold">
                  {result.title}
                </span>
                <span className="text-neutral-600 dark:text-neutral-400 text-lg pt-1 font-light">
                  ({result.releaseYear})
                </span>
              </span>
            </h2>
            <div className="flex flex-row items-center gap-1">
              <LightbulbIcon />{" "}
              <span className="text-indigo-500 dark:text-indigo-400">
                Recommended for you because
              </span>
            </div>
            <p className="mb-4">{result.reason}</p>

            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Overview:
            </span>
            <p>{result.overview}</p>

            <div className="card-actions justify-end">
              <a
                href={`https://www.youtube.com/results?${new URLSearchParams({
                  search_query: `${result.title} trailer`,
                })}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Search trailer
              </a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
