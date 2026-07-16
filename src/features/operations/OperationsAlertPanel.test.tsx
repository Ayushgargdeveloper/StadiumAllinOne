import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperationsAlertPanel } from "./OperationsAlertPanel";

describe("OperationsAlertPanel", () => {
  it("renders operational alerts with team ownership and response", () => {
    render(<OperationsAlertPanel />);

    expect(screen.getByRole("heading", { name: "Operations Alert Panel" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Gate congestion" })).toBeInTheDocument();
    expect(screen.getByText(/Transport operations/i)).toBeInTheDocument();
    expect(screen.getByText(/Send one trained volunteer/i)).toBeInTheDocument();
  });
});
