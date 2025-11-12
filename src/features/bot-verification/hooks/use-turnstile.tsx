"use client";

import { useState, type RefObject } from "react";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

type UseTurnstileReturn = {
  token: string | null;
  isEnabled: boolean;
  isVerifying: boolean;
  isReady: boolean;
  execute: () => void;
  reset: () => void;
  handleSuccess: (token: string) => void;
  handleError: () => void;
};

type UseTurnstileParams = {
  turnstileRef: RefObject<TurnstileInstance | null>;
  onReady?: (token: string, reset: () => void) => void;
  isEnabled?: boolean;
};

export function useTurnstile({
  turnstileRef,
  onReady,
  isEnabled = true,
}: UseTurnstileParams): UseTurnstileReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const isReady = !!token && !isVerifying;

  const execute = () => {
    if (!isEnabled || !turnstileRef.current || isReady) return;

    console.log("starting turnstile verification");
    setIsVerifying(true);
    turnstileRef.current.execute();
  };

  const reset = () => {
    if (!isEnabled || !turnstileRef.current) return;
    turnstileRef.current.reset();
    setToken(null);
    setIsVerifying(false);
  };

  const handleSuccess = async (token: string) => {
    // Artificial delay to simulate verification
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("turnstile verification successful");

    setToken(token);
    setIsVerifying(false);

    // Invoke the callback if provided, passing reset function
    onReady?.(token, reset);
  };

  const handleError = () => {
    console.error("turnstile verification failed");
    setToken(null);
    setIsVerifying(false);
  };

  return {
    token,
    isVerifying,
    isReady,
    isEnabled,
    execute,
    reset,
    handleSuccess,
    handleError,
  };
}
