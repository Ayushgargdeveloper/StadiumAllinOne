# StadiumPulse AI

## Challenge Statement

Challenge 4: Smart Stadiums & Tournament Operations. Build a GenAI-enabled solution that enhances stadium operations and the tournament experience for FIFA World Cup 2026 fans, organizers, volunteers, or venue staff.

## Solution Summary

StadiumPulse AI is a lightweight GenAI-enabled stadium operations assistant. It sends validated stadium questions to a secure server-side Gemini endpoint, requests structured JSON decision-support output, validates the model response, and falls back to a deterministic offline assistant when Gemini is unavailable or unconfigured.

The app keeps the existing crowd, alerts, and inclusive support modules as compact typed operational context. It does not claim live stadium sensors, emergency-system integration, production FIFA partnership, real ticketing feeds, maps, charts, or guaranteed real-time data.

## GenAI Architecture

- Frontend React form collects a stadium question and selected response language.
- The browser calls `/api/assistant`; it never receives or stores the Gemini API key.
- The serverless endpoint validates method, content type, JSON shape, language, and question length.
- The endpoint builds a constrained prompt with FIFA World Cup 2026 stadium context and local typed venue data.
- Gemini is called server-side through native `fetch`, not a browser SDK.
- Gemini is instructed to return JSON only.
- The returned JSON is validated against the shared `StadiumAIResponse` shape before being sent to the UI.
- If the API key is missing, Gemini fails, times out, or returns invalid JSON, the endpoint returns the offline fallback response.

## Structured Decision Output

Assistant responses include:

- `answer`
- `intent`
- `recommendedAction`
- optional `alternativeLocation`
- `urgency`
- `targetUser`
- `sourceMode` as `gemini` or `offline-fallback`

The UI displays these fields as operational decision support rather than rendering unvalidated model text directly.

## Environment Setup

Create a local `.env` file when using Gemini:

```bash
GEMINI_API_KEY=your_real_key_here
```

Only `.env.example` is committed:

```bash
GEMINI_API_KEY=your_api_key_here
```

Do not use `VITE_GEMINI_API_KEY`; the API key must remain server-side.

## Local Development

```bash
npm install
npm run dev
```

For local serverless endpoint testing, run the project with a Vercel-compatible dev environment so `/api/assistant` is available. Without the endpoint or without `GEMINI_API_KEY`, the frontend still falls back safely to the offline assistant.

## Vercel Deployment

1. Deploy the repository to Vercel.
2. Add `GEMINI_API_KEY` in the Vercel project environment variables.
3. Do not expose the key through any `VITE_` variable.
4. Verify `/api/assistant` returns `sourceMode: "gemini"` when the key is valid and `sourceMode: "offline-fallback"` when Gemini is unavailable.

## Commands

```bash
npm run lint
npm run test
npm run coverage
npm run build
npm audit
```

## Security Notes

- Gemini API key is read only in the serverless endpoint.
- Request method and content type are validated.
- Question input is sanitized and length-limited.
- Unsupported languages are rejected at the endpoint.
- Native server-side `fetch` uses a timeout.
- Raw provider errors are not returned to users.
- Model output must validate before it reaches the frontend.
- User questions, model responses, and secrets are not logged.
- The UI does not use `dangerouslySetInnerHTML`, `eval`, or dynamic code execution.

## Efficiency Notes

- No Google SDK is bundled into the frontend.
- Native server-side `fetch` avoids adding a heavy AI dependency.
- Static typed stadium context remains small.
- No maps, charts, polling, timers, database, authentication, or WebSockets are added.
- The AI integration lives outside the browser bundle.

## Feature-to-Challenge Mapping

- GenAI alignment: real server-side Gemini workflow with structured JSON output.
- Navigation: gate and route guidance from supplied stadium context.
- Crowd management: typed crowd locations and recommendations.
- Accessibility: accessible entrance, restroom, medical desk, quiet zone, and support guidance.
- Transportation: transport exit, rail guidance, and accessible shuttle pickup.
- Sustainability: refill and waste-sorting guidance.
- Multilingual assistance: English, Spanish, and French response requests.
- Security: server-side key handling, strict validation, safe fallback.
- Reliability: deterministic offline fallback when Gemini is unavailable.
- Accessibility: semantic layout, labeled controls, visible loading/fallback states, `aria-live`, `aria-busy`, and automated accessibility tests.
