import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_ASSISTANT_INPUT_LENGTH } from "../constants";
import { type StadiumAIResponse } from "../types";
import { requestAssistantResponse } from "../services/assistantClient";
import { GenAIStadiumAssistant } from "./GenAIStadiumAssistant";

vi.mock("../services/assistantClient", () => ({
  requestAssistantResponse: vi.fn()
}));

const mockedRequestAssistantResponse = vi.mocked(requestAssistantResponse);

const geminiResponse: StadiumAIResponse = {
  answer: "Use Accessible Entrance E for step-free entry and volunteer support.",
  intent: "accessibility",
  recommendedAction: "Send a volunteer to Accessible Entrance E.",
  alternativeLocation: "Accessible Entrance E",
  urgency: "medium",
  targetUser: "fan",
  sourceMode: "gemini"
};

describe("GenAIStadiumAssistant", () => {
  beforeEach(() => {
    mockedRequestAssistantResponse.mockReset();
  });

  it("renders the assistant form with helper text and character counter", () => {
    render(<GenAIStadiumAssistant />);

    const textbox = screen.getByLabelText("Stadium question");
    expect(screen.getByRole("heading", { name: "Multilingual GenAI Stadium Assistant" })).toBeInTheDocument();
    expect(textbox).toHaveAccessibleDescription(
      `StadiumPulse AI sends validated stadium questions to a secure server-side Gemini endpoint and falls back to a safe offline engine when AI is unavailable. 0 / ${MAX_ASSISTANT_INPUT_LENGTH} characters`
    );
    expect(screen.getByLabelText("Response language")).toBeInTheDocument();
  });

  it("renders loading state and a successful Gemini response", async () => {
    const user = userEvent.setup();
    let resolveResponse: (response: StadiumAIResponse) => void = () => undefined;
    mockedRequestAssistantResponse.mockReturnValue(new Promise((resolve) => {
      resolveResponse = resolve;
    }));
    render(<GenAIStadiumAssistant />);

    await user.type(screen.getByLabelText("Stadium question"), "Where is the accessible wheelchair entrance?");
    await user.click(screen.getByRole("button", { name: "Generate recommendation" }));

    expect(screen.getByRole("button", { name: "Generating recommendation..." })).toBeDisabled();
    resolveResponse(geminiResponse);
    expect(await screen.findByText(geminiResponse.answer)).toBeInTheDocument();
    expect(screen.getByText("gemini")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(mockedRequestAssistantResponse).toHaveBeenCalledWith(
      "Where is the accessible wheelchair entrance?",
      "en"
    );
  });

  it("renders an offline fallback response when the endpoint fails", async () => {
    const user = userEvent.setup();
    mockedRequestAssistantResponse.mockRejectedValue(new Error("network"));
    render(<GenAIStadiumAssistant />);

    await user.type(screen.getByLabelText("Stadium question"), "Where is medical first aid help?");
    await user.selectOptions(screen.getByLabelText("Response language"), "fr");
    await user.click(screen.getByRole("button", { name: "Generate recommendation" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Using offline fallback");
    expect(screen.getByText("offline-fallback")).toBeInTheDocument();
    expect(screen.getByText("medical")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Generate recommendation" })).toBeEnabled());
  });
});
