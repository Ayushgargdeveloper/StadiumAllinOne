import { CrowdDecisionSupport } from "./components/CrowdDecisionSupport";
import { GenAIStadiumAssistant } from "./components/GenAIStadiumAssistant";
import { InclusiveFanSupport } from "./components/InclusiveFanSupport";
import { OperationsAlertPanel } from "./components/OperationsAlertPanel";

export function App() {
  return (
    <>
      <header className="hero">
        <p className="eyebrow">FIFA World Cup 2026 stadium operations</p>
        <h1>StadiumPulse AI</h1>
        <p>
          A lightweight offline GenAI-enabled assistant for fans, volunteers, staff, and organizers managing navigation,
          crowd pressure, accessibility, transportation, sustainability, and venue decisions.
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
