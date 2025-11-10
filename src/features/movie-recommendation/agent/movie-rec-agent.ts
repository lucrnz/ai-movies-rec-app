import { Experimental_Agent as Agent, tool } from "ai";
import {
  getAILanguageModel,
  AI_MODEL_FOR_TASK,
} from "@/features/ai/pick-model";
import z from "zod";
import { generateText } from "ai-sdk-ollama";
import { Movie } from "@/features/movies-api/types";
import { searchMovies } from "@/features/movies-api/search";
import { agentResultItemSchema, type AgentResultItem } from "./schema";

type AgentBuildOptions = {
  recommendedMoviesTotalTarget?: number;
  onResult: (result: AgentResultItem[]) => void;
};

export const buildMovieRecommendationAgent = ({
  recommendedMoviesTotalTarget = 10,
  onResult,
}: AgentBuildOptions) => {
  const TOOL_NAMES = {
    SEARCH_MOVIES: "searchMovies",
    CONSULT_MOVIE_RECOMMENDATIONS: "consultMovieRecommendations",
    PICK_FINAL_ANSWER: "pickFinalAnswer",
  } as const;

  const maxSearchAllowed = Math.floor(recommendedMoviesTotalTarget * 1.5);

  const searchMoviesTool = tool({
    name: TOOL_NAMES.SEARCH_MOVIES,
    description: `Search TMDB for movies based on a text query. You can only search for movies ${maxSearchAllowed} times.`,
    inputSchema: z.object({
      query: z.string().describe("Query to search for"),
      page: z.number().describe("Page number to fetch").default(1),
    }),
    execute: async ({ query, page }) => {
      console.log("[tool] searching movies", query, page);
      toolsCalled.push(TOOL_NAMES.SEARCH_MOVIES);

      if (
        toolsCalled.filter((x) => x === TOOL_NAMES.SEARCH_MOVIES).length >=
        maxSearchAllowed
      ) {
        return {
          success: false,
          message: `You can only search for movies ${maxSearchAllowed} times.`,
        };
      }

      const results: Partial<Movie>[] = (
        await searchMovies(query, page)
      ).results
        .slice(0, 10)
        .map((m: Movie) => ({
          id: m.id,
          title: m.title,
          overview: m.overview,
        }));

      console.log("[tool] [searchMovies] results", results);

      return {
        success: true,
        results,
      };
    },
  });

  const toolsCalled: string[] = [];

  const consultMovieRecommendationsTool = tool({
    name: TOOL_NAMES.CONSULT_MOVIE_RECOMMENDATIONS,
    description:
      "Consult movie recommendations based on the user-provided movie criteria.",
    inputSchema: z.object({
      movieCriteria: z
        .string()
        .describe(
          "Movie criteria in natural language. Example: 'I want to watch a movie about a detective solving a case.'",
        )
        .min(10, "Movie criteria should be at least 10 characters"),
    }),
    execute: async ({ movieCriteria }) => {
      console.log(
        "[agent] [tool] consulting movie recommendations",
        movieCriteria,
      );

      if (toolsCalled.includes(TOOL_NAMES.CONSULT_MOVIE_RECOMMENDATIONS)) {
        return {
          success: false,
          message: "You can only consult movie recommendations once.",
        };
      }

      toolsCalled.push(TOOL_NAMES.CONSULT_MOVIE_RECOMMENDATIONS);

      const { text } = await generateText({
        model: getAILanguageModel(AI_MODEL_FOR_TASK.RECOMMENDER),
        messages: [
          {
            role: "system",
            content: `You are a movie recommendation export. You should help the user find movies that match the given criteria.
            You should recommend ${recommendedMoviesTotalTarget} movies.
            You should always give a reason why you are recommending the movie.
            You never recommend the same movie twice.
            Be brief and to the point. Do not ask follow up questions.`,
          },
          {
            role: "user",
            content: movieCriteria,
          },
        ],
      });
      console.log("[agent] [tool] movie recommendations", text);
      return {
        success: true,
        message: text,
      };
    },
  });

  const pickFinalAnswerTool = tool({
    name: TOOL_NAMES.PICK_FINAL_ANSWER,
    description: "Pick the final answer from the agent",
    inputSchema: z.object({
      answer: z
        .array(agentResultItemSchema)
        .min(
          recommendedMoviesTotalTarget,
          `You must set an array of at least ${recommendedMoviesTotalTarget} movies`,
        ),
    }),
    execute: async ({ answer }) => {
      console.log("[agent] [tool] picking final answer", answer);

      if (toolsCalled.includes(TOOL_NAMES.PICK_FINAL_ANSWER)) {
        return {
          success: false,
          message: "You can only pick the final answer once.",
        };
      }

      toolsCalled.push(TOOL_NAMES.PICK_FINAL_ANSWER);

      onResult(answer);

      return {
        success: true,
        message: "Picked the final answer successfully. Your job is done.",
      };
    },
  });

  const systemPrompt = [
    "You are a movie recommendation assistant.",
    "You are given a movie criteria and you need to recommend movies that match that criteria.",
    "Instructions:",
    "1. Use the consultMovieRecommendations tool to get recommendations based on the user-provided movie criteria.",
    "2. Use the searchMovies tool to find the movies that match the recommendations, by using the title of the movie.",
    "Final answer:",
    `You must return an array of ${recommendedMoviesTotalTarget} movies, each should include it's title, the movie id (exact match), and a reason for recommending the movie.`,
  ].join("\n");

  const agent = new Agent({
    model: getAILanguageModel(AI_MODEL_FOR_TASK.AGENT),
    system: systemPrompt,
    tools: {
      consultMovieRecommendations: consultMovieRecommendationsTool,
      searchMovies: searchMoviesTool,
      pickFinalAnswer: pickFinalAnswerTool,
    },
    toolChoice: "required",
    stopWhen: [
      () => {
        const hasPickedFinalAnswer = toolsCalled.includes(
          TOOL_NAMES.PICK_FINAL_ANSWER,
        );

        console.log(
          "[agent] [stopWhen] hasPickedFinalAnswer",
          hasPickedFinalAnswer,
        );

        const hasConsultedMovieRecommendations = toolsCalled.includes(
          TOOL_NAMES.CONSULT_MOVIE_RECOMMENDATIONS,
        );

        console.log(
          "[agent] [stopWhen] hasConsultedMovieRecommendations",
          hasConsultedMovieRecommendations,
        );

        const searchesUsed = toolsCalled.filter(
          (x) => x === TOOL_NAMES.SEARCH_MOVIES,
        ).length;

        console.log("[agent] [stopWhen] searchedMovies", searchesUsed);

        return (
          hasPickedFinalAnswer &&
          hasConsultedMovieRecommendations &&
          searchesUsed >= recommendedMoviesTotalTarget
        );
      },
    ],
  });

  return {
    agent,
  };
};
