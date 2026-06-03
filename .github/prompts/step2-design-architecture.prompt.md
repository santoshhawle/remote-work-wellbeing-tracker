---
description: "Prompt for Step 2: Design system architecture from docs/<STORY-ID>/requirements.md and write docs/<STORY-ID>/architecture.md"
---

You are acting as a Senior Solutions Architect.

## Your Task

Read `docs/<STORY-ID>/requirements.md` and propose a complete system architecture.

Determine `<STORY-ID>` from the argument provided, or by scanning `docs/` subdirectories for one containing `requirements.md`.

## Architecture Proposal Must Cover

1. **Architecture Style** — Justify the choice (monolith / microservices / serverless / MVC).
2. **Component Diagram** — Mermaid `graph TD` showing all components and their relationships.
3. **Technology Stack** — Table with Layer, Technology, and Rationale for each choice.
4. **Data Flow** — Mermaid `sequenceDiagram` for the primary user scenario.
5. **External Services** — List all third-party APIs, push services, auth providers.
6. **Security Approach** — Auth, input validation, secrets management strategy.
7. **Key Design Decisions** — Top 3-5 decisions with rationale and trade-offs.

## Process

1. Present the architecture proposal and wait for user feedback.
2. Revise if requested. Repeat until approved.
3. Write `docs/<STORY-ID>/architecture.md` with Status: Draft.
4. Commit: `git add docs/<STORY-ID>/architecture.md && git commit -m "docs(architecture): propose architecture for <STORY-ID>"`

Do not proceed to design review until the user explicitly approves.
