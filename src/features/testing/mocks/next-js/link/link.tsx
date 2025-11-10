import type { LinkProps } from "./types";

export function Link(props: LinkProps) {
  const propsJson = JSON.stringify({
    ...props,
    children: Boolean(props.children),
  });
  const { children, ...allProps } = props;

  return (
    <a {...allProps} data-mocked="next-link" data-props={propsJson}>
      {children}
    </a>
  );
}
