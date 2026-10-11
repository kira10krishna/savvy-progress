# savvy-progress

A Claude Code mod: a progress bar above the prompt and a live panel of agents. Made for the [savvy-flow](../savvy-flow) skill, and useful with any subagents.

Derived from [`savvy-progress`](https://github.com/JohnnyVizz/claude-kit/tree/main/plugins/savvy-progress) by johnnyvizz (MIT). See [LICENSE](LICENSE).

## Install

```
/plugin install savvy-progress --marketplace kira10krishna/savvy-progress
```

Answer `y` to add the marketplace, then pick a scope. The plugin's hooks run in that session from then on, with no reload, and in each session you start after.

## Progress bar

Shown above the prompt, with the flow's title, phase, accepted tasks out of planned, and a crew button (`×N`) that opens the panel. A line under it names each running agent and what it is doing now (its current step, then its in-flight tool call).

- **With a flow:** appears once something reports progress (savvy-flow does) or a `savvy-*` worker starts. `✕` dismisses it, and a finished flow clears on your next message.
- **Without a flow:** whenever a subagent is running, a plain "N agents working" bar stands in, counting how many of the current group have finished. It clears itself when they finish.

## Agents panel (`/agents-info` toggles it)

The Main agent is always listed first, then agents with a call in flight or an approval pending, then the newest. Reruns of the same task show once, as the latest run.

- **List view**
  - Each agent shows model, effort, context, cost and time, plus chips for its permission mode, a pending approval (`⏸ approve <tool>`), approvals asked, and calls blocked by a hook or rule.
  - A `Tasks` toggle at the top opens or hides every agent's lists. It starts hidden. With everything hidden, each agent keeps its own `▸ Tasks` button; with everything shown, those buttons go away.
  - Opened, an agent's lists have a **Plan** (its steps, ✓ done, ● running, ◷ planned; for the Main agent, the flow's planned workers) and **Activity** (every tool call, newest first). Each section opens and closes at its own header.
  - **Activities to show** takes a number (1–999) to limit the Activity rows; `Show all` and `Show N` switch between all and your number.
- **Kanban view** (`Kanban` tab): Planned, Running and Done columns of cards for the flow's planned workers and the agents.

A finished agent reads as fully done (`6/6`), whatever step count it last reported.

## Commands

- `/agents-info`: show or hide the panel.
- `/agents-log`: write the whole run (steps, models, cost, approvals, blocks) to `~/.claude/savvy-progress-log.md`.

## Tools it adds

- `mcp__savvy-progress__progress`: the orchestrator reports the plan, phase and accepted tasks.
- `mcp__savvy-progress__step`: a worker reports its own steps (`done`, `total`, `note`). Pass `plan`, a list of the step titles, with the first call so the panel lists every step up front; without it, the remaining steps show as `Step N`. A worker that does not report shows its context fill in grey instead.

Cost is a rough estimate from token counts and a built-in per-model price table (`PRICES` in `hooks/register.tsx`), not a bill.

## Settings

`language`: `auto` (default), `en` or `ru`. `auto` follows Claude Code's `language` setting, then the system locale, and falls back to English. Set it in `/config`, or, for a mod loaded by hand, in `~/.claude/settings.json`:

```json
{ "pluginConfigs": { "savvy-progress": { "options": { "language": "ru" } } } }
```

The panel's new labels (Plan, Activity, Kanban, the show-count) are English only.

## Development

```bash
claude plugin validate .
claude plugin test .
```

Run the mod from its folder with `claude --plugin-dir .`.
