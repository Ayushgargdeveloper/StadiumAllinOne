# StadiumPulse AI

## Challenge Statement

Challenge 4: Smart Stadiums & Tournament Operations. Build a GenAI-enabled solution that enhances stadium operations and the tournament experience for FIFA World Cup 2026 fans, organizers, volunteers, or venue staff.

## Solution Summary

StadiumPulse AI is a lightweight stadium decision-support application. It sends validated questions to a server-side Gemini endpoint, requests structured JSON, validates the model response at runtime, and falls back to a deterministic offline assistant whenever Gemini is unavailable or unconfigured.

The app also presents typed crowd, operations-alert, accessibility, transportation, and sustainability guidance. It does not claim live stadium sensors, emergency-system integration, production FIFA partnership, real ticketing feeds, or guaranteed real-time data.

## Verified Quality Evidence

| Criterion         | Repository evidence                                                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code Quality      | Feature-owned UI; platform-neutral shared domain; separated HTTP, orchestration, provider, and runtime-configuration modules; strict TypeScript; Prettier; measurable ESLint maintainability limits; dependency-direction rules; locked CI. |
| Security          | Server-only Gemini key sent in the `x-goog-api-key` header; request and model-output validation; bounded rate limiting; provider timeout; untrusted prompt-data delimiting; safe errors; CSP and browser security headers.                  |
| Efficiency        | React and React DOM are the only runtime packages; native server-side `fetch`; no browser AI SDK or polling; production JavaScript is 160.23 kB before gzip and 51.12 kB after gzip.                                                        |
| Testing           | 74 tests across 14 files; 100% statements, functions, and lines; 97.66% branches; enforced minimum thresholds of 98% statements/functions/lines and 95% branches.                                                                           |
| Accessibility     | Semantic regions and headings; explicit labels and descriptions; required input; keyboard focus styles; live loading/fallback announcements; automated `jest-axe` coverage.                                                                 |
| Problem Alignment | GenAI decision support for navigation, crowd pressure, accessibility, transportation, medical help, sustainability, volunteers, and venue operations in English, Spanish, and French.                                                       |

Reproduce the evidence with:

```bash
npm ci
npm run quality
npm audit --audit-level=moderate
```

## Architecture

