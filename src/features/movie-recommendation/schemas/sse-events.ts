import z from "zod";
import { agentResultItemSchema } from "../agent/schema";

// Schema for recommended movie with enriched details
export const recommendedMovieSchema = agentResultItemSchema.extend({
  posterUrl: z.string().nullable(),
  overview: z.string().nullable(),
  releaseYear: z.string().nullable(),
});

// Schema for progress event
export const sseProgressEventSchema = z.object({
  type: z.literal("progress"),
  message: z.string(),
});

// Schema for movie event
export const sseMovieEventSchema = z.object({
  type: z.literal("movie"),
  data: recommendedMovieSchema,
});

// Schema for done event
export const sseDoneEventSchema = z.object({
  type: z.literal("done"),
});

// Schema for error event
export const sseErrorEventSchema = z.object({
  type: z.literal("error"),
  message: z.string(),
});

export const sseCaptchaErrorEventSchema = z.object({
  type: z.literal("captcha-error"),
  message: z.string(),
});

// Discriminated union of all SSE events
export const sseEventSchema = z.discriminatedUnion("type", [
  sseProgressEventSchema,
  sseMovieEventSchema,
  sseDoneEventSchema,
  sseErrorEventSchema,
  sseCaptchaErrorEventSchema,
]);

// Inferred TypeScript types
export type RecommendedMovie = z.infer<typeof recommendedMovieSchema>;
export type SSEProgressEvent = z.infer<typeof sseProgressEventSchema>;
export type SSEMovieEvent = z.infer<typeof sseMovieEventSchema>;
export type SSEDoneEvent = z.infer<typeof sseDoneEventSchema>;
export type SSEErrorEvent = z.infer<typeof sseErrorEventSchema>;
export type SSECaptchaErrorEvent = z.infer<typeof sseCaptchaErrorEventSchema>;
export type SSEEvent = z.infer<typeof sseEventSchema>;
