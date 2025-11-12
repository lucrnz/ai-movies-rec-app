import { NextRequest } from "next/server";
import {
  AGENT_TOOL_NAME,
  buildMovieRecommendationAgent,
} from "@/features/movie-recommendation/agent";
import type { AgentResultItem } from "@/features/movie-recommendation/agent";
import { fetchMovieDetails } from "@/features/movies-api/fetch-movie-details";
import {
  sseEventSchema,
  type SSEEvent,
  type RecommendedMovie,
} from "@/features/movie-recommendation/schemas/sse-events";
import { StatusCodes } from "http-status-codes";
import { validateTurnstileToken } from "@/features/bot-verification/server-utils/validate-turnstile";
import { env } from "@/env";
import z from "zod";

const TURNSTILE_ENABLED = !!env.TURNSTILE_SECRET_KEY;

const encoder = new TextEncoder();

function formatSSE(event: SSEEvent): string {
  // Validate the event before serialization
  const validatedEvent = sseEventSchema.parse(event);
  return `data: ${JSON.stringify(validatedEvent)}\n\n`;
}

function createResponseForSingleEvent(event: SSEEvent): Response {
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: SSEEvent) =>
        controller.enqueue(encoder.encode(formatSSE(event)));

      send(event);
      controller.close();
    },
  });

  // Reason to always return OK - but what matters it the payload itself, because the SSE connection is technically OK.
  return new Response(stream, {
    status: StatusCodes.OK,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

const queryParamsSchema = z.object({
  query: z.string().min(1, "Query parameter is required"),
  turnstileToken: z
    .string()
    .optional()
    .refine((token) => {
      // If Turnstile is not enabled, any token is valid
      if (!TURNSTILE_ENABLED) return true;

      // If Turnstile is enabled, the token must be provided
      return !!token;
    }, "turnstileToken parameter is required"),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryParamsParsed = queryParamsSchema.safeParse(
    Object.fromEntries(searchParams),
  );

  if (!queryParamsParsed.success) {
    return createResponseForSingleEvent({
      type: "error",
      message: queryParamsParsed.error.issues
        .map(({ message }) => message)
        .join(", "),
    });
  }

  const { query: movieCriteria, turnstileToken } = queryParamsParsed.data;

  if (TURNSTILE_ENABLED) {
    if (!turnstileToken) {
      return createResponseForSingleEvent({
        type: "captcha-error",
        message: "Captcha verification failed",
      });
    }

    const validation = await validateTurnstileToken(turnstileToken);
    if (!validation.success) {
      return createResponseForSingleEvent({
        type: "captcha-error",
        message: "Captcha verification failed",
      });
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) =>
        controller.enqueue(encoder.encode(formatSSE(event)));

      try {
        // Build agent with event handlers
        const agentResults: AgentResultItem[] = await new Promise<
          AgentResultItem[]
        >(async (resolve, reject) => {
          let lastSearchMovieTitle = "";
          try {
            const agent = buildMovieRecommendationAgent({
              recommendedMoviesTotalTarget: 6,
              eventHandler: {
                tool_called: (toolName, params) => {
                  switch (toolName) {
                    case AGENT_TOOL_NAME.CONSULT_MOVIE_RECOMMENDATIONS:
                      send({
                        type: "progress",
                        message: "Consulting an AI model for recommendations",
                      });
                      break;
                    case AGENT_TOOL_NAME.SEARCH_MOVIES:
                      const { movieTitle } = params as { movieTitle: string };
                      lastSearchMovieTitle = movieTitle;
                      send({
                        type: "progress",
                        message: `Searching for "${movieTitle}"...`,
                      });
                      break;
                    default:
                      break;
                  }
                },
                tool_result: (toolName, result) => {
                  switch (toolName) {
                    case AGENT_TOOL_NAME.CONSULT_MOVIE_RECOMMENDATIONS:
                      send({
                        type: "progress",
                        message: "Considering recommendations from AI model",
                      });
                      break;
                    case AGENT_TOOL_NAME.SEARCH_MOVIES:
                      const typedResult = result as {
                        success: boolean;
                        results?: unknown[];
                      };
                      const count = typedResult.results?.length ?? 0;
                      send({
                        type: "progress",
                        message: `Found ${count} results for "${lastSearchMovieTitle}"`,
                      });
                      break;
                    default:
                      break;
                  }
                },
                agent_result: (result) => {
                  resolve(result);
                },
              },
            });

            // Run the agent
            await agent.generate({
              prompt: movieCriteria,
            });
          } catch (error) {
            reject(error);
          }
        });

        // Fetch and stream movie details progressively
        for (const movie of agentResults) {
          const movieDetails = await fetchMovieDetails(movie.id);

          if (movieDetails) {
            const enrichedMovie: RecommendedMovie = {
              ...movie,
              posterUrl: movieDetails.poster_path ?? null,
              overview: movieDetails.overview ?? null,
              releaseYear: movieDetails.release_date.includes("-")
                ? (movieDetails.release_date.split("-")?.at(0) ?? null)
                : null,
            };

            send({ type: "movie", data: enrichedMovie });
          }
        }

        // Send done event
        send({ type: "done" });
      } catch (error) {
        console.error("Error in SSE stream:", error);
        send({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
