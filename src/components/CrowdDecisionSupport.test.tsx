import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrowdDecisionSupport } from "./CrowdDecisionSupport";

describe("CrowdDecisionSupport", () => {
  it("renders crowd locations with statuses and recommendations", () => {
    render(<CrowdDecisionSupport />);

    expect(screen.getByRole("heading", { name: "Crowd and Operations Decision Support" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Gate A" })).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText(/Hold departures in waves/i)).toBeInTheDocument();
  });
});
