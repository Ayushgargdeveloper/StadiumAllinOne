# StadiumPulse AI

## Challenge Statement

Challenge 4: Smart Stadiums & Tournament Operations. Build a GenAI-enabled solution that enhances stadium operations and the tournament experience for FIFA World Cup 2026 fans, organizers, volunteers, or venue staff.

## Minimal Solution Summary

StadiumPulse AI is a lightweight offline stadium operations assistant with three modules: a multilingual GenAI-style assistant, crowd and operations decision support, and inclusive fan support.

## Offline GenAI Workflow

StadiumPulse AI demonstrates a safe offline GenAI workflow using intent recognition, contextual stadium information retrieval, multilingual response generation, and operational decision-support templates.

No external LLM, live AI API, API key, backend, database, map SDK, chart library, or live integration is used.

## Feature-to-Challenge Mapping

- Navigation: assistant intent and typed gate guidance.
- Crowd management: compact location statuses and wait categories.
- Accessibility: assistant intent, accessible entrance, restroom, medical desk, quiet zone, and alerts.
- Transportation: assistant intent, transport exit, public transport, and accessible transport guidance.
- Sustainability: assistant intent, water refill, waste separation, and public transport recommendation.
- Multilingual assistance: English, Spanish, and French response templates.
- Operational intelligence: typed stadium context and operations alerts.
- Decision support: recommended actions, alternatives, teams, and response guidance.

## Technology Stack

React, Vite, TypeScript strict mode, lightweight CSS, Vitest, React Testing Library, and jest-axe for automated accessibility testing.

## Setup Commands

```bash
npm install
```

## Run Commands

```bash
npm run dev
```

## Test and Coverage Commands

```bash
npm run lint
npm run test
npm run coverage
npm run build
npm audit
```

## Evaluation-Criteria Mapping

- Code Quality: typed data, centralized constants, strict TypeScript, focused components, and business logic outside JSX.
- Problem Statement Alignment: explicit FIFA World Cup 2026 stadium operations, fan support, volunteer/staff support, multilingual support, crowd support, accessibility, transportation, sustainability, and decision support.
- Security: offline workflow, no secrets, no persistence, sanitized input, length limit, safe language validation, and no unsafe HTML.
- Efficiency: static typed data, no heavy runtime packages, no network requests, no timers, no charts, no maps, and small deterministic logic.
- Testing: utility, component, interaction, rendering, coverage-threshold, and accessibility tests.
- Accessibility: semantic landmarks, logical headings, labeled controls, visible focus, aria-live response output, aria-describedby helper text and count, visible status text, and responsive layout.

## Security Note

User questions are sanitized, validated, processed locally, and never persisted. The app does not use `dangerouslySetInnerHTML`, `eval`, dynamic code execution, network requests, API keys, or credentials.

## Accessibility Note

The interface uses semantic structure, visible focus states, strong contrast, labeled controls, connected helper text, visible status labels, and automated accessibility checks.
