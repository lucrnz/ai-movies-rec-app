import { env } from "@/env";
import { createOllama, OllamaProvider } from "ai-sdk-ollama";
import {
  createOpenRouter,
  OpenRouterProvider,
} from "@openrouter/ai-sdk-provider";
import { createXai, XaiProvider } from "@ai-sdk/xai";

let ollamaProvider: OllamaProvider | undefined;
let openRouterProvider: OpenRouterProvider | undefined;
let xaiProvider: XaiProvider | undefined;

export const AI_MODEL_FOR_TASK = {
  AGENT: "AGENT",
  RECOMMENDER: "RECOMMENDER",
} as const;

export type AIModelForTask =
  (typeof AI_MODEL_FOR_TASK)[keyof typeof AI_MODEL_FOR_TASK];

const getAILanguageModelUsingXaiProvider = (task: AIModelForTask) => {
  if (!xaiProvider) {
    console.log("[ai] creating xai provider");

    if (!env.XAI_API_KEY) {
      throw new Error("XAI_API_KEY is not set");
    }

    xaiProvider = createXai({
      apiKey: env.XAI_API_KEY,
    });
  }

  switch (task) {
    case AI_MODEL_FOR_TASK.AGENT:
      return xaiProvider.chat(env.XAI_MODEL_AGENT);
    case AI_MODEL_FOR_TASK.RECOMMENDER:
      return xaiProvider.chat(env.XAI_MODEL_RECOMMENDER);
    default:
      throw new Error(`Unknown task: ${task}`);
  }
};

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

    if (!env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

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
  switch (env.AI_MODEL_PROVIDER) {
    case "xai":
      return getAILanguageModelUsingXaiProvider(task);
    case "ollama":
      return getAILanguageModelUsingOllamaProvider(task);
    case "openrouter":
      return getAILanguageModelUsingOpenRouter(task);
    default:
      throw new Error(`Unknown AI model provider: ${env.AI_MODEL_PROVIDER}`);
  }
};
