import { env } from "@/env";
import { createOllama, OllamaProvider } from "ai-sdk-ollama";
import {
  createOpenRouter,
  OpenRouterProvider,
} from "@openrouter/ai-sdk-provider";

let ollamaProvider: OllamaProvider | undefined;
let openRouterProvider: OpenRouterProvider | undefined;

const useOpenRouter = !!env.OPENROUTER_API_KEY;

export const AI_MODEL_FOR_TASK = {
  AGENT: "AGENT",
  RECOMMENDER: "RECOMMENDER",
} as const;

export type AIModelForTask =
  (typeof AI_MODEL_FOR_TASK)[keyof typeof AI_MODEL_FOR_TASK];

const getAILanguageModelUsingOllamaProvider = (task: AIModelForTask) => {
  if (!ollamaProvider) {
    console.log("[ai] creating ollama provider");
    ollamaProvider = createOllama({
      baseURL: env.OLLAMA_URL,
    });
  }

  switch (task) {
    case AI_MODEL_FOR_TASK.AGENT:
      return ollamaProvider.chat(env.OLLAMA_MODEL_AGENT);
    case AI_MODEL_FOR_TASK.RECOMMENDER:
      return ollamaProvider.chat(env.OLLAMA_MODEL_RECOMMENDER);
    default:
      throw new Error(`Unknown task: ${task}`);
  }
};

const getAILanguageModelUsingOpenRouter = (task: AIModelForTask) => {
  if (!openRouterProvider) {
    console.log("[ai] creating openrouter provider");
    openRouterProvider = createOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
    });
  }

  switch (task) {
    case AI_MODEL_FOR_TASK.AGENT:
      return openRouterProvider.chat(env.OPENROUTER_MODEL_AGENT);
    case AI_MODEL_FOR_TASK.RECOMMENDER:
      return openRouterProvider.chat(env.OPENROUTER_MODEL_RECOMMENDER);
    default:
      throw new Error(`Unknown task: ${task}`);
  }
};

export const getAILanguageModel = (task: AIModelForTask) => {
  return useOpenRouter
    ? getAILanguageModelUsingOpenRouter(task)
    : getAILanguageModelUsingOllamaProvider(task);
};
