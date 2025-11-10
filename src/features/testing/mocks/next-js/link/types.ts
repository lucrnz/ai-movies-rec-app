import type { ComponentProps } from "react";
import type { LinkProps as NextLinkProps } from "next/link";

export type LinkProps = {
  href: string;
} & NextLinkProps &
  Pick<ComponentProps<"a">, "children" | "className">;
