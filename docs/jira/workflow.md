# Jira Workflow

## Issue Types

- Epic: major workstream or product system.
- Story: user-visible capability or contributor-facing workflow.
- Task: engineering, content, documentation, or validation work.
- Spike: research or design exploration with a time box.
- Bug: defect or regression.

## Statuses

- Backlog
- Ready
- In Progress
- In Review
- Blocked
- Done

## Labels

- `tree`
- `documentary`
- `atlas`
- `pathfinder`
- `safety`
- `verification`
- `media`
- `offline`
- `space`
- `collapse`
- `content`
- `infrastructure`
- `community`
- `schema`
- `print`
- `ux`

## Priority

- Highest: safety, data corruption, broken build, broken offline access.
- High: core product differentiators and validation.
- Medium: important feature work.
- Low: polish and non-blocking enhancements.

## Definition Of Ready

An issue is ready when it has:

- Clear outcome.
- Scope boundaries.
- Acceptance criteria.
- Relevant files or data areas identified.
- Safety implications identified.
- Verification plan.

## Definition Of Done

An issue is done when:

- Code or content is implemented.
- `npm run validate-data` passes if data changed.
- `npm run lint` passes if code changed.
- `npm run build` passes for app changes.
- Safety notes are included for high-risk content.
- Documentation is updated if behavior or workflow changed.
- Follow-up Jira issues are created for deferred work.

## Review Rules

- Medical, structural, electrical, pressure, radiation, biological, and chemical content must be treated as high-risk.
- High-risk entries cannot be marked expert-verified without reviewer identity and date.
- Generated images may explain concepts but must not be treated as evidence.
- Unverified content must remain visibly unverified.
