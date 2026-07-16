import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the main StadiumPulse AI application", () => {
    render(<App />);

    expect(screen.getByRole("banner")).toHaveTextContent("FIFA World Cup 2026 stadium operations");
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "StadiumPulse AI" })).toBeInTheDocument();
    expect(screen.getByText(/fans, volunteers, staff, and organizers/i)).toBeInTheDocument();
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
