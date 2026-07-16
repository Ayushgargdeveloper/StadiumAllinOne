import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InclusiveFanSupport } from "./InclusiveFanSupport";

describe("InclusiveFanSupport", () => {
  it("renders accessibility, transportation, and sustainability support", () => {
    render(<InclusiveFanSupport />);

    expect(screen.getByRole("heading", { name: "Inclusive Fan Support" })).toBeInTheDocument();
    expect(screen.getByText(/Wheelchair-friendly entrance/i)).toBeInTheDocument();
    expect(screen.getByText(/Public transport guidance/i)).toBeInTheDocument();
    expect(screen.getByText(/Waste-separation guidance/i)).toBeInTheDocument();
  });
});
