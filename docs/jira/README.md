# Jira Management Plan

This folder contains Jira-ready project management artifacts for CivilizationX.

There is no Jira connector available in this Codex session, so the backlog is stored as importable project files:

- `civilizationx-backlog.csv`: Jira CSV import backlog.
- `sprint-0.md`: first execution sprint.
- `workflow.md`: recommended Jira workflow, issue types, labels, and definition of done.

## Recommended Jira Project

- Project name: CivilizationX
- Project key: CIVX
- Project type: Scrum
- Default issue types: Epic, Story, Task, Bug, Spike

## Import Steps

1. Open Jira.
2. Go to project settings or system import.
3. Choose CSV import.
4. Upload `docs/jira/civilizationx-backlog.csv`.
5. Map columns:
   - `Issue Type` -> Issue Type
   - `Summary` -> Summary
   - `Epic Name` -> Epic Name
   - `Epic Link` -> Epic Link or Parent/Epic field, depending on Jira version
   - `Priority` -> Priority
   - `Labels` -> Labels
   - `Description` -> Description
   - `Acceptance Criteria` -> Description or a custom field

If Jira refuses `Epic Link` during import, import epics first, then import stories/tasks and bulk-link them manually by epic name.

## Operating Principle

CivilizationX is too large to manage as a flat TODO list. Jira should be used to protect focus:

- Epics represent major product systems.
- Stories represent user-visible or contributor-visible outcomes.
- Tasks represent implementation work.
- Spikes represent research needed before safe implementation.
- Bugs represent defects in code, data, safety, graph integrity, or documentation.
