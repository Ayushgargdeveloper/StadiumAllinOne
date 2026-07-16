import { type StadiumAIResponse } from "../../../shared/contracts/stadium";

type AssistantRecommendationProps = {
  response: StadiumAIResponse;
  statusMessage: string;
  isLoading: boolean;
};

export function AssistantRecommendation({ response, statusMessage, isLoading }: AssistantRecommendationProps) {
  return (
    <div className="assistant-response" aria-live="polite" aria-busy={isLoading}>
      <h3>Generated recommendation</h3>
      {statusMessage.length > 0 && (
        <p className="assistant-status" role="status">
          {statusMessage}
        </p>
      )}
      <p>{response.answer}</p>
      <dl className="decision-list">
        <div>
          <dt>Intent</dt>
          <dd>{response.intent}</dd>
        </div>
        <div>
          <dt>Urgency</dt>
          <dd>{response.urgency}</dd>
        </div>
        <div>
          <dt>Target user</dt>
          <dd>{response.targetUser}</dd>
        </div>
        <div>
          <dt>Source mode</dt>
          <dd>{response.sourceMode}</dd>
        </div>
        <div>
          <dt>Recommended action</dt>
          <dd>{response.recommendedAction}</dd>
        </div>
        {response.alternativeLocation !== undefined && (
          <div>
            <dt>Alternative location</dt>
            <dd>{response.alternativeLocation}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
