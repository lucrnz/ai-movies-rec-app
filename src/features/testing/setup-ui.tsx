import "vitest-browser-react";
import { vi } from "vitest";
import { Link, useLinkStatus } from "./mocks/next-js/link";
import { type ComponentType, lazy } from "react";

vi.mock("next/link", () => ({
  __esModule: true,
  default: Link,
  useLinkStatus,
}));

vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: vi
    .fn()
    .mockImplementation(
      (importFn: () => Promise<unknown>, _options?: unknown) =>
        lazy(async () => {
          const resolved = await importFn();
          // If the loader returned a module with a default export, use that.
          if (
            resolved &&
            typeof resolved === "object" &&
            "default" in (resolved as Record<string, unknown>)
          ) {
            return {
              default: (resolved as { default: ComponentType<unknown> })
                .default,
            };
          }
          // Otherwise, assume the loader resolved to a React component directly
          return { default: resolved as ComponentType<unknown> };
        }),
    ),
}));
