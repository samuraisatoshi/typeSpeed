---
description: Set up team workspace — register workspace, configure dependencies, link sprints
---

Guide through team workspace initialization.

**1. Workspace** — `workspace-info` to check if workspace is registered. If not: register via `workspace-update` or CLI.
**2. Sprint** — `kanban-sprint-list` to check active sprint. If none: `kanban-sprint-create` to create one.
**3. Dependencies** — `workspaces-i-depend-on` and `workspaces-depending-on-me` to review links. Add missing links with `workspace-link`.
**4. Board** — `kanban-board-view` to confirm board is accessible and healthy.

Final summary: workspace ID, sprint, dependency count.
