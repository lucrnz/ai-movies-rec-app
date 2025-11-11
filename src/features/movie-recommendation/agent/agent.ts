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

export const AGENT_EVENT = {
  TOOL_CALLED: "tool_called",
  TOOL_RESULT: "tool_result",
  AGENT_RESULT: "agent_result",
} as const;

export const AGENT_TOOL_NAME = {
  SEARCH_MOVIES: "searchMovies",
  CONSULT_MOVIE_RECOMMENDATIONS: "consultMovieRecommendations",
  PICK_FINAL_ANSWER: "pickFinalAnswer",
} as const;

export type ToolName = (typeof AGENT_TOOL_NAME)[keyof typeof AGENT_TOOL_NAME];

export type AgentEvent = (typeof AGENT_EVENT)[keyof typeof AGENT_EVENT];

type AgentBuildOptions = {
  recommendedMoviesTotalTarget?: number;
  eventHandler: {
    [AGENT_EVENT.TOOL_CALLED]: (
      toolName: ToolName,
      params: Record<string, string>,
    ) => void;
    [AGENT_EVENT.TOOL_RESULT]: (toolName: ToolName, result: unknown) => void;
    [AGENT_EVENT.AGENT_RESULT]: (result: AgentResultItem[]) => void;
  };
};

export const buildMovieRecommendationAgent = ({
  recommendedMoviesTotalTarget = 10,
  eventHandler,
}: AgentBuildOptions) => {
  /**
   * The maximum number of times the search agent can be used.
   */
  const MAX_SEARCHES_ALLOWED = Math.floor(recommendedMoviesTotalTarget * 1.7);

  /**
   * The maximum number of times the recommendation agent can be consulted.
   */
  const MAX_CONSULTATIONS_ALLOWED = 2;

  /**
   * The number of movies that the recommendation agent will recommend.
   */
  const RECOMENDATION_AGENT_MOVIES_COUNT = Math.floor(
    recommendedMoviesTotalTarget * 1.7,
  );

  const searchMoviesTool = tool({
    name: AGENT_TOOL_NAME.SEARCH_MOVIES,
    description: `Search TMDB for movies based on a text query. You can only search for movies ${MAX_SEARCHES_ALLOWED} times.`,
    inputSchema: z.object({
      query: z.string().describe("Query to search for"),
      page: z.number().describe("Page number to fetch").default(1),
    }),
    execute: async ({ query, page }) => {
      toolsCalled.push(AGENT_TOOL_NAME.SEARCH_MOVIES);

      if (
        toolsCalled.filter((x) => x === AGENT_TOOL_NAME.SEARCH_MOVIES).length >=
        MAX_SEARCHES_ALLOWED
      ) {
        return {
          success: false,
          message: `You can only search for movies ${MAX_SEARCHES_ALLOWED} times.`,
        };
      }

      eventHandler[AGENT_EVENT.TOOL_CALLED](AGENT_TOOL_NAME.SEARCH_MOVIES, {
        query,
        page: page.toString(),
      });

      const results: Partial<Movie>[] = (
        await searchMovies(query, page)
      ).results
        .slice(0, 10)
        .map((m: Movie) => ({
          id: m.id,
          title: m.title,
          overview: m.overview,
        }));

      eventHandler[AGENT_EVENT.TOOL_RESULT](AGENT_TOOL_NAME.SEARCH_MOVIES, {
        results,
      });

      return {
        success: true,
        results,
      };
    },
  });

  const toolsCalled: string[] = [];

  const consultMovieRecommendationsTool = tool({
    name: AGENT_TOOL_NAME.CONSULT_MOVIE_RECOMMENDATIONS,
    description:
      "Consult movie recommendations based on natural language movie criteria.",
    inputSchema: z.object({
      movieCriteria: z
        .string()
        .describe(
          "Movie criteria in natural language. Example: 'I want to watch a movie about a detective solving a case.'",
        )
        .min(10, "Movie criteria should be at least 10 characters"),
    }),
    execute: async ({ movieCriteria }) => {
      if (
        toolsCalled.filter(
          (x) => x === AGENT_TOOL_NAME.CONSULT_MOVIE_RECOMMENDATIONS,
        ).length >= MAX_CONSULTATIONS_ALLOWED
      ) {
        return {
          success: false,
          message: `You can only consult movie recommendations ${MAX_CONSULTATIONS_ALLOWED} times.`,
        };
      }

      eventHandler[AGENT_EVENT.TOOL_CALLED](
        AGENT_TOOL_NAME.CONSULT_MOVIE_RECOMMENDATIONS,
        {
          movieCriteria,
        },
      );

      toolsCalled.push(AGENT_TOOL_NAME.CONSULT_MOVIE_RECOMMENDATIONS);

      const { text: recommendationText } = await generateText({
        model: getAILanguageModel(AI_MODEL_FOR_TASK.RECOMMENDER),
        messages: [
          {
            role: "system",
            content: [
              "You are a movie recommendation export. You should help the user find movies that match the given criteria.",
              `You should recommend ${RECOMENDATION_AGENT_MOVIES_COUNT} movies.`,
              "You should always give a reason why you are recommending the movie.",
              "You never recommend the same movie twice.",
              "Be brief and to the point. Do not use markdown formatting or tables. Do not ask follow up questions.",
            ].join("\n"),
          },
          {
            role: "user",
            content: movieCriteria,
          },
        ],
      });

      eventHandler[AGENT_EVENT.TOOL_RESULT](
        AGENT_TOOL_NAME.CONSULT_MOVIE_RECOMMENDATIONS,
        {
          recommendationText,
        },
      );

      return {
        success: true,
        message: recommendationText,
      };
    },
  });

  const pickFinalAnswerTool = tool({
    name: AGENT_TOOL_NAME.PICK_FINAL_ANSWER,
    description: "Pick the final answer from the agent",
    inputSchema: z.object({
      answer: z
        .array(agentResultItemSchema)
        .min(
          recommendedMoviesTotalTarget,
          `You must set an array of at least ${recommendedMoviesTotalTarget} movies`,
        )
        .refine(
          (answer) =>
            new Set(answer.map((x) => x.id)).size === answer.length &&
            new Set(answer.map((x) => x.title.trim().toLowerCase())).size ===
              answer.length,
          {
            message:
              "You must set an array of unique movies. You cannot recommend the same movie twice.",
          },
        ),
    }),
    execute: async ({ answer }) => {
      if (toolsCalled.includes(AGENT_TOOL_NAME.PICK_FINAL_ANSWER)) {
        return {
          success: false,
          message: "You can only pick the final answer once.",
        };
      }

      if (
        !toolsCalled.includes(AGENT_TOOL_NAME.CONSULT_MOVIE_RECOMMENDATIONS)
      ) {
        return {
          success: false,
          message:
            "You must consult movie recommendations before picking the final answer.",
        };
      }

      if (
        toolsCalled.filter((x) => x === AGENT_TOOL_NAME.SEARCH_MOVIES).length <
        recommendedMoviesTotalTarget
      ) {
        return {
          success: false,
          message: `You must search for at least ${recommendedMoviesTotalTarget} different movies before picking the final answer.`,
        };
      }

      toolsCalled.push(AGENT_TOOL_NAME.PICK_FINAL_ANSWER);

      eventHandler[AGENT_EVENT.AGENT_RESULT](answer);

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
    stopWhen: [() => toolsCalled.includes(AGENT_TOOL_NAME.PICK_FINAL_ANSWER)],
  });

  return agent;
};