```text
.
|-- api/
|   `-- assistant.ts                  # Thin Vercel adapter
|-- server/
|   |-- assistantHandler.ts           # Request orchestration
|   |-- assistantHttp.ts              # HTTP parsing and response boundary
|   |-- assistantService.ts           # Provider/fallback decision service
|   |-- geminiClient.ts               # Gemini transport and timeout
|   |-- runtimeConfig.ts              # Normalized server configuration
|   |-- promptBuilder.ts
|   |-- rateLimiter.ts
|   |-- requestValidator.ts
|   `-- responseValidator.ts
|-- src/
|   |-- features/
|   |   |-- assistant/{components,hooks,services}/
|   |   |-- crowd/
|   |   |-- inclusive-support/
|   |   `-- operations/
|   |-- shared/{assistant,config,contracts,stadium,validation}/
|   |-- styles/                        # Concern-based CSS modules
|   |-- App.tsx                        # Feature composition only
|   `-- main.tsx
|-- .github/workflows/ci.yml
|-- eslint.config.js
|-- vite.config.ts
`-- vercel.json
```

Dependency direction is intentionally one-way:

1. `api/assistant.ts` delegates to server orchestration.
2. Server modules use server utilities and platform-neutral shared code, never browser features.
3. Features own their UI, state workflow, client services, and tests.
4. Shared modules never depend on feature UI, API adapters, or server modules.
5. `App.tsx` composes features through their public `index.ts` entry points.

ESLint enforces the browser/server and shared/feature boundaries.

## Maintainability Gates

Production TypeScript is checked against explicit limits in `eslint.config.js`:

| Gate                  | Enforced limit                                                                         |
| --------------------- | -------------------------------------------------------------------------------------- |
| Cyclomatic complexity | Maximum 8 per function                                                                 |
| Function size         | Maximum 60 lines                                                                       |
| Module size           | Maximum 200 lines                                                                      |
| Nesting depth         | Maximum 3                                                                              |
| Function parameters   | Maximum 4                                                                              |
| Hygiene               | No console output, duplicate imports, warning markers, or ignored production rules     |
| Formatting            | Prettier check in local quality command and CI                                         |
| Types                 | Strict browser/server builds with exact optional properties and checked indexed access |

The current largest production TypeScript module is 137 lines. These limits apply to production code while tests remain free to use descriptive fixtures and tables.

## GenAI Request Flow

1. The React form collects a question and supported language.
2. The browser calls `/api/assistant`; it never receives the Gemini API key.
3. The HTTP layer validates method, exact JSON media type, raw size, shape, language, and sanitized question length.
4. The service builds a constrained prompt from typed local stadium context.
5. The Gemini client calls the current stable `gemini-3.5-flash` model by default through native server-side `fetch`.
6. The key is carried in the `x-goog-api-key` header and the provider request has an eight-second timeout.
7. The returned JSON must satisfy the shared `StadiumAIResponse` runtime contract.
8. Missing configuration, transport failure, timeout, malformed JSON, or invalid schema produces a deterministic offline response.

The model can be changed through a validated server-side `GEMINI_MODEL` value without changing application code.

## Structured Output

Every successful assistant response contains:

- `answer`
- `intent`
- `recommendedAction`
- optional `alternativeLocation`
- `urgency`
- `targetUser`
- `sourceMode` as `gemini` or `offline-fallback`

The UI renders only validated fields; it never injects model-generated HTML.

## Environment Setup

Create a local `.env` file for Gemini-backed responses:

```bash
GEMINI_API_KEY=your_real_key_here
GEMINI_MODEL=gemini-3.5-flash
```

`GEMINI_MODEL` is optional and defaults to the stable model shown above. Never use `VITE_GEMINI_API_KEY`; any `VITE_` value is exposed to browser code.

## Local Development

```bash
npm install
npm run dev
```

Use a Vercel-compatible local environment when exercising `/api/assistant`. If the endpoint or key is unavailable, the frontend still provides deterministic offline guidance.

## Commands

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run coverage
npm run build
npm run quality
npm audit --audit-level=moderate
```

`npm run quality` checks formatting, lint and architecture rules, all tests with coverage thresholds, strict TypeScript compilation, and the production Vite build. GitHub Actions repeats those gates from `npm ci` on every pull request and push to `main`, then rejects moderate-or-higher dependency vulnerabilities.

## Deployment And Security

1. Deploy the repository to Vercel.
2. Add `GEMINI_API_KEY` to server-side project environment variables.
3. Optionally set `GEMINI_MODEL` to another safe model identifier.
4. Verify the endpoint returns `sourceMode: "gemini"` with valid provider configuration and `sourceMode: "offline-fallback"` when Gemini is unavailable.

Additional controls include typed error codes, request IDs, `Cache-Control: no-store`, a bounded default limiter with an injectable distributed-store hook, privacy-safe fallback telemetry, CSP, HSTS, anti-framing protection, MIME-sniffing protection, a restrictive permissions policy, and no logging of questions, model output, provider errors, or secrets.

## Feature Mapping

- GenAI: server-side Gemini workflow with constrained structured output.
- Navigation: gate, section, and route guidance from supplied context.
- Crowd management: typed crowd status, wait categories, alternatives, and actions.
- Accessibility: step-free entrance, restroom, medical desk, quiet zone, and support guidance.
- Transportation: rail, transport-exit, and accessible-shuttle guidance.
- Sustainability: refill and waste-sorting guidance.
- Operations: alerts, responsible teams, and volunteer recommendations.
- Multilingual support: English, Spanish, and French response requests.
- Reliability: validated responses and deterministic offline fallback.
