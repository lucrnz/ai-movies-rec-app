"use client";

import { LoaderCircleIcon, SearchIcon } from "lucide-react";
import { useMovieRecommendations } from "../context";
import { useRef, useState } from "react";
import clsx from "clsx";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Popover } from "react-tiny-popover";
import { useTurnstile } from "@/features/bot-verification/hooks/use-turnstile";
import { env } from "@/env";

const EXAMPLE_QUERIES = [
  "existential sci-fi about identity",
  "slow-burn thrillers with brilliant twists",
  "dark comedies about dysfunctional families",
  "aesthetic indie films with surreal vibes",
];

export const MovieRecommendationsSearch = () => {
  const { isPending, results, progressMessage, provideRecommendations } =
    useMovieRecommendations();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const pendingQueryRef = useRef<string | null>(null);
  const [hasPendingQuery, setHasPendingQuery] = useState(false);

  const handleTurnstileReady = (token: string, reset: () => void) => {
    if (pendingQueryRef.current && hasPendingQuery) {
      provideRecommendations(pendingQueryRef.current, token);
      pendingQueryRef.current = null;
      setHasPendingQuery(false);
      reset();
    }
  };

  const turnstile = useTurnstile({
    turnstileRef,
    onReady: handleTurnstileReady,
    isEnabled: !!env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  });

  const captchaIsVerifying =
    turnstile.isEnabled && turnstile.isVerifying && !turnstile.isReady;

  const startTurnstileVerificationOnInteraction = () => {
    if (!captchaIsVerifying) turnstile.execute();
  };

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    const form = ev.currentTarget;
    const formData = new FormData(form);
    const query = (formData.get("query") ?? "") as string;
    ev.preventDefault();
    if (!query) return;

    // If Turnstile is bypassed (not configured), proceed normally
    if (!turnstile.isEnabled) {
      provideRecommendations(query);
      return;
    }

    // If token is ready, proceed with token immediately
    if (turnstile.isReady && turnstile.token) {
      provideRecommendations(query, turnstile.token);
      turnstile.reset();
      return;
    }

    // If Turnstile is verifying, store the query and wait for callback
    if (turnstile.isVerifying) {
      pendingQueryRef.current = query;
      setHasPendingQuery(true);
      return;
    }

    // If Turnstile is enabled but not ready and not verifying, start verification
    // and store the query for when it completes
    pendingQueryRef.current = query;
    setHasPendingQuery(true);
    turnstile.execute();
  };

  const handleSelectExampleQuery = (query: string) => {
    const form = formRef.current;
    if (!form) return;
    const input = form.querySelector(
      "input[name='query']",
    ) as HTMLInputElement | null;

    if (!input) return;
    startTurnstileVerificationOnInteraction();
    input.value = query;
    form.requestSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        "w-full flex flex-col gap-4 items-center justify-center",
        results.length > 0 && "mb-4",
      )}
      ref={formRef}
    >
      <div className="md:w-96 lg:w-[500px] flex flex-row gap-2 items-center">
        <Popover
          isOpen={captchaIsVerifying && hasPendingQuery}
          content={
            <div className="bg-base-100 dark:bg-base-300 text-base-content dark:text-base-content px-3 py-2 rounded-lg shadow-lg text-sm border border-base-300 dark:border-base-200 flex flex-row items-center gap-2">
              <LoaderCircleIcon className="animate-spin" />
              We are verifying you are not a bot, please wait...
            </div>
          }
          positions={["top"]}
        >
          <input
            type="search"
            className="input w-full"
            placeholder="Enter your movie criteria"
            name="query"
            autoComplete="off"
            required
            onInput={() => startTurnstileVerificationOnInteraction()}
            onFocus={() => startTurnstileVerificationOnInteraction()}
            onKeyUp={(ev) => {
              if (ev.key === "Enter") {
                return formRef?.current?.requestSubmit();
              }
            }}
          ></input>
        </Popover>

        <button
          type="submit"
          disabled={isPending || hasPendingQuery}
          className="btn btn-primary"
        >
          {isPending ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <SearchIcon />
          )}
          {!hasPendingQuery && (isPending ? "Searching..." : "Search")}
        </button>
      </div>

      {turnstile.isEnabled && (
        <Turnstile
          ref={turnstileRef}
          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
          options={{
            size: "invisible",
            execution: "execute",
            appearance: "execute",
          }}
          onSuccess={turnstile.handleSuccess}
          onError={turnstile.handleError}
        />
      )}

      {isPending && progressMessage && (
        <div className="text-sm text-neutral-700 dark:text-neutral-300 animate-pulse">
          {progressMessage}
        </div>
      )}

      {!isPending && results.length === 0 && (
        <div className="flex flex-col lg:flex-row gap-4">
          {EXAMPLE_QUERIES.map((query) => (
            <button
              type="button"
              key={query}
              className="btn btn-outline text-sm font-normal opacity-75 hover:opacity-100"
              onClick={() => handleSelectExampleQuery(query)}
            >
              {query}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};
