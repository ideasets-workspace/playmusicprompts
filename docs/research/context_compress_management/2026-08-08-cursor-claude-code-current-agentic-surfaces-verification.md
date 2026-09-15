# Cursor 3.15.x & Claude Code 2.1.2xx — current agentic surfaces: documentation-vs-reality verification (Round 2)

Date: 2026-08-08 · Status: IN PROGRESS — being written section by section this session.

# Standards ledger

Read THIS session, from disk: `.claude/rules/research-standard.md` [FULL] ·
`.claude/rules/research-delegation-mandate.mdc` [FULL] · `AGENTS.md` (§RESEARCH FLOOR) [FULL] ·
`.claude/memory/STATE.md` [FULL] · `C:\Users\berke\.claude\skills\deep-research\SKILL.md` [FULL] ·
scope plan: `docs/research/_runs/2026-08-08-cursor-claude-code-current-agentic-surfaces-verification.scope-plan.md` ·
preflight: `docs/research/_runs/2026-08-08-cursor-claude-code-current-agentic-surfaces-verification.preflight.json`.

# The question

Round 2 of Berk's context-compaction protection order: verify every Round-1 "measured fact"
against the NEWEST primary documentation (Cursor 3.15.x, Claude Code 2.1.2xx), enumerate the
complete current hook/rules/skills/subagent/settings surfaces of both tools with verbatim schemas,
and establish the frontier division of labor (rules vs AGENTS.md vs skills vs hooks) including
compaction survival per channel. The delegating agent rewires the project's hooks on this document
within hours; a wrong event schema means dead protection.

# Outcome first

1. **Every Round-1 measured fact named in the brief is CONFIRMED by current primary docs except
   one interpretation error**: Claude Code `hooks.md` lines 947–948 exist verbatim, but the
   reading "only SessionStart/Setup/SubagentStart can add context" is WRONG — that line is the
   "Context only" decision-control row. **Eleven** Claude Code events can inject
   `additionalContext` that reaches the model (SessionStart, Setup, SubagentStart,
   UserPromptSubmit, UserPromptExpansion, PreToolUse, PostToolUse, PostToolUseFailure,
   PostToolBatch, Stop, SubagentStop). `PreCompact`/`PostCompact` still cannot.
2. **Claude Code's compaction threshold is now CONFIGURABLE** (`/autocompact`, `autoCompactWindow`
   100k–1M tokens, `--autocompact`, `CLAUDE_CODE_AUTO_COMPACT_WINDOW`) and `PreCompact` **can
   BLOCK a proactive auto-compaction** (exit 2 or `decision:"block"`). Cursor's ~90% server-side
   trigger remains not configurable [STAFF, re-verified].
3. **Claude Code publishes an explicit compaction-survival table** (`context-window.md`):
   project-root CLAUDE.md + unscoped `.claude/rules/*.md` + auto memory are **re-injected from
   disk**; `paths:`-scoped rules and nested CLAUDE.md are **lost** until a matching file is read;
   invoked skill bodies re-injected capped at 5,000 tokens/skill, 25,000 total; the skills
   listing itself is NOT re-injected — only invoked skills survive.
4. **`research-standard.md` carrying `paths: ["**/*"]` is confirmed to be in the LOST class** —
   any `paths` frontmatter makes a rule path-scoped; dropping the field makes it unconditional
   and re-injected. This is the single highest-value one-line fix in the project.
5. **Cursor surfaces confirmed at 3.15.x:** 21 hook events; `preCompact` observational
   (`user_message` only, 7 read-only input fields); NO `postCompact`; `beforeSubmitPrompt` has no
   context field; `sessionStart.additional_context` → initial system context (absent in cloud
   agents); `postToolUse.additional_context` → conversation (compacted). Plain `.md` in
   `.cursor/rules` is **ignored**; `.mdc` frontmatter semantics confirmed; skills now discovered
   from `.cursor/skills/`, `.agents/skills/`, AND (compat) `.claude/skills/` + `.codex/skills/`;
   subagents live in `.cursor/agents/*.md`.

