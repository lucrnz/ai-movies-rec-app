import { z } from "zod";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    TURNSTILE_SECRET_KEY: z.string().optional(),
    TMDB_API_KEY: z.string(),
    AI_MODEL_PROVIDER: z.enum(["openrouter", "xai", "ollama"]).default("xai"),
    XAI_API_KEY: z.string().optional(),
    XAI_MODEL_AGENT: z.string().default("grok-4-fast-non-reasoning"),
    XAI_MODEL_RECOMMENDER: z.string().default("grok-4"),
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_MODEL_AGENT: z.string().default("openai/gpt-5-nano"),
    OPENROUTER_MODEL_RECOMMENDER: z.string().default("openai/gpt-oss-120b"),
    OLLAMA_URL: z.string().default("http://localhost:11434"),
    OLLAMA_MODEL_AGENT: z.string().default("qwen3:1.7b"),
    OLLAMA_MODEL_RECOMMENDER: z.string().default("gpt-oss:20b"),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "NEXT_PUBLIC_",

  client: {
    NEXT_PUBLIC_BASE_PATH: z
      .string()
      .optional()
      .default("/ai-movies-rec/")
      .refine((v) => v.endsWith("/"), {
        message: "NEXT_PUBLIC_BASE_PATH must end with a slash",
      })
      .refine((v) => v.startsWith("/"), {
        message: "NEXT_PUBLIC_BASE_PATH must start with a slash",
      }),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    AI_MODEL_PROVIDER: process.env.AI_MODEL_PROVIDER,
    XAI_API_KEY: process.env.XAI_API_KEY,
    XAI_MODEL_AGENT: process.env.XAI_MODEL_AGENT,
    XAI_MODEL_RECOMMENDER: process.env.XAI_MODEL_RECOMMENDER,
    OLLAMA_URL: process.env.OLLAMA_URL,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
    OLLAMA_MODEL_AGENT: process.env.OLLAMA_MODEL_AGENT,
    OLLAMA_MODEL_RECOMMENDER: process.env.OLLAMA_MODEL_RECOMMENDER,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL_AGENT: process.env.OPENROUTER_MODEL_AGENT,
    OPENROUTER_MODEL_RECOMMENDER: process.env.OPENROUTER_MODEL_RECOMMENDER,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },

  emptyStringAsUndefined: true,
});
