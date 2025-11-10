import type { useLinkStatus as useLinkStatusNextJs } from "next/link";
import { vi } from "vitest";

export const useLinkStatus = vi.fn<typeof useLinkStatusNextJs>();
