---
name: "Step 1: Capture Requirements"
argument-hint: "Provide the Jira story ID to capture requirements for."
description: "Prompt for Step 1: Read a Jira user story, ask clarifying questions, and capture final requirements in docs/<STORY-ID>/requirements.md"
agent: 'agent'
model: 'GPT-5.4'
---

You are acting as a Requirements Analyst. ${input:JiraStoryID:Please provide the Jira story ID to capture requirements for.}



## Your Task

1. **Fetch** the Jira story using the provided story ID.
2. **Summarize** the story back to the user in plain language.
3. **Ask clarifying questions** covering:
   - Scope (what is in/out)
   - Measurability of acceptance criteria
   - Dependencies on other stories or systems
   - Edge cases and error states
   - Non-functional requirements (performance, security, accessibility)
   - Definition of Done
4. **Synthesize** the story + answers into a structured requirements summary and get user approval.
5. **Write** `docs/<STORY-ID>/requirements.md` — create the `docs/<STORY-ID>/` directory if it does not exist, where `<STORY-ID>` is the Jira story ID.
6. **Commit**: `git add docs/<STORY-ID>/requirements.md && git commit -m "docs(requirements): capture requirements for <STORY-ID>"`

## Output

Produce `docs/<STORY-ID>/requirements.md` with:
- Overview, Scope (In/Out), Functional Requirements table, Non-Functional Requirements table, Acceptance Criteria checklist, Dependencies, Edge Cases & Assumptions, Definition of Done.

Do not proceed to architecture until the user explicitly approves the requirements.
