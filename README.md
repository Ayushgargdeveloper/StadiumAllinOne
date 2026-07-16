# StadiumPulse AI

## Challenge Statement

Challenge 4: Smart Stadiums & Tournament Operations. Build a GenAI-enabled solution that enhances stadium operations and the tournament experience for FIFA World Cup 2026 fans, organizers, volunteers, or venue staff.

## Solution Summary

StadiumPulse AI is a lightweight GenAI-enabled stadium operations assistant. It sends validated stadium questions to a secure server-side Gemini endpoint, requests structured JSON decision-support output, validates the model response, and falls back to a deterministic offline assistant when Gemini is unavailable or unconfigured.

The app keeps the existing crowd, alerts, and inclusive support modules as compact typed operational context. It does not claim live stadium sensors, emergency-system integration, production FIFA partnership, real ticketing feeds, maps, charts, or guaranteed real-time data.

## Evaluation Criteria Evidence

| Criterion | Repository evidence |
| --- | --- |
| Code Quality | Feature-first modules with public entry points; platform-neutral shared domain and contracts; thin Vercel adapter; strict TypeScript options; strict ESLint; typed API errors; automated CI quality gate. |
| Security | Server-only Gemini key; method, media-type, size, shape, language, and model-output validation; bounded rate limiting; provider timeout; untrusted prompt-data delimiting; safe errors; CSP and browser security headers. |
| Efficiency | Only React and React DOM at runtime; native server-side `fetch`; no AI SDK in the browser; no polling or background timers; production JavaScript is 159.67 kB before gzip and 50.92 kB after gzip. |
| Testing | 70 tests across 13 files; 100% statements, functions, and lines; 98.18% branches; enforced minimum thresholds of 98% statements/functions/lines and 95% branches. |
| Accessibility | Semantic regions and headings; explicit form labels and descriptions; keyboard focus styles; loading and fallback announcements with `aria-live`, `aria-busy`, and status roles; automated `jest-axe` coverage. |
| Problem Statement Alignment | Server-side GenAI decision support for navigation, crowd pressure, accessibility, transportation, medical help, sustainability, volunteers, and venue operations, with English, Spanish, and French output. |

Final verification is reproducible with `npm run quality` and `npm audit --audit-level=moderate`. The same gates run in `.github/workflows/ci.yml` for pull requests and pushes to `main`.

## GenAI Architecture

- Frontend React form collects a stadium question and selected response language.
- The browser calls `/api/assistant`; it never receives or stores the Gemini API key.
- The serverless endpoint validates method, content type, JSON shape, language, and question length.
- The endpoint builds a constrained prompt with FIFA World Cup 2026 stadium context and local typed venue data.
- Gemini is called server-side through native `fetch`, not a browser SDK.
- Gemini is instructed to return JSON only.
- The returned JSON is validated against the shared `StadiumAIResponse` shape before being sent to the UI.
- If the API key is missing, Gemini fails, times out, or returns invalid JSON, the endpoint returns the offline fallback response.

## Project Architecture

```text
src/
|-- features/
|   |-- assistant/
|   |   |-- components/
|   |   `-- services/
|   |-- crowd/
|   |-- inclusive-support/
|   `-- operations/
|-- shared/
|   |-- assistant/
|   |-- config/
|   |-- contracts/
|   |-- stadium/
|   `-- validation/
|-- App.tsx
`-- main.tsx
```

`App.tsx` composes features through their public `index.ts` entry points. Feature modules own their UI, tests, and feature-specific behavior. Shared modules own cross-runtime contracts, configuration, validation, and typed stadium context used by both the browser and server. The API and server layers do not import React components, and shared modules do not depend on feature UI.

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

The committed `vercel.json` applies a same-origin Content Security Policy, anti-framing protection, MIME sniffing protection, a privacy-preserving referrer policy, restricted browser permissions, and HTTPS transport security.

## Commands

```bash
npm run lint
npm run test
npm run coverage
npm run build
npm run quality
npm audit
```

`npm run quality` is the local pre-submission gate. It runs linting, the full test suite with enforced coverage thresholds, TypeScript compilation, and the production Vite build. GitHub Actions runs the same gates from a locked `npm ci` install on every pull request and every push to `main`, then rejects moderate-or-higher dependency vulnerabilities.

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
- Production responses use restrictive browser security headers from `vercel.json`.
- Public assistant requests are rate-limited before provider work begins.
- The default limiter has bounded in-memory state, and the handler exposes an injectable hook for distributed production backing.
- API failures use stable error codes and include a request ID for safe diagnosis.
- User questions are serialized as untrusted JSON inside the constrained model prompt.

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
