# Issue tracker: Jira

Issues live in Jira project `TIP` on `bellaajoussema77.atlassian.net` (cloudId `203a6ec4-6737-4c4f-b4fa-39ae4b9de0f4`). Use the Atlassian MCP tools (`mcp__atlassian__*`), not the GitHub CLI.

## Conventions

- **Create an issue**: `createJiraIssue` with project key `TIP`. Issue types: `Tâche` (default), `Epic` (groups related tasks), `Sous-tâche` (subtask), `Idea`, `Item`, `Request`.
- **Read an issue**: `getJiraIssue` with the key (e.g. `TIP-12`).
- **List/search issues**: `searchJiraIssuesUsingJql`, e.g. `project = TIP AND statusCategory != Done`.
- **Comment on an issue**: `addCommentToJiraIssue`.
- **Change status**: `getTransitionsForJiraIssue`, then `transitionJiraIssue`.
- **Link issues**: `createIssueLink` (see `getIssueLinkTypes`).

## When a skill says "publish to the issue tracker"

Create a Jira issue in project `TIP`. When it says "fetch the relevant ticket", read it by key with `getJiraIssue`.
