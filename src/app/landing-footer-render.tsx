"use client";

import { Footer, FOOTER_POSITIONS } from "@/features/footer/footer";
import { useMovieRecommendations } from "@/features/movie-recommendation/context";

/**
 * This component will render the footer depending on the results.
 */
export const LandingFooterRender = () => {
  const { results } = useMovieRecommendations();
  return results.length > 0 ? (
    <Footer position={FOOTER_POSITIONS.BOTTOM_STICKY} />
  ) : (
    <Footer position={FOOTER_POSITIONS.BOTTOM_ABSOLUTE} />
  );
};
