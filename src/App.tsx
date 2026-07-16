import { GenAIStadiumAssistant } from "./features/assistant";
import { CrowdDecisionSupport } from "./features/crowd";
import { InclusiveFanSupport } from "./features/inclusive-support";
import { OperationsAlertPanel } from "./features/operations";

export function App() {
  return (
    <>
      <header className="hero">
        <p className="eyebrow">FIFA World Cup 2026 stadium operations</p>
        <h1>StadiumPulse AI</h1>
        <p>
          A lightweight GenAI-enabled assistant for fans, volunteers, staff, and organizers managing navigation, crowd
          pressure, accessibility, transportation, sustainability, and venue decisions with safe offline fallback.
        </p>
      </header>
      <main>
        <GenAIStadiumAssistant />
        <CrowdDecisionSupport />
        <OperationsAlertPanel />
        <InclusiveFanSupport />
      </main>
    </>
  );
}
