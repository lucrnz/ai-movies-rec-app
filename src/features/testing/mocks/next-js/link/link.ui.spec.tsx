import { render } from "vitest-browser-react";
import { describe, it, expect } from "vitest";
import { Link } from "./link";

describe("mock: next/link Link component", () => {
  it("should render an anchor element", async () => {
    const screen = await render(<Link href="/" />);
    const link = screen.getByRole("link");

    await expect.element(link).toBeInTheDocument();
  });

  it("should have the correct data-mocked attribute", async () => {
    const screen = await render(<Link href="/" />);
    const link = screen.getByRole("link");

    await expect.element(link).toHaveAttribute("data-mocked", "next-link");
  });

  it("should have the correct href attribute", async () => {
    const href = `/page/${crypto.randomUUID()}`;
    const screen = await render(<Link href={href} />);
    const link = screen.getByRole("link");

    await expect.element(link).toHaveAttribute("href", href);
  });

  it("should have data-props attribute", async () => {
    const screen = await render(<Link href="/" />);
    const link = screen.getByRole("link");

    await expect.element(link).toHaveAttribute("data-props");
  });

  it("should correctly serialize all props as data-props attribute", async () => {
    const props = {
      href: `/page/${crypto.randomUUID()}`,
      "data-a": Math.random(),
      "data-b": Math.random().toString(),
      "data-c": false,
      "data-d": new Date().toISOString(),
    } as const;

    const screen = await render(<Link {...props} />);
    const link = screen.getByRole("link");

    const dataPropsValue: Record<string, unknown> = JSON.parse(
      link.element().getAttribute("data-props")!,
    );

    expect(dataPropsValue).toEqual({ ...props, children: false });
  });

  it("should render child element correctly", async () => {
    const random = Math.random().toString();
    const screen = await render(
      <Link href="/">
        <span data-testid="child-item">{random}</span>
      </Link>,
    );

    const childItem = screen.getByTestId("child-item");

    await expect.element(childItem).toBeInTheDocument();
    await expect.element(childItem).toHaveTextContent(random);
  });

  it("should handle custom className correctly", async () => {
    const customClassName = "custom-class-unit-test";
    const screen = await render(<Link href="/" className={customClassName} />);
    const link = screen.getByRole("link");

    await expect.element(link).toHaveClass(customClassName);
  });
});
