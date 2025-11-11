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

function formatSSE(event: SSEEvent): string {
  // Validate the event before serialization
  const validatedEvent = sseEventSchema.parse(event);
  return `data: ${JSON.stringify(validatedEvent)}\n\n`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const movieCriteria = searchParams.get("query");

  if (!movieCriteria) {
    return new Response(
      JSON.stringify({ error: "Movie criteria query parameter is required" }),
      {
        status: StatusCodes.BAD_REQUEST,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(formatSSE(event)));
      };

      try {
        let agentResults: AgentResultItem[] = [];

        let lastSearchMovieTitle = "";

        // Build agent with event handlers
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
                  const movieName = params.query;
                  lastSearchMovieTitle = movieName;
                  send({
                    type: "progress",
                    message: `Searching for "${movieName}"...`,
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
              agentResults = result;
            },
          },
        });

        // Run the agent
        await agent.generate({
          prompt: movieCriteria,
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
                ? movieDetails.release_date.split("-")[0]
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
