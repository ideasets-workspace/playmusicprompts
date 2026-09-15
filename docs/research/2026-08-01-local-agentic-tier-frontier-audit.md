# Local agentic-tier frontier audit — research basis and applied deltas

**Date:** 2026-08-01 · **Project:** SsmContentAssetCreator · **Author:** Fable 5 session (Cursor)
**Standards ledger:** read THIS session — global rules 00–16 (injected), project AGENTS.md +
CLAUDE.md, `.claude/memory/{STATE,DECISIONS,infra,MEMORY}.md`, and the corpus documents below.
**The decision this serves:** Berk's order to raise this project's local `.claude`/`.cursor` tier
to the level Anthropic applies internally ("anthropic'in kendi içinde kodlarda uyguladığı
seviyede... karanlığı aydınlat"), grounded in research — not rote.

## Corpus documents read (recency-first; all from the folders Berk named)

| Doc (full path) | Mark | Load-bearing content used |
|---|---|---|
| `C:\Berk\Research&BrainStorming&Optimization\docs\moviemaker\research\2026-07-30-hook-runtime-synthesis-and-recommendation.md` | [FULL] | Gate-daemon verdict is DEFERRED by Berk (rule 15 §4.3) — no daemon work here; free wins (30s timeouts, absolute paths, compile cache) already global; per-project copies legitimate via global-sync |
| `C:\Berk\Research&BrainStorming&Optimization\docs\moviemaker\research\2026-07-27-agentic-infrastructure-beyond-frontier.md` | [FULL] | 22 src/10 academic. G1–G7 gap table; we are AHEAD on CAS write safety, consent, dual-protocol parity; effective-harnesses `passes:false` registry pattern (Anthropic 2025-11-26) |
| `C:\Berk\Research&BrainStorming&Optimization\docs\moviemaker\research\2026-07-12-anthropic-internal-agent-engineering.md` | [FULL] | 16 primary sources. Anthropic-internal bar: verification hierarchy (rules-based → visual → LLM-judge last), numeric effort scaling (1 agent/3–10 calls; 2–4 subagents/10–15 calls), 1,000–2,000-token distilled summaries, end-state evaluation, poka-yoke tool design, feature-checklist-as-eval |
| `C:\Berk\Research&BrainStorming&Optimization\docs\moviemaker\research\2026-07-22-cursor-context-compaction-management.md` | [FULL first 120 + verdict sections] | Compaction survival = alwaysApply rules + AGENTS.md + disk tiers (re-stamped every turn); preCompact is observational-only in Cursor |
| `C:\Berk\AgenticDevelopment\docs\research_2\2026-07-18-config-maturity-rubric.md` | [FULL first 200] | 18-dimension external rubric; "a file that intends X is a 2, not a 4" — proof artifacts required |
| `C:\Berk\AgenticDevelopment\docs\research_2\2026-07-17-nested-agentic-config-structure.md` | [FULL] | One enforcement layer at root; capability parity ≠ listing parity; nested config trees unsupported |

Counts: 6 corpus documents this scope (4 [FULL], 2 [FULL-partial marked]); the corpus documents
themselves carry 22+16+94 external sources incl. 10+26 academic — this audit APPLIES their
verified findings locally; it did not re-run external discovery (WebSearch not needed: the corpus
is ≤5 days–3 weeks old and the platform facts are pinned in rules 13/15/16).

## Gap-check: this project's local tier vs the Anthropic-internal bar

| Bar (source) | Local state BEFORE today | Applied delta (all proven this session) |
|---|---|---|
| Deterministic gates + proof artifacts (rubric dim 3/10) | 13 mirror hooks, 0 project proof harnesses | `scripts/verify-write-safety.cjs` 11/11 · `scripts/verify-fs-gate.cjs` 16/16 · dual-protocol incl. Claude-proto |
| Memory tier complete + append-only (dim 2) | STATE + infra only | + DECISIONS.md (D-SSM-1..3) + MEMORY.md (L1–L6) + governed-paths declarations |
| Feature-checklist-as-eval / `passes:false` registry (effective-harnesses) | none — "done" was narrative | `.claude/memory/worker-registry.json`: 179 variants, 179 deployed (live list-functions snapshot, 196 fn), 9 fault-marked, **invoke_verified 0/179 — honest**; generator never auto-verifies |
| Numeric delegation + distilled-summary budgets (multi-agent system) | qualitative only (global rules/06) | `delegation-quant` rule (.md + .mdc): 1/3–10, 2–4/10–15, 1–2k-token summaries, end-state eval, sibling-variant fan-out law |
| Poka-yoke over prose bans (SWE-bench harness) | prose bans only | fs-verification-gate (banned class impossible), registry honesty contract in code |
| File checks from reality (Berk's law) | git-based checks possible | D-SSM-1 law + gate + canonical FS tool |
| Stale executable copies killed (rule from 2026-07-27) | README runbook + rules pointed at retired account | fixed in lambda-pattern (both mirrors) + README (worker name live-verified) |

## Honest limits

- `invoke_verified` is 0/179 by design: no worker was invoked this session; the registry exists so
  each future invoke flips exactly one entry with pasted evidence.
- Deploy scripts/buildspecs still carry the retired account (MEMORY.md L2) — separate Berk-approved task.
- The corpus was read selectively (6 docs, newest + most load-bearing for THIS scope); the
  remaining ~90 corpus files were inventoried by name/date but not read this session.
- G1 (telemetry-distillation loop) and the gate daemon are GLOBAL-tier work, deferred/owned by
  Berk's other tracks — deliberately not duplicated here (one enforcement layer at the root).
