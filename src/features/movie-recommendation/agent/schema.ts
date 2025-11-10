import z from "zod";

export const recommendedMovieSchema = z.object({
  id: z.number().describe("TMDB movie id"),
  title: z.string().describe("Movie title"),
  reason: z
    .string()
    .describe("Reason for recommending the movie")
    .min(50, "Reason should be at least 50 characters")
    .max(100, "Reason should be less than 100 characters"),
});

export type RecommendedMovie = z.infer<typeof recommendedMovieSchema>;
