# R3 Scope plan — Cursor & Claude Code current agentic surfaces verification (Round 2)

Date: 2026-08-08 · Run: documentation-vs-reality verification at newest versions

1. **Exact decision served:** which hook events, rule formats, skill formats, and subagent/settings
   schemas the delegating agent will wire (within hours) when rebuilding this project's
   context-compaction protection and agentic layout for Cursor 3.15.x and Claude Code 2.1.2xx —
   a wrong event schema means dead protection.
2. **Why:** Berk's order today — complete compaction protection for the NEWEST tool versions and a
   world-frontier agentic structure (.cursor + .claude rules/skills/hooks/AGENTS.md/CLAUDE.md/
   settings), zero orphan/unwired files. Round 1 (two 80–95 KB docs) established measured facts;
   Round 2 verifies each against current primary docs and covers the missing surfaces.
3. **Project context:** SsmContentAssetCreator — ~180 AWS Lambda asset-generation packages plus the
   new film product. Machine facts: Cursor 3.15.6, Claude Code 2.1.217 (installed, never run in
   this repo). Current wiring: `.claude/hooks/context-recovery-gate.cjs` in `.claude/settings.json`
   (UserPromptSubmit, SessionStart[compact], PreCompact, PostCompact) and `.cursor/hooks.json`
   (sessionStart, beforeSubmitPrompt, preCompact, postToolUse) + 14 other local gates.
4. **Complete topic and subquestions:** (Q1) complete current hook event lists + exact I/O schemas +
   which events inject context reaching the model + new capabilities since ~2026-07, with a
   CONFIRM/REFUTE verdict per Round-1 measured fact; (Q2) complete rules surfaces (.cursor/rules
   .mdc frontmatter semantics, plain .md support, AGENTS.md nesting; .claude/rules nativeness,
   CLAUDE.md @-imports, auto-memory limits); (Q3) complete skills surfaces (both tools: schema,
   discovery, invocation); (Q4) subagent config + settings.json/hooks.json schemas; (Q5) frontier
   division of labor rules-vs-AGENTS.md-vs-skills-vs-hooks incl. compaction survival per channel.
5. **Reversal/falsification evidence:** a current primary doc or changelog line contradicting a
   Round-1 measured fact flips that fact to REFUTED and changes the wiring plan.
6. **Inclusion/exclusion:** first-party docs and changelogs of Cursor and Anthropic lead; GitHub
   changelogs/issues and staff forum answers as THE DARK; arXiv IDs verified by fetching; blogspam
   excluded; English sources; window 2025-07 → 2026-08-08 (newest first).
7. **Verticals:** the two tools (Cursor, Claude Code) × five surfaces (hooks, rules, skills,
   subagents, settings) — derived from the delegation order verbatim; geography not applicable.
8. **Geography:** GLOBAL (not applicable to tool documentation).
9. **Temporal scope:** current versions (Cursor 3.15.x docs live; Claude Code 2.1.226 changelog head
   vs 2.1.217 installed); historical lineage only for version-gated behaviors (e.g. v2.1.198+).
10. **Candidate universes:** Cursor docs + forum staff answers + changelog; Anthropic
    code.claude.com docs + anthropics/claude-code CHANGELOG.md; agentskills.io spec; arXiv
    (2606.22528, 2607.25066, 2606.11213, 2607.23809, 2307.03172); local disk evidence (configs,
    hooks, Round-1 docs).
11. **Planned folder/file tree (total 21 files):**
    1 main report `docs/research/context_compress_management/2026-08-08-cursor-claude-code-current-agentic-surfaces-verification.md` ·
    19 source archives under `docs/research/_sources/2026-08-08-*` (14 copied fetch captures +
    5 written excerpts: cursor-rules-doc, cursor-skills-doc, cursor-prompting-context-categories,
    cursor-forum-166182-compaction-threshold, agentskills-io-specification) ·
    1 index update `docs/README.md` (edit, not new file) + this scope plan + preflight + manifest
    under `docs/research/_runs/` (3 run-control files).
12. **Hard-law check:** research-standard.md (≥20/≥5 floors, SEARCH-FIRST, tiers, documentation —
    satisfied by design of this run) · fs-verification (all file checks via FS — hashes above) ·
    no-narrowing (all 5 numbered research questions covered) · English-artefacts law · execution
    limits (write only under docs/research/** and docs/README.md) — all pass.
13. **Completion semantics:** complete when every Round-1 measured fact named in the brief has a
    CONFIRM/REFUTE verdict from a current primary source; both tools' five surfaces each have a
    documented schema verdict; counts ≥20/≥5 reported; known blind spot: behaviors only observable
    by running Claude Code 2.1.217 live in this repo (never run here) remain [UNVERIFIED-RUNTIME].
