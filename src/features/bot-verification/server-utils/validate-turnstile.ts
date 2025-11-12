import type { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";
import { env } from "@/env";

const VERIFY_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function validateTurnstileToken(
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const secretKey = env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    return { success: false, error: "Turnstile secret key not configured" };
  }

  try {
    const response = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });

    const data = (await response.json()) as TurnstileServerValidationResponse;

    if (!data.success) {
      const errorCodes = data["error-codes"] || [];
      return {
        success: false,
        error: `Validation failed: ${errorCodes.join(", ")}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}
