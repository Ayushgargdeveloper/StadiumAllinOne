import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MAX_ASSISTANT_INPUT_LENGTH } from "../constants";
import { GenAIStadiumAssistant } from "./GenAIStadiumAssistant";

describe("GenAIStadiumAssistant", () => {
  it("renders the assistant form with helper text and character counter", () => {
    render(<GenAIStadiumAssistant />);

    const textbox = screen.getByLabelText("Stadium question");
    expect(screen.getByRole("heading", { name: "Multilingual GenAI Stadium Assistant" })).toBeInTheDocument();
    expect(textbox).toHaveAccessibleDescription(
      `StadiumPulse AI demonstrates a safe offline GenAI workflow using intent recognition, contextual stadium information retrieval, multilingual response generation, and operational decision-support templates. 0 / ${MAX_ASSISTANT_INPUT_LENGTH} characters`
    );
    expect(screen.getByLabelText("Response language")).toBeInTheDocument();
  });

  it("generates and renders a recommendation", async () => {
    const user = userEvent.setup();
    render(<GenAIStadiumAssistant />);

    await user.type(screen.getByLabelText("Stadium question"), "Where is the accessible wheelchair entrance?");
    await user.selectOptions(screen.getByLabelText("Response language"), "fr");
    await user.click(screen.getByRole("button", { name: "Generate recommendation" }));

    expect(screen.getByText(/Recommandation d'accessibilité/i)).toBeInTheDocument();
    expect(screen.getByText(/Accessible Entrance E/i)).toBeInTheDocument();
  });
});
