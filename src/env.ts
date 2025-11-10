import { z } from "zod";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    TMDB_API_KEY: z.string(),
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_MODEL_AGENT: z.string().default("openai/gpt-5-nano"),
    OPENROUTER_MODEL_RECOMMENDER: z.string().default("openai/gpt-oss-120b"),
    OLLAMA_URL: z.string().default("http://localhost:11434"),
    OLLAMA_MODEL_AGENT: z.string().default("gemma3:4b"),
    OLLAMA_MODEL_RECOMMENDER: z.string().default("gpt-oss:20b"),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "NEXT_PUBLIC_",

  client: {},

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    OLLAMA_URL: process.env.OLLAMA_URL,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
    OLLAMA_MODEL_AGENT: process.env.OLLAMA_MODEL_AGENT,
    OLLAMA_MODEL_RECOMMENDER: process.env.OLLAMA_MODEL_RECOMMENDER,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL_AGENT: process.env.OPENROUTER_MODEL_AGENT,
    OPENROUTER_MODEL_RECOMMENDER: process.env.OPENROUTER_MODEL_RECOMMENDER,
  },

  emptyStringAsUndefined: true,
});
