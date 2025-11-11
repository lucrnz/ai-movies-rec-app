import {
  MovieRecommendationsSearch,
  MovieRecommendationsResults,
} from "@/features/movie-recommendation/components";
import { MovieRecommendationsProvider } from "@/features/movie-recommendation/context";
import { LandingFooterRender } from "../features/landing/landing-footer-render";

export default function Home() {
  return (
    <MovieRecommendationsProvider>
      <div className="flex flex-col items-center justify-center min-h-24">
        <h1 className="text-2xl md:text-4xl font-display font-semibold mb-4 text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-rose-700 dark:from-sky-300 dark:to-rose-400">
          Movie Recommendations App
        </h1>
        <p className="text-lg font-body mb-4">
          Know exactly what movies to watch next
        </p>
        <MovieRecommendationsSearch />
        <br className="invisible h-4" aria-hidden="true" />
        <MovieRecommendationsResults />
      </div>
      <LandingFooterRender />
    </MovieRecommendationsProvider>
  );
}
