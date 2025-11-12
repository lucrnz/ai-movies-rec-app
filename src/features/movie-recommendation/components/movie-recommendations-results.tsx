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
                <p className="flex flex-row items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="m22 19.125l-2-2V7h-4.05l-1.825-2h-4.25l-.95 1.05L7.5 4.625L9 3h6l1.85 2H20q.825 0 1.413.588T22 7zM4 21q-.825 0-1.412-.587T2 19V7q0-.825.588-1.412T4 5h1.025l2 2H4v12h15.025l2 2zm11.65-5.375q-.625.85-1.562 1.363T12 17.5q-1.875 0-3.187-1.312T7.5 13q0-1.15.513-2.087T9.375 9.35l1.45 1.45q-.6.325-.962.9T9.5 13q0 1.05.725 1.775T12 15.5q.725 0 1.3-.363t.9-.962zM15.2 9.8q.625.6.963 1.425T16.5 13v.3q0 .15-.025.3L11.4 8.525q.15-.025.3-.025h.3q.95 0 1.775.338T15.2 9.8m5.275 13.5L.675 3.5L2.1 2.075l19.8 19.8zM14.45 11.575"
                    />
                  </svg>
                  <span className="text-neutral-600 dark:text-neutral-400 text-sm">
                    No poster available
                  </span>
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
                {result.releaseYear && (
                  <span className="text-neutral-600 dark:text-neutral-400 text-lg pt-1 font-light">
                    ({result.releaseYear})
                  </span>
                )}
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
