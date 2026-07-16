import { assistantHandler, type AssistantApiRequest, type AssistantApiResponse } from "../server/assistantHandler";

export {
  assistantHandler,
  type AssistantApiRequest,
  type AssistantApiResponse,
  type AssistantFallbackEvent,
  type AssistantFallbackReason
} from "../server/assistantHandler";

export default function handler(request: AssistantApiRequest, response: AssistantApiResponse): Promise<void> {
  return assistantHandler(request, response);
}
