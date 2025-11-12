"use client";

import { useState, type RefObject } from "react";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

type UseTurnstileReturn = {
  token: string | null;
  isEnabled: boolean;
  isVerifying: boolean;
  isReady: boolean;
  hasError: boolean;
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
  const [hasError, setHasError] = useState(false);

  const isReady = !!token && !isVerifying && !hasError;

  const execute = () => {
    if (!isEnabled || !turnstileRef.current || isReady) return;

    console.log("starting turnstile verification");
    setHasError(false);
    setIsVerifying(true);
    turnstileRef.current.execute();
  };

  const reset = () => {
    if (!isEnabled || !turnstileRef.current) return;
    turnstileRef.current.reset();
    setToken(null);
    setIsVerifying(false);
    setHasError(false);
  };

  const handleSuccess = async (token: string) => {
    // Artificial delay to simulate verification
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("turnstile verification successful");

    setToken(token);
    setIsVerifying(false);
    setHasError(false);

    // Invoke the callback if provided, passing reset function
    onReady?.(token, reset);
  };

  const handleError = () => {
    console.error("turnstile verification failed");
    setToken(null);
    setIsVerifying(false);
    setHasError(true);

    turnstileRef.current?.reset();
  };

  return {
    token,
    isVerifying,
    isReady,
    isEnabled,
    hasError,
    execute,
    reset,
    handleSuccess,
    handleError,
  };
}