# Sources — 24 total, of which 5 academic (both floors met; counts reported per the law)

| # | Source (dated) | Tier | Read |
|---|---|---|---|
| 1 | cursor.com/docs/agent/hooks.md — fetched 2026-08-08, 1,464 lines | first-party | [FULL] |
| 2 | code.claude.com/docs/en/hooks.md — fetched 2026-08-08, 3,339 lines | first-party | [FULL] |
| 3 | cursor.com/docs/context/rules.md — 2026-08-08 | first-party | [FULL] |
| 4 | code.claude.com/docs/en/memory.md — 2026-08-08, 461 lines | first-party | [FULL] |
| 5 | code.claude.com/docs/en/context-window.md — 2026-08-08 | first-party | [FULL] |
| 6 | cursor.com/docs/skills.md — 2026-08-08 | first-party | [FULL] |
| 7 | code.claude.com/docs/en/skills.md — 2026-08-08, 959 lines | first-party | [FULL] |
| 8 | code.claude.com/docs/en/sub-agents.md — 2026-08-08, 1,252 lines | first-party | [FULL] |
| 9 | cursor.com/docs/agent/subagents.md — 2026-08-08 | first-party | [FULL] |
| 10 | code.claude.com/docs/en/settings.md — 2026-08-08, 1,244 lines | first-party | [FULL] |
| 11 | github.com/anthropics/claude-code CHANGELOG.md (raw, head = 2.1.226) — 2026-08-08 | THE DARK | [FULL] |
| 12 | cursor.com/changelog (entries Jul 17 – Aug 3, 2026) — 2026-08-08 | THE DARK | [FULL] |
| 13 | cursor.com/docs/agent/prompting.md — 2026-08-08 | first-party | [FULL] |
| 14 | agentskills.io/specification — 2026-08-08 | standard | [FULL] |
| 15 | forum.cursor.com/t/166182 staff answer (deanrie, 2026-07-20) — re-fetched 2026-08-08 | THE DARK / staff | [FULL] |
| 16 | arXiv 2606.22528 — Governance Decay (Shiyang Chen) — ID fetch-verified 2026-08-08 | ACADEMIC | [FULL abstract+intro; Round-1 [FULL]] |
| 17 | arXiv 2607.25066 — ARC: Addressable Recall Compaction (Dang, Ichikawa et al.) — fetch-verified | ACADEMIC | [FULL abstract+body fetched] |
| 18 | arXiv 2606.11213 — Beyond Compaction: Structured Context Eviction (Semenov & Dorofeev, 2026-04-21) — fetch-verified | ACADEMIC | [ABS+§ fetched] |
| 19 | arXiv 2607.23809 — ACM: Agentic Context Management (CMU + Meta, Li, Ming, Chu, Shao, Jin, Xiong) — fetch-verified | ACADEMIC | [ABS+§ fetched] |
| 20 | arXiv 2307.03172 — Lost in the Middle (Liu et al., TACL 2024 12:157–173) — fetch-verified | ACADEMIC | [FULL page fetched] |
| 21 | cursor.com/help/customization/skills — 2026-08-08 (via search) | first-party | [ABS] |
| 22 | localskills.sh/blog/cursor-skills-guide — 2026 | third-party | [ABS] |
| 23 | meshlaunch.com 2026 Cursor Agent Skills guide | third-party | [ABS] |
| 24 | singhajit.com how-to-create-and-use-skills-in-cursor | third-party | [ABS] |

Local disk evidence (primary for project claims): `.claude/settings.json`, `.cursor/hooks.json`,
`.claude/hooks/context-recovery-gate.cjs` (26,757 B claim: measured 26,757 B per brief; SHA-256
`B930456F8F81…` this session), both Round-1 docs (82,807 B / 95,454 B re-measured this session).

