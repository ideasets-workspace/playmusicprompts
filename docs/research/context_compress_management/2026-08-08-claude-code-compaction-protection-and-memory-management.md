# Claude Code — context-compaction PROTECTION and MEMORY MANAGEMENT

**Date:** 2026-08-08 · **Scope:** Claude Code ONLY (a sibling research pass covers Cursor)
**Author:** research agent (Round 1, Agent B of 2), working in `C:\Berk\SsmContentAssetCreator`

---

## 0. Standards ledger

Read IN FULL from disk this session, before any research:

| File | Bytes / lines read |
|---|---|
| `.claude/rules/research-standard.md` | 86 lines, full |
| `.claude/rules/research-delegation-mandate.mdc` | 30 lines, full |
| `CLAUDE.md` | 33 lines, full |
| `AGENTS.md` | 256 lines, full |
| `.claude/memory/MEMORY.md` | 750 lines, full (L1–L32; L29–L32 in detail) |

**Conflicts between this document's brief and the rules:** ONE, reported and not resolved by me.
The delegation brief specifies the output path `docs/research/context_compress_management/...`, while
`.claude/rules/research-standard.md` §Documentation and `AGENTS.md` §RESEARCH FLOOR both specify
`docs/moviemaker/research/YYYY-MM-DD-<kebab-topic>.md`. The brief's path was used because the brief
states the exact path twice and `no-narrowing` §4 forbids an agent deciding a reduction/relocation on
its own; the divergence from the rules' convention is flagged here for Berk's decision rather than
silently reconciled. Both the brief and the rules agree the file must be indexed in `docs/README.md`.

---

## 1. The question this research answers

The current context-compaction mechanism in this project (`.claude/hooks/context-recovery-gate.cjs`,
wired in both tools, plus a portable copy at `C:\Berk\Cursor_Hooks` about to be installed into every
project on this machine) was designed on research that covered **DETECTION only**. It was never
established what actually **PROTECTS** an agent's working knowledge across a compaction, how memory
should be organised and re-loaded, what artefact carries it, or what a compaction really does to
everything already in the window.

Berk's stated focus, verbatim: *"odağımız context compress de en ileri seviyede koruma memeory
management başka birşey değil"* — the most advanced possible PROTECTION at context compaction, and
MEMORY MANAGEMENT, nothing else.

Every claim below is marked as either **[DOCUMENTED]** (a primary Anthropic doc states it) or
**[OBSERVED]** (measured on this machine this session, with the artefact named). Under this project's
MEASUREMENT LAW a printed schema is evidence of what is documented, never of what happens.

---

## 2. Version established by MEASUREMENT, not assumption

| Fact | Value | How measured (this session) |
|---|---|---|
| Claude Code CLI **is installed** | yes | `where.exe claude` → `C:\Users\berke\AppData\Roaming\npm\claude` |
| CLI version | **2.1.217** | `claude --version` → `2.1.217 (Claude Code)` |
| npm package | `@anthropic-ai/claude-code@2.1.217` | `npm ls -g --depth=0` |
| Package dir on disk | `C:\Users\berke\AppData\Roaming\npm\node_modules\@anthropic-ai\claude-code`, mtime 2026-07-22 07:33 UTC | `Get-ChildItem` |
| A **second, newer** Claude Code also ran on this machine | **2.1.219**, `entrypoint: "claude-desktop"` | `version` field inside the transcript record quoted in §5 |
| Latest published version at time of writing | **2.1.226** | first heading of `anthropics/claude-code` `CHANGELOG.md` fetched this session |

**Consequence:** the installed CLI is **9 releases behind** the published head. Every behavioural claim
below carries the version the documentation attaches to it. Where a doc says "requires v2.1.2xx", the
installed 2.1.217 is checked against it explicitly.

**A finding, not a gap:** `C:\Users\berke\.claude\projects\` contains exactly **2** project
directories — `C--Berk-GeoMagics` and `C--Berk-Research-BrainStorming-Optimization`. There is **no
directory for `C:\Berk\SsmContentAssetCreator`.** Claude Code has therefore **never held a session in
this project**, so every Claude-Code-side hook wired in `.claude/settings.json` here — including
`context-recovery-gate.cjs` on `UserPromptSubmit`, `SessionStart(compact)`, `PreCompact` and
`PostCompact` — has **never fired in this repository**. `[OBSERVED]`

---

## 3. Sources

**Totals: 28 sources. Of these, 9 are ACADEMIC.** (Floor: 20 / 5.) Counted mechanically from the tables
below: 13 `P` rows + 9 `A` rows + 6 `T` rows = 28.
`[FULL]` = whole page/paper/section-set read this session. `[ABS]` = abstract + targeted sections.

### Tier 2 — Anthropic PRIMARY documentation and engineering material (13)

| # | Source | URL | Read |
|---|---|---|---|
| P1 | **Hooks reference** — complete event list, per-event input/output schemas, exit codes, timeouts | https://code.claude.com/docs/en/hooks.md | [FULL] (3,339 lines; §Hook lifecycle, §Configuration, §Hook input and output, §JSON output, §Decision control, §SessionStart, §Setup, §InstructionsLoaded, §UserPromptSubmit, §Stop, §PreCompact, §PostCompact, §SessionEnd, §Prompt-based hooks read line-by-line) |
| P2 | **How Claude remembers your project** (memory) | https://code.claude.com/docs/en/memory.md | [FULL] (461 lines) |
| P3 | **Explore the context window** — contains the canonical *What survives compaction* table | https://code.claude.com/docs/en/context-window.md | [FULL] (1,095 lines) |
| P4 | **How Claude Code works** — *When context fills up*, Compact Instructions | https://code.claude.com/docs/en/how-claude-code-works.md | [FULL] |
| P5 | **Environment variables** | https://code.claude.com/docs/en/env-vars.md | [ABS] (targeted: all `*COMPACT*`, `*MEMORY*`, `CLAUDE_ENV_FILE`, `MAX_CONTEXT` entries) |
| P6 | **Subagents** — `memory:` field, what loads at startup, subagent auto-compaction, `compact_boundary` | https://code.claude.com/docs/en/sub-agents.md | [ABS] (targeted: §What loads at startup, §Enable persistent memory, §Auto-compaction, §Resume subagents) |
| P7 | **Skills** | https://code.claude.com/docs/en/skills.md | [ABS] |
| P8 | **Anthropic Engineering — "Effective context engineering for AI agents"** (Applied AI team: Rajasekaran, Dixon, Ryan, Hadfield), pub. 2025-09-29 | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | [FULL] (139 lines) |
| P9 | **Claude Developer Platform — server-side Compaction** (`compact_20260112`, `pause_after_compaction`) | https://platform.claude.com/docs/en/build-with-claude/compaction | [ABS] |
| P10 | **Claude Cookbook — Context engineering: memory, compaction, and tool clearing** | https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools | [ABS] |
| P11 | **`anthropics/claude-code` CHANGELOG.md** (first-party repo, head = 2.1.226) | https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md | [ABS] (5,392 lines; all 88 `compact` matches read) |
| P12 | GitHub issue **anthropics/claude-code#46191** — "support additionalContext in PreCompact/PostCompact hook output" | https://github.com/anthropics/claude-code/issues/46191 | [ABS] |
| P13 | GitHub issue **anthropics/claude-code#50682** — "Stop/PreCompact/PostCompact need invisible model-context injection" (carries a support matrix) | https://github.com/anthropics/claude-code/issues/50682 | [ABS] |

### Tier 1 — ACADEMIC (9)

| # | Paper / venue | ID verified by fetching | Read |
|---|---|---|---|
| A1 | **ARC: Addressable Recall Compaction for Long Context-Window Control in AI Agents** — Thang Dang, Yuma Ichikawa, Sakina Fatima, Koichi Shirahata (Univ. of Ottawa / Fujitsu) | arXiv **2607.25066** — fetched, resolves, 1,242 lines | **[FULL]** |
| A2 | **ACM: Agentic Context Management for Long Horizon Tasks** — Xiaochuan Li, Ryan Ming, Meng Chu, Shuai Shao, Rong Jin, Chenyan Xiong (**Carnegie Mellon University** + **Meta**) | arXiv **2607.23809** — fetched, resolves | **[FULL]** |
| A3 | **Lost in the Middle: How Language Models Use Long Contexts** — Nelson F. Liu, Kevin Lin, John Hewitt, Ashwin Paranjape, Michele Bevilacqua, Fabio Petroni, **Percy Liang** (**Stanford**, **UC Berkeley**, Samaya AI). TACL 2024, **12:157–173**, DOI 10.1162/tacl_a_00638 | arXiv 2307.03172; ACL Anthology `2024.tacl-1.9` — both fetched | **[FULL]** (author PDF `cs.stanford.edu/~nfliu/papers/lost-in-the-middle.tacl2023.pdf`, incl. Table 1 and Appendix G tables) |
| A4 | **AI Agents Need Memory Control Over More Context** (Agent Cognitive Compressor, ACC) | arXiv **2601.11653** — fetched, resolves | [ABS] + §1–§3 |
| A5 | **TokenMizer: Graph-Structured Session Memory for Long-Horizon LLM Context Management** | arXiv **2606.06337** (DOI 10.48550/arxiv.2606.06337) — fetched | [ABS] |
| A6 | **AgentLongBench: A Controllable Benchmark for Long-Context Agents** (32K–4M tokens) | arXiv **2601.20730** — fetched; ID resolves (ar5iv HTML conversion fails, `arxiv.org/abs/` page live) | [ABS] |
| A7 | **Self-Sum: Teaching an Agent to Decide Itself When and What to Summarize** — Findings of ACL 2026, `2026.findings-acl.447` | ACL Anthology PDF fetched | [ABS] |
| A8 | **Beyond Static Summarization: Proactive Memory Extraction for LLM Agents** (ProMem) | arXiv **2601.04463** — fetched | [ABS] |
| A9 | **Recursively Summarizing Books with Human Feedback** — OpenAI (Wu, Ouyang, Ziegler, Stiennon, Lowe, Leike, Christiano) | arXiv **2109.10862** — fetched | [ABS] + §4.1.2 + App. G |

### Tier 3 — verified first-party code / third-party reverse-engineering (6)

| # | Source | URL | Read |
|---|---|---|---|
| T1 | The installed Claude Code npm package on this disk | `C:\Users\berke\AppData\Roaming\npm\node_modules\@anthropic-ai\claude-code` | [OBSERVED] |
| T2 | **A real Claude Code transcript containing a real compaction** on this machine | `C:\Users\berke\.claude\projects\C--Berk-Research-BrainStorming-Optimization\9eebbdb8-….jsonl` (1,240,095 B, 466 records) | **[OBSERVED]** — the single most valuable source in this document |
| T3 | wasnotwas — "How AI Coding Agents Handle a Full Context Window" (deobfuscated-bundle analysis: `bG6()`, `Rg()`, 13k constant, microcompaction) | https://wasnotwas.com/writing/context-compaction/ | [ABS] |
| T4 | claudefa.st — "Claude Code Context Buffer: The 33K–45K Token Problem" | https://claudefa.st/blog/guide/mechanics/context-buffer-management | [ABS] |
| T5 | niji.webs.me — "How Claude Code Compresses Your Conversation" (2026-03-08) | https://niji.webs.me/blog/2026-03-08-how-claude-code-compresses-context.html | [ABS] |
| T6 | dev.to/rulestack — "Which CLAUDE.md Files Claude Code Actually Loads (and in What Order)" | https://dev.to/rulestack/which-claudemd-files-claude-code-actually-loads-and-in-what-order-3be0 | [ABS] |

**Recency ordering used:** the primary docs (P1–P7, live at fetch time, describing v2.1.217–2.1.226
behaviour) and the 2607-series papers (A1, A2) led; A3 (TACL 2024) and A9 (2021) are used only because
they remain the state of the art for their specific claims — position effects on whether provided
content is used at all (A3, cited by A2, A4 and by the current implementation) and recursive-summary
error accumulation (A9, still the canonical measurement) — and their dates are stated here explicitly.
T4 explicitly self-describes its buffer numbers as an **undocumented** change; it is treated as
corroboration only, never as a load-bearing single source.

## 4. (a) The COMPLETE Claude Code hook event list — enumerated from Anthropic's own reference

Source: P1 `https://code.claude.com/docs/en/hooks.md`, §Hook lifecycle event table, read [FULL].
**31 events.** Enumerated from the doc's own table, not from any list supplied to me. Column
"Can add context?" is taken from P1 §Decision control, which is the authoritative per-event table.

| # | Event | Fires when | Matcher values | Can add context to the model? | Can block? | Exit-2 effect |
|---|---|---|---|---|---|---|
| 1 | `SessionStart` | session begins or resumes | `startup`, `resume`, `clear`, **`compact`**, `fork` | **YES** — `hookSpecificOutput.additionalContext` **and plain stdout**; inserted **at the start of the conversation, before the first prompt** | No | stderr to user only, shown as ` hook error`; Claude never sees it |
| 2 | `Setup` | `--init-only`, or `--init`/`--maintenance` with `-p` | `init`, `maintenance` | **YES** — `additionalContext` only (plain stdout goes to debug log only) | No | stderr to user only |
| 3 | `UserPromptSubmit` | prompt submitted, before processing | none | **YES** — `additionalContext` **and plain stdout**; placed **alongside the submitted prompt** | **Yes** | blocks the prompt **and erases it** |
| 4 | `UserPromptExpansion` | a typed command expands into a prompt | command name | **YES** — `additionalContext`, alongside the expanded prompt | **Yes** | blocks the expansion |
| 5 | `PreToolUse` | before a tool call | tool name | **YES** — `additionalContext`, next to the tool result | **Yes** | blocks the tool call |
| 6 | `PermissionRequest` | a call needs a permission decision | tool name | No (decision object only) | **Yes** | denies the permission |
| 7 | `PermissionDenied` | auto-mode classifier denied a call | tool name | No | No | exit code + stderr **ignored**; use `retry: true` |
| 8 | `PostToolUse` | after a tool succeeds | tool name | **YES** — `additionalContext`, next to the tool result; also `updatedToolOutput` | No | shows stderr to Claude; tool already ran |
| 9 | `PostToolUseFailure` | after a tool fails | tool name | **YES** — `additionalContext` | No | shows stderr to Claude |
| 10 | `PostToolBatch` | after a parallel batch resolves, before the next model call | none | **YES** — `additionalContext` | **Yes** | stops the agentic loop before the next model call |
| 11 | `Notification` | Claude Code sends a notification | notification type | No | No | stderr to user only |
| 12 | `MessageDisplay` | assistant text streams to screen | none | No — **display-only**, transcript and model keep the original | No | original text displayed |
| 13 | `SubagentStart` | a subagent is spawned | agent type | **YES** — `additionalContext`, at the start of the (sub)conversation | No | stderr in the **subagent's** transcript |
| 14 | `SubagentStop` | a subagent finishes | agent type | **YES** — `additionalContext` (non-error feedback, conversation continues) | **Yes** | prevents the subagent stopping |
| 15 | `TaskCreated` | a task is created via `TaskCreate` | none | No | **Yes** | rolls back the task creation |
| 16 | `TaskCompleted` | a task is marked completed | none | No | **Yes** | prevents completion |
| 17 | `Stop` | Claude finishes responding | none | **YES** — `hookSpecificOutput.additionalContext`, **at the end of the turn** | **Yes** | prevents stopping, continues the conversation |
| 18 | `StopFailure` | turn ends on an API error | error type (`rate_limit`, `overloaded`, …, 10 values) | No — **output and exit code are ignored** | No | ignored |
| 19 | `TeammateIdle` | an agent-team teammate is about to idle | none | No | **Yes** | teammate keeps working |
| 20 | **`InstructionsLoaded`** | a `CLAUDE.md` or `.claude/rules/*.md` file is loaded into context | `session_start`, `nested_traversal`, `path_glob_match`, `include`, **`compact`** | No — **observability only**, runs asynchronously | No | **exit code is ignored** |
| 21 | `ConfigChange` | a config file changes mid-session | `user_settings`, `project_settings`, `local_settings`, `policy_settings`, `skills` | No | **Yes** | blocks the change (except `policy_settings`) |
| 22 | `CwdChanged` | working directory changes | none | No | No | stderr to user only |
| 23 | `DirectoryAdded` | dir added via `/add-dir` / SDK | `slash_command`, `register_repo_root` | No | No | stderr to debug log |
| 24 | `FileChanged` | a **watched** file changes on disk | literal filenames (narrow charset: letters, digits, `_`, `\|` only) | No | No | stderr to user only |
| 25 | `WorktreeCreate` | a worktree is being created | none | No (prints a path) | **Yes** | **any** non-zero exit fails creation |
| 26 | `WorktreeRemove` | a worktree is being removed | none | No | No | logged in debug only |
| 27 | **`PreCompact`** | **before context compaction** | **`manual`, `auto`** | **NO** — see §4.1 | **Yes** | **blocks compaction** |
| 28 | **`PostCompact`** | **after compaction completes** | **`manual`, `auto`** | **NO** — "no event-specific output at all" | No | stderr to user only |
| 29 | `Elicitation` | MCP server requests user input | MCP server name | No | **Yes** | denies the elicitation |
| 30 | `ElicitationResult` | after user responds to an elicitation | MCP server name | No | **Yes** | blocks the response (becomes decline) |
| 31 | `SessionEnd` | session terminates | `clear`, `resume`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other` | No | No | stderr to user only |

### 4.1 The single most consequential finding in this section

**`PreCompact` and `PostCompact` CANNOT add context. This is not an implementation detail — it is the
fact that determines the whole architecture.** `[DOCUMENTED]`

P1 §Decision control, verbatim, lists `PreCompact` under "Top-level `decision`" (`decision: "block"`,
`reason`) and puts `PostCompact` in the row: *"WorktreeRemove, Notification, SessionEnd, **PostCompact**,
InstructionsLoaded, StopFailure, CwdChanged, DirectoryAdded, FileChanged | **None** | No decision
control. Used for side effects like logging or cleanup"*. Neither appears in P1's `additionalContext`
placement list, which names only SessionStart, Setup, SubagentStart, UserPromptSubmit,
UserPromptExpansion, PreToolUse, PostToolUse, PostToolUseFailure, PostToolBatch, Stop, SubagentStop.

Corroboration that this is enforced by a **schema validator**, not merely undocumented (P12, P13):
`PreCompact` emitting `hookSpecificOutput` fails with
`Hook JSON output validation failed: - (root): Invalid input`, and P13's own matrix records
`PreCompact ❌ rejected`, `PostCompact ❌ no event-specific output at all`. P12 states the only valid
output field for these two events is `systemMessage` — **display-only**.

**Therefore:** the only fields a compaction hook can legitimately return are the universal ones
(`continue`, `stopReason`, `suppressOutput`, `systemMessage`, `terminalSequence`) plus, for `PreCompact`
only, `decision: "block"` / `reason`. **A compaction hook can record and it can warn the human. It
cannot put one token into the post-compaction context.**

### 4.2 Which event Anthropic designates for post-compaction re-injection

**`SessionStart` with matcher `compact`.** `[DOCUMENTED]`

Evidence, three independent places in the primary docs:
1. P1 §SessionStart matcher table: `compact` → *"Auto or manual compaction"* — i.e. the event fires
   **after** a compaction, as one of the five ways a session "begins or resumes".
2. P1 §SessionStart decision control: `additionalContext` is *"String added to Claude's context **at the
   start of the conversation, before the first prompt**"* — and for this event **plain stdout also
   reaches Claude**, unlike almost every other event.
3. P1 §Add context for Claude, on replay: *"`SessionStart` hooks **run again** on resume with `source`
   set to `"resume"`, or `"fork"` … so they can **refresh their context**."*

This is the only event in the entire 31-event surface that (a) fires because of a compaction and
(b) can inject context. **It is the designated post-compaction re-injection channel, and there is no
alternative.**

### 4.3 Timeouts, exit codes, and the cost/reliability surface (§(f))

`[DOCUMENTED]` — P1 §Common fields, §Exit code output, §JSON output.

| Property | Value |
|---|---|
| Default timeout, `command` / `http` / `mcp_tool` | **600 s** |
| **`UserPromptSubmit` timeout** | **30 s** (explicitly lowered) |
| `MessageDisplay` timeout | **10 s** |
| `SessionEnd` | **1.5 s shared budget** across all SessionEnd hooks; raised to the highest per-hook `timeout` in settings files, capped at 60 s; `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` overrides. Plugin-provided timeouts do **not** raise the budget |
| `prompt` hook type | 30 s · `agent` hook type | 60 s |
| `PreCompact` / `PostCompact` / `SessionStart` | inherit the **600 s** default |
| **On timeout (`UserPromptSubmit`)** | hook is **canceled and its output, including `additionalContext`, is DISCARDED**. The prompt still reaches Claude **without** that context. Transcript shows a notice naming the hook and the timeout |
| Exit 0 | success; stdout parsed for JSON. **JSON is only processed on exit 0** |
| Exit 2 | blocking error; **stdout and any JSON are ignored**; stderr is fed to Claude. Since v2.1.214, exit 2 + schema-invalid JSON **still blocks** |
| Any other non-zero | **non-blocking** error; the action proceeds. Exception: `WorktreeCreate`, where any non-zero aborts |
| Exit 1 | **does NOT block.** P1's own warning: use `exit 2` to enforce policy |
| Output cap | **10,000 characters** for `additionalContext`, `systemMessage` and plain stdout. Over the cap, the full text is written to a file in the session directory and Claude gets **the file path plus a short preview instead** |
| Multiple hooks | all matching hooks run **in parallel**; when several return `additionalContext`, **Claude receives all values** |
| Stderr on exit 0 | debug log only — **never** the transcript, **Claude never sees it** |
| `agent_id` / `agent_type` | present when the hook fires inside a subagent — the discriminator for subagent vs. main thread |

**Sharp cost consequence for the current implementation:** the project's
`context-recovery-gate.cjs` is wired on `UserPromptSubmit` with `timeout: 30`, and it
**synchronously shells out to `python scripts/context_boot.py` with a 25,000 ms `execFileSync`
timeout** inside a 30 s budget. If that regeneration is slow, the hook is cancelled and **its entire
injected payload is silently discarded** — the exact failure class of L29 (a protection that cannot
fire). The 600 s events (`SessionStart`, `PreCompact`, `PostCompact`) are where slow work belongs.

**Also measured, and relevant to cost:** the gate was executed this session with a synthetic
`UserPromptSubmit` payload; it returned **6,353 bytes of stdout carrying a 6,163-character
`additionalContext`** with `hookEventName: "UserPromptSubmit"`. That is under the 10,000-character cap,
so it is not being truncated to a file path today — but it is emitted on **every** `UserPromptSubmit`,
and P1 is explicit that for static content `CLAUDE.md` is preferred because *"it loads without running
a script"*. Per L30, this measurement proves the **script**, never the **integration**.

---

## 5. (b) Claude Code's compaction lifecycle

### 5.1 What a real compaction looks like on this machine — OBSERVED

This is the highest-grade evidence in this document because it is a measurement, not a schema.
Source T2: `C:\Users\berke\.claude\projects\C--Berk-Research-BrainStorming-Optimization\9eebbdb8-c4a8-4af0-b4e3-659b8cd374da.jsonl`
(1,240,095 B, **466 records**). One record has `"subtype":"compact_boundary"`. Its full
`compactMetadata`, quoted verbatim from disk: `[OBSERVED]`

```json
{"type":"system","subtype":"compact_boundary","content":"Conversation compacted",
 "timestamp":"2026-08-05T11:14:10.040Z","version":"2.1.219","entrypoint":"claude-desktop",
 "compactMetadata":{
   "trigger":"auto",
   "preTokens":167472,
   "durationMs":143022,
   "preCompactDiscoveredTools":["WebFetch"],
   "preservedSegment":{"headUuid":"b34662fd…","anchorUuid":"319f602d…","tailUuid":"aefb7853…"},
   "preservedMessages":{"anchorUuid":"319f602d…","uuids":["b34662fd…","b6acba57…","aefb7853…"],
                        "allUuids":["b34662fd…","b6acba57…","aefb7853…"]},
   "postTokens":8255,
   "cumulativeDroppedTokens":159217}}
```

**Every number in the following table is read off that record.** These are the real economics of a
compaction, and they are far more brutal than the documentation implies:

| Measured quantity | Value | What it means |
|---|---|---|
| `trigger` | `auto` | not a user `/compact` — the automatic path |
| `preTokens` | **167,472** | the window was 167k full when it fired — consistent with a ~200K window and a ~83.5% trigger (T3/T4/T5 agree; see ledger C6) |
| `postTokens` | **8,255** | what remained afterwards |
| `cumulativeDroppedTokens` | **159,217** | **95.07 % of the conversation was destroyed in one event** |
| Compression ratio | 167,472 → 8,255 = **20.3×** | the summary is ~4.9 % of the original |
| `durationMs` | **143,022** | **2 minutes 23 seconds** of wall-clock, in-line, before the turn can continue |
| `preservedMessages.uuids` | **exactly 3 messages** | only 3 raw messages survived verbatim, identified by uuid, with an `anchorUuid` |
| Summary record | `isCompactSummary: true`, **18,311 characters** | injected as a **`type: "user"` message** |

**The 3-message `preservedSegment` is a documented-nowhere structure** and is the mechanism by which
"the most recent tail" survives verbatim. `[OBSERVED]` `[single-source]` — one compaction event on one
machine; it needs a second observation before being treated as a general invariant.

### 5.2 What the generated summary contains — OBSERVED

The `isCompactSummary: true` record is a **user-role message** whose text opens, verbatim:

> *"This session is being continued from a previous conversation that ran out of context. The summary
> below covers the earlier portion of the conversation."*

Its 18,311 characters are organised into **nine numbered sections**, extracted from the file:

1. Primary Request and Intent · 2. Key Technical Concepts · 3. Files and Code Sections ·
4. Errors and fixes · 5. Problem Solving · 6. **All user messages** · 7. Pending Tasks ·
8. Current Work · 9. Optional Next Step.

**Two consequences that change how we should write for a compaction:**
- **Section 1 is "Primary Request and Intent" and Section 6 is "All user messages".** The summariser is
  explicitly built to preserve **the user's own words and stated intent**. T5 draws the same conclusion
  from the bundle: *"stating your goal clearly at the start means it survives compaction. Vague requests
  get vaguely summarized."* This is the cheapest available protection and it costs nothing.
- The summary is placed as a **user message at the head of the new conversation** — i.e. at the
  **beginning** of the new context. Under A3's U-shaped curve, that is one of the two good positions.

### 5.3 Trigger, threshold, and the two distinct auto-compaction cases

`[DOCUMENTED]` — P3 §Set the auto-compact window, P4 §When context fills up, P5.

- **Ordering of defences.** P4, verbatim: *"It **clears older tool outputs first**, then summarizes the
  conversation if needed."* So full summarising compaction is the **second** line of defence, not the
  first. T3 names the first mechanism `Rg()` — "microcompact": no LLM call at all, old tool results
  replaced in place with `[Tool result cleared]` and saved to disk with a re-read instruction, **always
  keeping the 3 most recent tool results**; images replaced with `[image]`. `[single-source]` for the
  function names, but P4 independently confirms the ordering and the behaviour.
- **Threshold, as documented:** with no window set, Claude Code compacts *"when the conversation reaches
  the model's context limit"*, **except** — cloud sessions compact as the conversation approaches the
  limit; Sonnet 4.6 / Opus 4.6 without extended context compact **at the 200K boundary**, as do Opus 4.8
  and Opus 5 on 200K windows (**Amazon Bedrock**, Google Cloud Agent Platform, Microsoft Foundry);
  Sonnet 5 compacts at the model's default threshold. **This project runs on Bedrock** (per
  `research-delegation-mandate.mdc`'s 429 note), so the 200K-boundary case is ours.
- **Threshold, as measured:** `preTokens: 167,472` (§5.1). T3, T4 and T5 independently put the trigger at
  ~83.5 % of a 200K window ≈ 167K, from a reserve of `min(maxOutput, 20k) + 13k` ≈ 33K. Three independent
  sources plus one direct measurement agree — see ledger C6.
- **Tuning knobs, all documented (P3, P5):** `/autocompact <size>` (persisted as `autoCompactWindow`) ·
  `--autocompact` flag (not preempted by managed settings) · **`CLAUDE_CODE_AUTO_COMPACT_WINDOW`**
  (100,000–1,000,000, plain integer only — `500k` reads as `500` and clamps to the 100K minimum; takes
  precedence over command, flag and setting) · **`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`** (1–100; P5 states
  it **can't raise** the threshold, only lower it, and applies to **subagents too**) ·
  `/compact <focus>` for a focused manual pass.
- **Blocking, and its exact documented consequences** — P1 §PreCompact, verbatim:
  *"Blocking automatic compaction has different effects depending on when it fires. If compaction was
  triggered **proactively before** the context limit, Claude Code skips it and the conversation
  continues uncompacted. If compaction was triggered **to recover from a context-limit error already
  returned by the API**, the underlying error surfaces and **the current request fails**."*
  For a manual `/compact`, the stderr message is shown to the user. Blocking is available via exit 2
  **or** `{"decision":"block"}`.
- **Thrashing guard:** P4 — if a single file or tool output is so large that context refills immediately
  after each summary, Claude Code **stops auto-compacting after a few attempts and shows an error**
  rather than looping.
- **Summarisation model config:** as of **v2.1.198**, the summarisation request **inherits the session's
  extended-thinking configuration** (P3; corroborated in P11's changelog: *"Subagents and context
  compaction now inherit the session's extended thinking configuration"*). T3 claims thinking is
  *"explicitly disabled"* with a hardcoded 20,000-token output cap — **this contradicts P3 and P11 and
  is flagged as a stale third-party claim** (see ledger C9).
- **Repeated compaction:** T5 — if the post-compaction count still exceeds the threshold, compaction
  fires again on the very next turn, chaining until it fits. `[single-source]`
- **Cross-session summary reuse:** T3 describes a cache that reuses a compaction from another session
  with the same context, skipping the LLM call. `[single-source]` `[UNVERIFIED]` — no primary
  confirmation found; do not build on it.

### 5.4 What happens to the transcript on disk

`[DOCUMENTED]` + `[OBSERVED]`. P4: every message, tool use and result is written to a **plaintext JSONL
file under `~/.claude/projects/`**. Measured: the compaction did **not** truncate the file — all 466
records including the 263 pre-compaction ones are still on disk, and **203 records follow the boundary**.
The compaction is an **in-context** operation; the on-disk transcript is append-only and lossless.

**This is the strongest protection channel that exists and the current implementation does not use it.**
P1 §Common input fields gives every hook a `transcript_path`, with one documented caveat: *"The
transcript file is written **asynchronously and may lag** the in-memory conversation"*, so it may not
include the current turn's most recent messages; for the current turn's final assistant text, use
`last_assistant_message` on `Stop`/`SubagentStop` instead.

Corroboration from P11 (changelog) that the pre-compaction history is deliberately retained:
*"Improved fullscreen mode to keep the **full pre-compaction history in scrollback** across repeated
compactions"* and *"Improved `/feedback` reports to **include the conversation that happened before
context compaction**"*.

---

## 6. (c) What PROTECTS knowledge across the boundary

### 6.1 Anthropic's own table — the canonical answer

P3 §What survives compaction, reproduced verbatim (this is the authoritative list): `[DOCUMENTED]`

| Mechanism | After compaction |
|---|---|
| System prompt and output style | **Unchanged; not part of message history** |
| **Project-root CLAUDE.md and unscoped rules** | **Re-injected from disk** |
| **Auto memory** | **Re-injected from disk** |
| Rules with `paths:` frontmatter | **Lost** until a matching file is read again |
| Nested CLAUDE.md in subdirectories | **Lost** until a file in that subdirectory is read again |
| Invoked skill bodies | Re-injected, capped at **5,000 tokens per skill / 25,000 total**; oldest dropped first |
| Hooks | Not applicable; hooks run as code, not context |

### 6.2 SURVIVES a compaction — with the evidence for each

| Channel | Why it survives | Evidence |
|---|---|---|
| **The system prompt** (and output style, and `--append-system-prompt`) | it is not in message history at all, so there is nothing to summarise | P3 table; P2 §Troubleshoot names `--append-system-prompt` as the route for system-prompt-level instructions |
| **Project-root `CLAUDE.md`** + **`CLAUDE.local.md`** + ancestor `CLAUDE.md` files | **re-read from disk and re-injected** | P3 table; P2 §"Instructions seem lost after /compact": *"Project-root CLAUDE.md survives compaction: after `/compact`, Claude **re-reads it from disk** and re-injects it into the session"* |
| **`.claude/rules/*.md` WITHOUT `paths:` frontmatter** | same disk re-injection path; P2: loaded *"at launch with the same priority as `.claude/CLAUDE.md`"* | P3 table ("unscoped rules"); P2 §Set up rules |
| **Auto memory `MEMORY.md`** (first 200 lines / 25 KB) | re-injected from disk | P3 table; P2 §How it works |
| **Anything a `SessionStart` hook injects** | the event **fires again** with `source: "compact"` | P1 §SessionStart matcher table + §SessionStart decision control |
| **The on-disk transcript JSONL** | compaction is in-context only; the file is append-only | **[OBSERVED]** §5.4 — 466 records intact, 263 pre-boundary |
| **Subagent transcripts** | stored in separate files | P6: *"when the main conversation compacts, subagent transcripts are **unaffected**"* |
| **The summary itself** (9 sections incl. "Primary Request and Intent" and "All user messages") | it *is* the new context | **[OBSERVED]** §5.2 |
| **Files re-read after the boundary** | T3: Claude Code re-injects recently-read files sorted by timestamp within a token budget; P8 (Anthropic): *"the agent can then continue with this compressed context **plus the five most recently accessed files**"* | P8 [FULL] + T3 |
| **Environment variables written to `CLAUDE_ENV_FILE`** | they become shell env for subsequent Bash commands, not context | P1 §Persist environment variables |
| **`watchPaths` registered at `SessionStart`** | session-scoped registration, not message history; and SessionStart re-runs on compact | P1 §SessionStart decision control |

### 6.3 DOES NOT survive, or is accepted-then-discarded — with evidence

| Channel | What happens | Evidence |
|---|---|---|
| **`.claude/rules/*.md` WITH `paths:` frontmatter** | **LOST** until a matching file is read again. P3: they *"load into message history when their trigger file is read, so compaction summarizes them away with everything else"* | P3 table + §note |
| **Nested `CLAUDE.md` in subdirectories** | **LOST** until a file in that subdirectory is read again | P3 table; P2 |
| **Anything injected by `UserPromptSubmit` / `PostToolUse` / `PreToolUse` `additionalContext`** | it lived in **message history** → **summarised away**. It is not re-injected; it is only **replayed on `--continue`/`--resume`**, and then **stale** | P1 §Add context for Claude: *"For mid-session events like PostToolUse or UserPromptSubmit, when you resume with `--continue` or `--resume`, Claude Code **replays the saved text rather than re-running the hook** for past turns, so values like timestamps or commit SHAs **become stale**"* |
| **System reminders generally** | `additionalContext` *is* a system reminder wrapped by Claude Code and placed in the conversation → same fate as message history | P1 §Add context for Claude |
| **The skill index (one-line descriptions)** | **NOT re-injected.** P3's interactive source carries the flag `noSurviveCompact: true` with: *"Unlike the rest of the startup content, this listing is **not re-injected after `/compact`**. Only skills you **actually invoked** get preserved."* | P3 [FULL], `EVENTS` array, "Skill descriptions" entry |
| **Invoked skill bodies** | re-injected but **truncated**: 5,000 tokens/skill, 25,000 total, oldest dropped first; **truncation keeps the START of the file** | P3 table + §note |
| **Files attached with `@` in a prompt** | contents are inserted while building the prompt (no tool call, **no `PreToolUse` hook fires**) → they are message history → summarised away | P1 §PreToolUse note |
| **Tool results** | cleared **first**, before summarisation; replaced with `[Tool result cleared]` + a disk re-read instruction; 3 most recent kept | P4 (ordering) + T3 (mechanism) |
| **Images / documents in old user messages** | replaced with `[image]` | T3 `[single-source]` |
| **`PreCompact` / `PostCompact` hook output** | **accepted-and-discarded as context by design.** Only `systemMessage` (display-only) is valid; `additionalContext` **fails schema validation** | P1 §Decision control + P12 + P13 |
| **`UserPromptSubmit` hook output on timeout** | **canceled and DISCARDED** at 30 s; the prompt proceeds without it | P1 §UserPromptSubmit |
| **Stderr from any hook that exits 0** | debug log only — **Claude never sees it** | P1 §Exit code output |
| **A subagent's context** | never inherited by the parent, and the parent's auto memory never reaches a non-fork subagent | P6 §What loads at startup |
| **Instructions given only in conversation** | **LOST.** P2: *"If an instruction disappeared after compaction, it was **given only in conversation**…"* | P2 |

---

## 7. (d) MEMORY MANAGEMENT in Claude Code — every first-party facility

`[DOCUMENTED]` — P2 [FULL], P3, P6, P7.

| Facility | Location | Loaded WHEN | Cost | Limits | Survives compaction? |
|---|---|---|---|---|---|
| **Managed policy CLAUDE.md** | Windows: `C:\Program Files\ClaudeCode\CLAUDE.md`; macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`; Linux `/etc/claude-code/CLAUDE.md`. Or inline via `claudeMd` in managed settings | session start, **first** (broadest scope) | full file in context every session | **cannot be excluded** by `claudeMdExcludes`; honoured only in managed/policy settings | **YES** (disk re-injection) |
| **User CLAUDE.md** | `~/.claude/CLAUDE.md` | session start | full file | — | **YES** |
| **Project CLAUDE.md** | `./CLAUDE.md` **or** `./.claude/CLAUDE.md` | session start | full file; **loaded in full regardless of length** | target **<200 lines**; longer *"consume more context and reduce adherence"* | **YES** |
| **Local CLAUDE.md** | `./CLAUDE.local.md` | session start, appended **after** `CLAUDE.md` at the same level | full file | gitignored; exists only in the worktree where created | **YES** |
| **Ancestor CLAUDE.md** | every dir walking **up** from cwd | session start, ordered **filesystem-root → cwd**, so files nearest cwd are read **last** | full files | `claudeMdExcludes` (glob, merges across settings layers) can skip them | **YES** |
| **Nested CLAUDE.md** | subdirectories **below** cwd | **on demand**, when Claude reads a file in that subdirectory | deferred | — | **NO** — lost until a file there is read again |
| **`@path` imports** | referenced from any memory file | **at launch, alongside the importing file** | **full cost — splitting into imports does NOT reduce context** | **max depth 4 hops**; skipped inside code spans/fences; imports resolving **outside** the project trigger a one-time approval dialog (user-scope imports do not) | follows the importing file |
| **Unscoped `.claude/rules/*.md`** | `.claude/rules/**.md`, recursive; symlinks resolved, circular symlinks handled | session start, *"same priority as `.claude/CLAUDE.md`"* | full files | skipped if `project` excluded from `--setting-sources` | **YES** |
| **User rules** | `~/.claude/rules/*.md` | session start, **before** project rules (so project rules win) | full files | — | **YES** |
| **Path-scoped rules** | `.claude/rules/*.md` with `paths:` frontmatter | when Claude **reads a matching file** (not on every tool use) | deferred — this is the context-saving mechanism | budget of **1,000 expanded patterns / 4 MiB** per rule's whole `paths:` list; brace groups multiply; over-budget patterns are used **unexpanded** and match nothing. **Before v2.1.217 a `paths:` value with many brace groups stalled or crashed the CLI at startup** — the installed version is exactly 2.1.217, so it is the **first** version with the fix | **NO** |
| **Auto memory `MEMORY.md`** | `~/.claude/projects/<project>/memory/MEMORY.md`, `<project>` derived from the **git repo** so all worktrees share one. Relocatable with `autoMemoryDirectory` (absolute or `~/`; in project settings only after the workspace-trust dialog) | **first 200 lines OR first 25 KB, whichever comes first**, at the start of **every** conversation | that slice only | **content beyond the threshold is not loaded**. Frontmatter and block HTML comments are stripped before measuring (since v2.1.211). Near a limit → Claude is reminded to shorten; over a limit → the write succeeds but an **error tells Claude to rewrite the index** | **YES** (disk re-injection) |
| **Auto memory topic files** | `debugging.md`, `api-conventions.md`, … beside `MEMORY.md` | **not at startup** — read on demand with normal file tools | zero until read | machine-local; not shared across machines or cloud envs | as message history → **NO** |
| **`modified` frontmatter timestamp** | added by Claude Code to any auto-memory file that already has frontmatter | on write | — | **requires v2.1.214** — available on 2.1.217 | — |
| **Skills** | `.claude/skills/`, `~/.claude/skills/`, plugins | **descriptions** at startup; **body** only when invoked | description ≈ one line each | body re-injected after compaction at **5,000 tokens/skill, 25,000 total**, oldest dropped, **truncation keeps the start of the file**. `disable-model-invocation: true` keeps the description out of context entirely | body **YES (truncated)**; the **index NO** |
| **Subagent persistent memory** | `memory: user\|project\|local` in subagent frontmatter → its **own separate** directory | subagent system prompt gets the **first 200 lines / 25 KB** of its own `MEMORY.md` | per-subagent | Read/Write/Edit auto-enabled; the **main conversation's auto memory is NOT loaded into a subagent** (except a fork) | separate lifecycle |
| **Session env persistence** | `CLAUDE_ENV_FILE` (append `export` lines) | available to **`SessionStart`, `Setup`, `CwdChanged`, `FileChanged` hooks only** | env, not context | no other hook type has it | env survives (not context) |
| **`watchPaths`** | returned by a `SessionStart` hook | registers absolute paths for `FileChanged` events for the session | negligible | `FileChanged` matcher charset is narrow (letters, digits, `_`, `\|`) | re-registered because SessionStart re-runs on compact |
| **Server-side memory tool / compaction** (Developer Platform, not the CLI) | Messages API `context_management` + `compact_20260112` beta, `pause_after_compaction` | API-side | API-side | **not available to Claude Code CLI users** — different product surface | n/a |

### 7.1 How a hook writes and reads durable state

`[DOCUMENTED]` + `[OBSERVED]`. A command hook is an ordinary process: it can read and write any file.
The first-party affordances that make this a *designed* path rather than a hack:

- Every event's stdin payload carries **`session_id`**, **`transcript_path`**, **`cwd`**,
  **`permission_mode`**, **`hook_event_name`**, and (v2.1.196+, so available on 2.1.217) **`prompt_id`**,
  which *"matches the `prompt.id` attribute on OpenTelemetry events"* — a durable correlation key.
- `${CLAUDE_PROJECT_DIR}`, `${CLAUDE_PLUGIN_ROOT}`, and **`${CLAUDE_PLUGIN_DATA}`** — the last being an
  explicit *"persistent data directory … for dependencies and state that should **survive plugin
  updates**"*. All three are also exported as environment variables to the spawned process.
- **`PostCompact` receives `compact_summary`** — the generated summary itself. A `PostCompact` hook
  cannot inject context, but it **can persist the summary to disk**, which is a genuine protection
  primitive nobody is using.
- `SessionStart` can return **`reloadSkills: true`** to make Claude Code re-scan skill directories after
  the hook completes, so a skill the hook *wrote* is available in the same session, from the first prompt.
- `SessionStart` can return **`initialUserMessage`** — in `-p` mode it **creates the first turn**. P1:
  *"Unlike `additionalContext`, which attaches to an existing turn, this **creates** the turn."*

### 7.2 The first-party mechanism for shaping the summary — and it is unused here

P4 §When context fills up, verbatim: *"**To control what's preserved during compaction, add a "Compact
Instructions" section to CLAUDE.md** or run `/compact` with a focus (like `/compact focus on the API
changes`)."* `[DOCUMENTED]`

Independently corroborated by P11 (changelog): *"**Compaction prompt now asks the model to preserve
sensitive user instructions**"* — i.e. the summariser prompt is instruction-sensitive by design.

**Measured on disk this session:** `rg -i "compact instructions" CLAUDE.md AGENTS.md .claude/rules/`
returns **nothing**. `[OBSERVED]` This project has **no Compact Instructions section**. It is a free,
first-party, documented lever on exactly the artefact that replaces the window, and it is not used.

### 7.3 A structural mismatch worth naming precisely

`[OBSERVED]` — `Get-ChildItem "C:\Users\berke\.claude\projects" -Recurse -Directory -Filter memory`
returns **nothing**; `autoMemoryDirectory` and `autoMemoryEnabled` are **not set** in
`~/.claude/settings.json`, `.claude/settings.json`, or `.claude/settings.local.json`.

This project's memory tier lives at `.claude/memory/` — `BOOT.md` (11,981 B), `MEMORY.md` (61,818 B),
`STATE.md` (29,316 B), `STATE-ARCHIVE.md` (70,120 B), `DECISIONS.md` (5,053 B), `infra.md` (6,085 B),
`worker-registry.json` (77,131 B).

**None of these is Claude Code's auto memory.** Auto memory is `~/.claude/projects/<project>/memory/MEMORY.md`.
So the row in P3's table that says **"Auto memory → Re-injected from disk"** does **not** apply to any
file in `.claude/memory/`. Those files are re-injected **only** because the hook chooses to describe
them, or because the agent chooses to open them — which is precisely the failure ARC (A1) names:
*"a property of the memory mechanism, **not of the agent that uses it** … it does not ensure that the
language model will choose the correct address."*

Note also the sizes: `MEMORY.md` at 61,818 B is **2.5× the 25 KB** that Claude Code's own auto-memory
loader would read, and `STATE.md` at 29,316 B is already past it. Even if these files were moved into the
auto-memory path, **most of them would not load.**

---

## 8. The academic layer — the 5-part depth template per load-bearing paper

### A1 — ARC: Addressable Recall Compaction (arXiv 2607.25066) `[FULL]`
Thang Dang, Yuma Ichikawa, Sakina Fatima, Koichi Shirahata

1. **Problem, in the authors' framing.** *"Existing compaction methods address this limitation by
   discarding, summarizing, or retrieving earlier information, but they may **remove task-critical
   details or fail to recover them reliably**."* Their diagnosis of every baseline: *"Every baseline …
   conflates two decisions that need not be coupled: (1) **what to keep**, and (2) **what to show the
   model right now**."*
2. **Method.** Two structures. An **append-only Addressable Store**: each observation `O` from action `A`
   is stored under `id = Hash(signature(A), O)` — SHA-1 over the action signature, an ASCII unit-separator
   byte, and the observation; the visible id is the **first 8 hex chars**, extended in 4-char increments
   only on collision. And a **Bounded-Size Active View**: when compaction removes a long observation, ARC
   leaves a **citation `§id`** carrying a fixed head preview, tail preview, metadata and a `_recall §id`
   hint. Observations shorter than `ρ` stay verbatim. A `Cited` set enforces **citation persistence** —
   once an id has been a recall handle, later compactions preserve that handle rather than renaming or
   re-summarising it. Formally: with `L` = context limit minus reserved completion capacity, the active
   view assigns fixed budgets to five components (immutable task prefix, deterministic summary, recent
   suffix, one page of the citation catalog, recalled content) summing to `K ≤ L`. Recall never uses
   head–tail truncation; it returns **exact, non-overlapping chunks of ≤ q payload tokens**. An LRU
   `recall_budget_chars` (default 16,000) evicts a materialised observation back to its citation stub so
   recall cannot itself re-create unbounded growth. Default `max_model_len` = 16,384.
3. **Real numbers from their tables.** Needle-in-a-Haystack exact-answer accuracy **99.40 % vs 88.12 %**
   for the best baseline. LongBench-v2 Hard **29.97 % vs 28.25 %** (per-scale: **27.47 %** at Qwen3-8B,
   **32.47 %** at Qwen3-32B, margin over closest competitor **1.6–2.3 pts**). Efficiency: Qwen3-8B
   successful retrievals **991**, inference time **6.47 s → 1.26 s**, HBM traffic **−80.3 %**; Qwen3-32B
   **999** successes, **0.55 s**, **1.59 TB**. No-answer rate **16.33 and 7.33 out of 311** vs **23–74**
   for every baseline.
4. **Limitations the authors state.** The guarantee *"is a property of the memory mechanism, **not of the
   agent that uses it** … it does not ensure that the language model will choose the correct address or
   reason accurately once the content is retrieved."* Also: *"Needle-in-a-haystack isolates verbatim
   recall — exactly what ARC targets — while LongBench-v2 hard tasks additionally require synthesizing
   information across a long document, so **perfect recall can still yield a wrong answer** through
   faulty reasoning."* All experiments are Qwen3-family only; each citation adds a small fixed token
   overhead that they do not fully quantify.
5. **Application here.** This is the design Claude Code **already gives us for free and we ignore**: the
   JSONL transcript **is** the append-only store (measured lossless, §5.4), `session_id` + record `uuid`
   **are** stable addresses, and P1's `transcript_path` on every event **is** the pointer. The missing
   piece is exactly ARC's citation: a `SessionStart(compact)` injection that names the transcript path,
   the boundary uuid, and what to recall. And ARC's own limitation is the reason the injection must be
   **pushed with instructions**, not merely made available — the mechanism cannot make the model address it.

### A2 — ACM: Agentic Context Management (arXiv 2607.23809) `[FULL]`
Xiaochuan Li, Ryan Ming, Meng Chu, Shuai Shao, Rong Jin, Chenyan Xiong — **CMU + Meta**

1. **Problem.** *"Existing context compression methods inevitably incur information loss and are
   triggered by **rigid heuristic rules**, leaving them misaligned with the agent's evolving reasoning
   focus."* And on external monitors specifically: *"these approaches control compression timing through
   **forced, hand-crafted external monitors**, relying on heuristic rules that are not well aligned with
   the model's own reasoning process."* Their Table 1 classifies **Claude's Automatic Context
   Compression** in the heuristic, lossy, non-agent-initiated family.
2. **Method.** Exactly **two** tools: `manage_context` (compress prior turns to a summary via a
   summariser LLM **and save the raw messages to an external file on disk**, each summary getting a
   unique identifier mapping to those raw messages) and `query_memory` (query the stored raw messages by
   identifier; a querier LLM returns only the query-relevant part as a tool result). Plus a
   **dual-constraint teacher–student post-training** pipeline: one direction inserts context-management
   calls where the student got stuck in a dead-end loop; the other **removes** calls that should not have
   happened, replacing them with a commitment to an answer or a deeper search. Rejection sampling keeps
   only trajectories the student failed, and content filters prevent answer leakage into the teacher's
   rationale.
3. **Real numbers.** **+27 % relative gain on BrowseComp-Plus** after post-training, *"nearly matching
   open-source models that are **40× larger**"*. Evaluated on BrowseComp-Plus, DeepSearchQA and
   **SWE-Bench Verified** (Pass@1 / tool calls / **peak tokens** per episode). Behaviourally: a
   characteristic **sawtooth** context curve showing compression fires *"well before the context limit"*,
   with peak token usage down *"dramatically … especially compared with the Summary Agent"*, plus
   improved pass@4 and pass4 consistency across three post-training epochs.
4. **Limitations.** Appendix D is titled *"**Small Thinking Models Cannot Exercise Context-Management
   Tools**"* — the capability is not free, it must be trained in. Gains correlate with tool-call count,
   so the benefit is largest for models that need exploration.
5. **Application here.** Two transfers. (i) **Lossless offload beats lossy summary**: the raw messages go
   to disk with an **identifier** — again exactly what the transcript + boundary uuid already provide.
   (ii) A direct warning about our design: an **external monitor firing on a threshold** is the family
   ACM measures as *misaligned*. Our hook cannot become agent-initiated, but it can stop pretending a
   turn-triggered banner is memory management and instead make the **agent-initiated** read the thing it
   demands.

### A3 — Lost in the Middle (TACL 2024, 12:157–173) `[FULL]`
Nelson F. Liu, Kevin Lin, John Hewitt, Ashwin Paranjape, Michele Bevilacqua, Fabio Petroni, **Percy Liang**
(Stanford / UC Berkeley / Samaya AI) — 2024; used because it remains the state of the art for position
effects and is cited by A2 and A4.

1. **Problem.** *"relatively little is known about how well they use longer context"* — do models
   actually use what is in the window?
2. **Method.** Controlled multi-document QA and synthetic key-value retrieval, varying **only the
   position** of the relevant document among 10/20/30 documents, against closed-book and oracle controls.
3. **Real numbers (Table 1 and §2.3, read from the author PDF).** A **U-shaped curve**: primacy and
   recency bias. *"GPT-3.5-Turbo's multi-document QA performance can drop by **more than 20 %** — in the
   worst case, performance in 20- and 30-document settings is **lower than performance without any input
   documents** (i.e., closed-book performance; **56.1 %**)."* Oracle vs closed-book: GPT-3.5-Turbo
   **88.3 / 56.1**, Claude-1.3 **76.1 / 48.3**, LongChat-13B(16K) **83.4 / 35.0**, MPT-30B-Instruct
   **81.9 / 31.5**. 30-document positional table: GPT-3.5-Turbo(16K) **73.4 %** at index 0, **50.5 %** at
   index 9, **63.7 %** at index 29. GPT-4 (8K) shows the same U-shape at higher absolute accuracy.
   Extended-context variants are **not** better: 100K vs 8K Claude-1.3 curves are near-superimposed
   (59.1/55.1/54.9/… vs 59.1/55.1/54.8/…).
4. **Limitations the authors state.** Query-aware contextualization near-solves the synthetic key-value
   task but *"minimally changes trends in multi-document QA"*. Encoder-decoder robustness holds only
   within training-time sequence length. Only Llama-2 13B/70B show primacy; 7B is recency-only — the
   effect is scale-dependent. GPT-4 was evaluated on a 500-example subset for cost reasons.
5. **Application here.** Two rules, and one correction of our own reasoning. The **placement rule** the
   current hook already cites correctly: the alarm leads, never buried. But the **stronger** and
   currently-unused finding is *below-closed-book*: **badly-placed context is worse than no context**.
   A 6,163-character block injected on every single turn — most of which is not about the current task —
   is exactly the distractor regime this paper measures. And the compaction summary is placed at the
   **head** of the new context (§5.2), which is a **good** position we should exploit rather than compete
   with by injecting a rival block elsewhere.

### A4 — AI Agents Need Memory Control Over More Context (ACC, arXiv 2601.11653) `[ABS]+§1–3`

1. **Problem.** *"agent behavior often degrades due to loss of constraint focus, error accumulation, and
   memory-induced drift"*; and on the pattern we are using: *"The dominant implementation pattern
   continues to rely on **transcript replay**, where prior interactions are appended to the prompt. As
   interactions extend, this strategy inflates cost and latency, **reduces selectivity by forcing
   attention over increasingly mixed history**, and makes early mistakes harder to recover from."*
2. **Method.** A **Compressed Cognitive State (CCS)**: one bounded, **schema-governed** persistent state
   variable, updated by **controlled replacement** each turn from (current interaction, previous CCS,
   bounded retrieved artifacts). *"CCS is **not a free form summary**. It is a structured cognitive state
   constrained by an explicit schema `S_CCS` that specifies required fields, semantic interpretation, and
   allowable structure."* Crucially it **separates artifact recall from state commitment**: *"Retrieval
   **proposes** candidate evidence, not to update internal state"* — preventing unverified content from
   becoming persistent memory.
3. **Numbers.** Agent-judge live evaluation with blinding and randomised presentation order, across IT
   operations, cybersecurity response and healthcare workflows: *"significantly lower **hallucination and
   drift** than transcript replay and retrieval-based agents"*, with bounded memory footprint measured
   across turns. (Reported qualitatively in the sections read; the per-scenario table is beyond the
   sections I read — flagged rather than paraphrased.)
4. **Limitations.** Judge-based evaluation with a judge-maintained canonical state; enterprise scenario
   scope; the schema must be authored per domain.
5. **Application here.** This is the sharpest indictment of our current design and the sharpest
   prescription. Our `MEMORY.md` (61,818 B of appended L1–L32 lessons) **is** transcript replay: it grows
   monotonically, is unbounded, and every entry competes for attention with every other. ACC's
   alternative is directly buildable: a **small, schema-fixed state file** (goals · active constraints ·
   entities · committed decisions · open questions) that is **replaced**, not appended, and stays inside
   the **25 KB / 200-line** budget Claude Code's own auto-memory loader will actually read. The
   append-only lesson log becomes the *artifact store* it recalls from, not the thing it loads.

### A9 — Recursively Summarizing Books with Human Feedback (arXiv 2109.10862) `[ABS]+§4.1.2+App.G`
OpenAI (Wu, Ouyang, Ziegler, Stiennon, Lowe, Leike, Christiano) — 2021; used because it remains the
canonical measurement of recursive-summary error accumulation, and its date is stated here.

1. **Problem.** Summarising content longer than a window requires recursion — summaries of summaries.
2. **Method.** Recursive task decomposition; GPT-3 fine-tuned by behavioural cloning + reward modelling;
   recursion to **depth 3**.
3. **Numbers.** *"Likert scores for the full book summaries were **significantly lower** than Likert
   scores of any of the individual decomposed tasks. This is unsurprising, since **the errors accumulated
   at each depth are all reflected in the full book summary score**."* Over 5 % of best-175B summaries
   scored 6/7 and over 15 % scored 5/7, but on average still significantly worse than human summaries.
4. **Limitations.** *"policy errors at lower levels **compound at each composition task**, ultimately
   leading to large errors on the top-level task"*; auto-induced distributional shift; ad-hoc curriculum.
5. **Application here.** This is the measured law behind L10 (*"summarising your own history and then
   speaking from the summary is a memory failure"*) and it applies **to Claude Code's own repeated
   compactions**: T5 records that compaction can chain turn after turn, and each pass summarises a context
   whose head is **already a summary**. Depth-2+ summarisation is the regime this paper measures as
   error-compounding. The mitigation is not a better summary — it is that load-bearing facts must be
   re-read from **disk** after each boundary, never carried forward through a second summarisation.

### Supporting academic sources (each read `[ABS]`, used for corroboration only)

- **A5 TokenMizer** (arXiv 2606.06337): resume blocks averaging **78 tokens (σ 21.4, range 42–124)**,
  **2× smaller** than baselines (159–170) with **+9–17 pp** higher decision recall; mean task recall
  **51.0 %**, decision recall **46.6 %**, file recall **58.7 %**; **47.3 %** token reduction from the
  heuristic pipeline; fuzzy label matching alone worth **+33 pp** task recall. The load-bearing finding
  for us: *"**no evaluated baseline preserves WHY a technology was chosen**, only that it was mentioned."*
  Stated limitation: a synthetic 21-session corpus; live-session evaluation is future work. → Our
  `DECISIONS.md` exists precisely to hold the *why*, and nothing re-injects it after a compaction.
- **A6 AgentLongBench** (arXiv 2601.20730): first benchmark evaluating long-context **agents** via
  environment rollouts, **32K → 4M tokens**, with concise-response (memory fragmentation) and
  verbose-response (needle-in-noise) regimes. → The regime our 5-minute-film sessions actually live in.
- **A7 Self-Sum** (Findings of ACL 2026, `2026.findings-acl.447`): rule-based summarisation triggers are
  *"agnostic to the agent's internal decision state and task progress, often forcing summarization at
  suboptimal moments"*; external-monitor variants *"decouple summarization from the agent's own
  decision-making process"*. → Independent confirmation of A2's critique of threshold triggers.
- **A8 ProMem** (arXiv 2601.04463): names two defects of summary-based memory — summarisation is
  *"ahead-of-time … a blind feed-forward process that misses important details because it doesn't know
  future tasks"*, and extraction is *"one-off, lacking a feedback loop to verify facts"*, so a first-pass
  hallucination **stays in memory permanently**. With self-questioning, at compression ratio **0.2** (80 %
  of tokens discarded) it still reaches **37.20 %** QA score and **57.20 %** memory integrity. → Directly
  relevant: our measured compaction discarded **95.07 %**, far past ProMem's hardest setting, and the
  "one-off extraction" defect is why a wrong figure in a summary must be re-read from disk, not repaired.

---

## 9. CROSS-VERIFICATION LEDGER (load-bearing claims only)

A claim enters this ledger only if a design decision depends on it. Verdict `verified` requires
**≥3 independent sources**; anything less is flagged.

| # | Claim | Source A | Source B | Source C | Verdict |
|---|---|---|---|---|---|
| C1 | **`PreCompact` and `PostCompact` cannot inject context; `additionalContext` fails schema validation for them** | P1 §Decision control (PreCompact→top-level `decision` only; PostCompact→"None") | P12 issue #46191 (*"the only valid output field for these events is `systemMessage` (display-only)"*) | P13 issue #50682 matrix (`PreCompact ❌ rejected`, `PostCompact ❌ no event-specific output at all`) + a reproduced validator error in a third-party repo | **verified** |
| C2 | **`SessionStart` with matcher `compact` is the designated post-compaction re-injection event** | P1 §SessionStart matcher table (`compact` → "Auto or manual compaction") | P1 §SessionStart decision control (`additionalContext` at the start of the conversation; plain stdout also reaches Claude) | P1 §Add context for Claude (*"SessionStart hooks run again on resume … so they can refresh their context"*) + P13 (names SessionStart as the event that *has* the affordance the others lack) | **verified** |
| C3 | **Project-root `CLAUDE.md` and unscoped rules are re-injected from disk after compaction** | P3 §What survives compaction table | P2 §"Instructions seem lost after /compact" (*"Claude re-reads it from disk and re-injects it"*) | T6 / T4 (both independently state disk-loaded startup content is re-injected) | **verified** |
| C4 | **Path-scoped rules and nested `CLAUDE.md` are LOST until a matching file is read again** | P3 table + §note | P2 §"Instructions seem lost after /compact" | T4 (*"The parts that actually vanish are path-scoped rules, nested CLAUDE.md files…"*) | **verified** |
| C5 | **The transcript JSONL on disk survives compaction intact and is readable afterwards** | **[OBSERVED]** T2 — 466 records, 263 pre-boundary, 203 post-boundary, file not truncated | P1 §Common input fields (`transcript_path` on every event) | P11 changelog (*"keep the full pre-compaction history in scrollback"*; *"/feedback … include the conversation that happened before context compaction"*) | **verified** |
| C6 | **Auto-compaction fires around 167K on a 200K window (~83.5 %), reserving ~33K** | **[OBSERVED]** `preTokens: 167472` | T3 (`contextWindow − min(maxOutput,20k) − 13k`) | T4 (~33K buffer, ~83.5 % trigger) + T5 (same arithmetic, independently) | **verified** (the *mechanism constants* remain third-party; the 167K figure is measured) |
| C7 | **Compaction destroys the overwhelming majority of the conversation** | **[OBSERVED]** `cumulativeDroppedTokens: 159217` of `preTokens: 167472` = **95.07 %**, `postTokens: 8255` | P8 Anthropic (*"overly aggressive compaction can result in the loss of subtle but critical context whose importance only becomes apparent later"*) | P4 (*"detailed instructions from early in the conversation may be lost"*) | **verified** |
| C8 | **The summary preserves the user's requests/intent as its first and a dedicated section** | **[OBSERVED]** 9 sections incl. "1. Primary Request and Intent" and "6. All user messages" | P4 (*"Your requests and key code snippets are preserved"*) | P11 (*"Compaction prompt now asks the model to preserve sensitive user instructions"*) + T5 (*"Section 1 captures 'primary request and intent'"*) | **verified** |
| C9 | **The summarisation request inherits the session's extended-thinking configuration (v2.1.198+)** | P3 §What survives compaction (explicit, "As of v2.1.198") | P11 changelog (*"Subagents and context compaction now inherit the session's extended thinking configuration"*) | — **CONTRADICTED** by T3, which states thinking is *"explicitly disabled"* with a hardcoded 20k output cap | **verified (2 primary sources), with T3 flagged as STALE** — T3 analysed an older bundle; the version-attributed primary docs win |
| C10 | **`UserPromptSubmit` has a 30 s timeout and its output — including `additionalContext` — is DISCARDED on timeout** | P1 §Common fields (timeout table) | P1 §UserPromptSubmit (*"canceled and its output, including any `additionalContext`, is discarded. The prompt still reaches Claude without that context"*) | P1 §JSON output + this project's own `CLAUDE.md` §"The one Claude-Code-specific fact worth stating" (independently recorded) | **verified** |
| C11 | **Auto memory loads only the first 200 lines / 25 KB of `MEMORY.md`; topic files are not loaded at startup** | P2 §How it works | P4 §What Claude can access (*"The first 200 lines or 25KB of MEMORY.md, whichever comes first"*) | P6 §Enable persistent memory (same limit for subagent memory) + P3's context-window `EVENTS` entry (same wording) | **verified** |
| C12 | **`@path` imports do NOT reduce context cost; max depth 4 hops** | P2 §Import additional files + §"My CLAUDE.md is too large" (*"Splitting into @path imports helps organization but doesn't reduce context, since imported files load at launch"*) | T6 (*"Imports load at launch, together with the importing file… it does not reduce the context cost"*; *"Max import depth is 4 hops"*) | P2 §Choose where to put CLAUDE.md (imported files "expanded and loaded into context at launch") | **verified** |
| C13 | **The skill index is NOT re-injected after compaction; only invoked skill bodies are (5k/skill, 25k total)** | P3 `EVENTS` source: `noSurviveCompact: true` + *"this listing is not re-injected after /compact. Only skills you actually invoked get preserved"* | P3 §What survives compaction table (skill-body caps) | P3 takeaway string (*"The skill listing is the one exception"*) | **[single-source]** — all three citations are P3, one document. Needs an observation or a second doc |
| C14 | **Blocking auto-compaction that was triggered by an already-returned context-limit error makes the current request FAIL** | P1 §PreCompact (verbatim) | — | — | **[single-source]** — stated once, in the authoritative reference. Load-bearing for "should the hook ever block?" → answer: no |
| C15 | **Anthropic's own prescribed protection is structured note-taking to persistent external storage, re-read after a reset** | P8 (*"the agent regularly writes notes persisted to memory outside of the context window… After context resets, the agent reads its own notes and continues"*) | P10 cookbook (*"After a reset (a new session, or after compaction), the agent reads its own notes and continues"*) | A1 + A2 + A4 (external store + addressed recall + bounded committed state) | **verified** |
| C16 | **A compaction's `preservedSegment` keeps only ~3 raw messages verbatim** | **[OBSERVED]** T2 `preservedMessages.uuids` = 3 uuids + an `anchorUuid` | — | — | **[single-source]** — one compaction, one machine, v2.1.219. Do not treat as an invariant |
| C17 | **Compaction cost is not only tokens: this one took 143,022 ms (2 m 23 s) in-line** | **[OBSERVED]** T2 `durationMs: 143022` | — | — | **[single-source]** — one event; directionally important, not a benchmark |
| C18 | **Tool results are cleared BEFORE summarisation, keeping the 3 most recent** | P4 (*"It clears older tool outputs first, then summarizes"*) | T3 (`Rg()` microcompact: *"Always keeps the 3 most recent tool results"*, `[Tool result cleared]` + disk re-read instruction) | P8 (*"One of the safest lightest touch forms of compaction is tool result clearing"*) | **verified** (ordering + existence); the "3 most recent" constant is **[single-source]** T3 |
| C19 | **Recently-read files are re-injected after compaction** | P8 Anthropic (*"the agent can then continue with this compressed context plus the five most recently accessed files"*) | T3 (*"re-injects: recently-read files (sorted by timestamp, within a token budget)"*) | — | **[2 sources]** — the *existence* is corroborated; **the exact count differs** (P8 says five, T3 says a token budget). Flagged, not smoothed |
| C20 | **Claude Code has never run a session in this repository, so none of its hooks here has ever fired** | **[OBSERVED]** `~/.claude/projects/` contains exactly 2 dirs, neither for `SsmContentAssetCreator` | **[OBSERVED]** no `memory/` dir anywhere under `~/.claude/projects/` | P4 (sessions are written per project under `~/.claude/projects/`) | **verified** |
| C21 | **Cross-session compaction-summary caching exists** | T3 only | — | — | **[UNVERIFIED]** — no primary confirmation. Build nothing on it |
| C22 | **`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` can only LOWER the threshold, never raise it, and applies to subagents** | P5 (verbatim: *"the variable can't raise the threshold, so values above the default percentage are ignored. Applies to both main conversations and subagents"*) | P6 §Auto-compaction (*"`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` applies to subagents as well"*) | T4/T5 both describe it as a 1–100 threshold control (but **neither notes the can't-raise constraint** — they are less accurate than the primary doc) | **verified for the primary claim**; note the third-party sources are incomplete here |
| C23 | **This project has no "Compact Instructions" section although Anthropic documents it as the lever on the summary** | P4 (verbatim: *"add a 'Compact Instructions' section to CLAUDE.md"*) | **[OBSERVED]** `rg -i "compact instructions"` over `CLAUDE.md`, `AGENTS.md`, `.claude/rules/` → **zero matches** | P11 (*"Compaction prompt now asks the model to preserve sensitive user instructions"* — the summariser is instruction-sensitive) | **verified** |
| C24 | **Claude Code reads `CLAUDE.md`, not `AGENTS.md`; the `@AGENTS.md` import is the supported bridge** | P2 §AGENTS.md (verbatim) | **[OBSERVED]** this project's `CLAUDE.md` line 1 is `@AGENTS.md` | T6 (same recommendation, independently) | **verified** |
| C25 | **`CLAUDE.md` is delivered as a user message after the system prompt, not as part of the system prompt — so it is guidance, not enforcement** | P2 §"Claude isn't following my CLAUDE.md" (verbatim) | P2 §CLAUDE.md vs auto memory (*"Claude treats them as context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook instead"*) | P2 §Manage CLAUDE.md for large teams (*"Settings rules are enforced by the client regardless of what Claude decides… CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer"*) | **verified** |

---

## 10. WHERE THE FINDINGS CONTRADICT THE CURRENT IMPLEMENTATION

Read from disk this session: `.claude/settings.json` (109 lines), `.claude/hooks/context-recovery-gate.cjs`
(442 lines). Each row is an assumption **in the shipped code or its comments**, the evidence against it,
and the source.

| # | Assumption in the current implementation | Evidence against it | Source |
|---|---|---|---|
| **X1** | The gate is wired on **`PreCompact` and `PostCompact`**, and its header presents these as part of how recovery reaches the model (*"`PostCompact` even carries the generated `compact_summary`"* offered as the detection-and-recovery justification). | These two events **cannot inject any context at all** — `additionalContext` **fails schema validation** on them. The code is honest about this in `emit()` (it sends `systemMessage`), but the wiring implies protection where only **logging and a display-only message** are possible. | P1 §Decision control · P12 · P13 (ledger C1) |
| **X2** | Recovery is delivered primarily through **`UserPromptSubmit`, every turn** (the settings file wires it there; the code's `emit()` defaults to `UserPromptSubmit`). | `UserPromptSubmit` is the **worst** event for this: it has the **shortest timeout in the product (30 s vs 600 s)**, and **on timeout its entire output is discarded** while the prompt proceeds. The gate calls `execFileSync(python, …, {timeout: 25000})` **inside** that 30 s budget. A slow `context_boot.py` silently produces a turn with **no protection at all** — the L29 failure class, re-created in the mechanism built to prevent L29. | P1 §Common fields + §UserPromptSubmit (ledger C10) |
| **X3** | `SessionStart` is wired, but with **two separate matcher groups** (`compact`, and `startup\|resume\|clear\|fork`) running **the same generic payload** — the `compact` case is treated as one arrival route among five. | `SessionStart(compact)` is **the only event in the entire 31-event surface that both fires because of a compaction and can inject context.** It is the designated re-injection channel and deserves a **different, richer payload** than a normal startup — including the transcript path and the boundary address. Treating it as interchangeable with `startup` wastes the one privileged channel that exists. | P1 §SessionStart (ledger C2) |
| **X4** | The header states the honest limit as: *"a hook CANNOT read the context window, so it cannot detect a compression"* → corrected to *"detection IS mechanical"* — but the conclusion drawn is still that **the hook cannot know what was lost**. `AGENTS.md` repeats: *"it knows a compaction happened but not what was lost."* | **False, and this is the most valuable finding in this document.** `PostCompact` receives **`compact_summary`** — the actual summary. Every event receives **`transcript_path`**, and the transcript on disk is **lossless and intact** (measured: 466 records, 263 pre-boundary). The `compact_boundary` record carries `preTokens`, `postTokens`, `cumulativeDroppedTokens`, `durationMs`, and the **uuids of exactly which messages were preserved**. What was lost is **precisely computable**: it is every record before `preservedSegment.headUuid` that the summary does not contain. The hook is standing on an ARC-style addressable store and using none of it. | P1 §PostCompact input · P1 §Common input fields · **[OBSERVED]** T2 (ledger C5, C16) · A1 |
| **X5** | The memory tier is described (in `AGENTS.md` and in the gate's payload) as though reading `.claude/memory/*` is the compaction defence — and P3's *"Auto memory → Re-injected from disk"* row is implicitly relied upon. | `.claude/memory/` is **not Claude Code's auto memory**. Auto memory is `~/.claude/projects/<project>/memory/MEMORY.md`, and **no such directory exists on this machine**. So **nothing** in `.claude/memory/` is re-injected by Claude Code after a compaction. Worse, the sizes are past the loader's limits anyway: `MEMORY.md` is **61,818 B ≈ 2.5× the 25 KB** cap and `STATE.md` is **29,316 B**. | P2 §Storage location + §How it works · **[OBSERVED]** (ledger C11, C20) |
| **X6** | `MEMORY.md` is **append-only by design** (its own header: *"Append-only. Lessons that must survive every compaction"*) and has grown to 61,818 B across L1–L32. | This is the **transcript-replay** pattern that A4 measures as a *cause* of drift: *"inflates cost and latency, **reduces selectivity by forcing attention over increasingly mixed history**"*. A3 adds the sharper result: mid-context content can push a model **below its own closed-book baseline (56.1 %)** — i.e. **worse than no context**. Claude Code's own loader agrees structurally: it caps the index at 200 lines / 25 KB and **errors** when the index is over the limit, telling the model *to rewrite the index*, precisely because *"everything past the limit is dropped on the next load."* The prescription (A4) is a **bounded, schema-governed state that is REPLACED**, with the append-only log demoted to a recalled artifact store. | A4 §1–§3 · A3 §2.3 + Table 1 · P2 §How it works (ledger C11) |
| **X7** | The gate injects a **6,163-character block on EVERY turn** (measured this session), most of it static law text that does not change between turns. | Anthropic's own guidance for exactly this: *"For instructions that **never change**, prefer CLAUDE.md. **It loads without running a script** and is the standard place for static project conventions."* And `CLAUDE.md` **survives compaction by disk re-injection**, whereas hook-injected `additionalContext` **does not** — it is summarised away, and on `--resume` it is **replayed stale**. The static content is in the channel with the worse survival properties **and** the higher recurring cost. | P1 §Add context for Claude · P3 table (ledger C3) |
| **X8** | The payload is written as imperative system commands (*"MANDATORY"*, *"BANNED"*, numbered orders to the model). | P1 warns specifically against this shape: *"Write the text as **factual statements** rather than imperative system instructions… Text framed as out-of-band system commands **can trigger Claude's prompt-injection defenses**, which causes Claude to **surface the text to you instead of treating it as context**." * An imperative wall is the documented way to have your injection **shown to Berk instead of used**. | P1 §Add context for Claude |
| **X9** | Nothing in the project uses a **"Compact Instructions"** section, and the design treats the summary as an uncontrollable given. | Anthropic documents a direct lever on the summary: *"To control what's preserved during compaction, **add a 'Compact Instructions' section to CLAUDE.md**"*, and the summariser is instruction-sensitive by design. Measured: **zero occurrences** in `CLAUDE.md`, `AGENTS.md`, `.claude/rules/`. Combined with the measured fact that the summary's **section 1 is "Primary Request and Intent"** and **section 6 is "All user messages"**, this is the cheapest and largest unexploited protection available. | P4 · P11 · **[OBSERVED]** (ledger C8, C23) |
| **X10** | `PreCompact` is wired with **blocking capability available** (exit 2 / `decision: "block"`), and the file's stated design principle is fail-open. | The code is correctly fail-open, but the **consequence of ever blocking** is not recorded anywhere in the project: blocking a *reactive* compaction (one triggered by a context-limit error the API already returned) makes **the current request fail**. This must be written into the design as a permanent prohibition, not left to a future agent's judgement. | P1 §PreCompact (ledger C14) |
| **X11** | Governance rules are assumed to be in context on the Claude Code side because `.claude/rules/` is populated (23 files). | **Measured frontmatter, file by file, from disk this session** — the picture is split three ways, and the most important rules are in the two categories that do **not** survive: <br>• **`research-standard.md` carries `paths: ["**/*"]`** and `lambda-pattern.md` carries `paths:` → on the Claude Code side these are **PATH-SCOPED rules, LOST at every compaction** until a matching file is read again. The research floor — the rule this project engraved on 2026-08-08 — is in the losing category, *because* of its `**/*` glob. <br>• Only **4 files are truly unscoped `.md`** (`agent-incident-reporting.md`, `context-recovery.md`, `delegation-quant.md`, `fs-verification.md`) → these are the only ones **re-injected from disk**. <br>• **17 of the 23 files are `.mdc`**, not `.md` — see X13. | P3 table + §note · P2 §Set up rules · **[OBSERVED]** frontmatter of all 23 files (ledger C4) |
| **X13** | The `.claude/rules/*.mdc` mirrors (17 files, incl. `no-rule-violation`, `no-narrowing`, `prompt-authoring-mandate`, `research-delegation-mandate`, `berk-prime-laws`, `frontier-protocol`, `context-recovery.mdc`-equivalents) are treated as binding project rules on the Claude Code side. | P2 §Set up rules says: *"Place **markdown files** in your project's `.claude/rules/` directory… **All `.md` files** are discovered recursively"*, and every reference in P2, P3 and P1 spells the pattern **`.claude/rules/*.md`** (P1's `InstructionsLoaded` event description: *"a `CLAUDE.md` or **`.claude/rules/*.md`** file is loaded into context"*). The extension `.mdc` is a **Cursor** convention. **No Anthropic document states that `.mdc` is discovered.** If it is not, 17 of 23 governance files — including the no-rule-violation law itself — are **not in Claude Code's context at all**, before compaction is even considered. | P2 §Set up rules · P1 §InstructionsLoaded · **[OBSERVED]** 17 `.mdc` vs 6 `.md` in `.claude/rules/` — **[UNVERIFIED]**, and §12 states the exact measurement that would settle it |
| **X12** | The hook's own three-part verification standard (file on disk · wired in config · executed with output read) is treated as satisfied for the Claude Code side. | Parts 1 and 2 hold. **Part 3 does not**, in this repository: Claude Code has **never held a session here** (`~/.claude/projects/` has no directory for this project), so `SessionStart`, `PreCompact` and `PostCompact` have **never fired**. Piping a synthetic payload into `node` proves the **script**, never the **integration** — L30's own lesson, applying to the Claude side exactly as it applied to the Cursor side. | **[OBSERVED]** (ledger C20) · MEMORY.md L29, L30 |

---

## 11. What the evidence says the rebuilt mechanism should be

This section is the design consequence of §4–§10. It is **not** a decision — the engine choice, the
overwrite policy and anything touching Berk's machine are his (MEMORY.md L31: *"eskiler ezilecek"* is his
words about replacement; nothing here invents a policy in his name).

**The single organising insight.** Claude Code already implements the architecture that A1 (ARC),
A2 (ACM) and A4 (ACC) each independently argue for — an append-only, addressable store (the transcript
JSONL, measured lossless) plus a bounded active view (the summary). What is missing is the **citation**:
after a compaction nothing tells the model *the address of what it lost*. The current mechanism instead
re-states laws from memory on every turn. In ARC's terms we have the store and the bounded view and no
`_recall` handle.

**Ordered by (evidence strength × effect), the levers the evidence supports:**

1. **Put the durable material where the platform re-injects it from disk.** Static laws belong in
   project-root `CLAUDE.md` / **unscoped** `.claude/rules/*.md`, which are **re-injected after every
   compaction** (C3), not in per-turn `additionalContext`, which is **summarised away and replayed stale**
   (P1, X7). Concretely: drop `paths:` from `research-standard.md` (X11) and resolve the `.mdc` question
   (X13) before anything else — those two changes cost minutes and decide whether the rules are in context
   at all.
2. **Add a "Compact Instructions" section to `CLAUDE.md`** (C23, X9). It is the only documented lever on
   the artefact that *replaces the window*, and the summary's own structure (section 1 "Primary Request and
   Intent", section 6 "All user messages") shows the summariser is built to honour it. Zero recurring cost.
3. **Move the privileged payload to `SessionStart(compact)`** (C2, X3) and give it a *different* payload
   from `startup`: the compaction's own numbers, the **`transcript_path`**, the **boundary uuid**, and the
   short list of files to re-read. This event has a **600 s** budget instead of 30 s, and its
   `additionalContext` lands **at the head** of the new context — the position A3 measures as good.
4. **Demote `UserPromptSubmit` to a thin, fast marker** (C10, X2). No `execFileSync` to Python inside a
   30 s ceiling. Any regeneration belongs in the 600 s events. A hook whose output is discarded is L29
   rebuilt.
5. **Use `PostCompact` for what it can uniquely do: persist `compact_summary` to disk** (X4). It cannot
   inject, but it can write the summary next to the transcript path and the boundary uuids, producing
   exactly ARC's citation record for the next `SessionStart(compact)` to point at.
6. **Replace the append-only `MEMORY.md` load with a bounded, schema-governed state file** (X6, A4):
   goals · active constraints · entities · committed decisions · open questions, **replaced not appended**,
   held under **200 lines / 25 KB** so it is inside the budget the platform's own loader would read — with
   the 61,818 B lesson log demoted to the *recalled artifact store* it should always have been. A4's
   separation of **artifact recall from state commitment** is the exact discipline that stops a wrong
   figure in a summary from becoming permanent memory (A8's "one-off extraction" defect).
7. **Consider genuinely using auto memory** (`~/.claude/projects/<project>/memory/MEMORY.md`, or
   `autoMemoryDirectory` pointed at the repo) so that P3's *"Auto memory → Re-injected from disk"* row
   starts applying to us (X5). Today it applies to nothing we own.
8. **Write injected text as factual statements, not imperatives** (X8) — the documented way to avoid having
   the block surfaced to Berk instead of used.
9. **Never block compaction** (C14, X10): blocking a reactive compaction fails the current request. Record
   this as a permanent prohibition, not a judgement call.
10. **Tune the threshold rather than fight the summary** (C22): `CLAUDE_CODE_AUTO_COMPACT_WINDOW` /
    `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (lower-only) make compactions **earlier and smaller**. A9's
    error-accumulation result says many shallow compactions of *fresh* material beat few deep ones over
    material that is already a summary — but each compaction measured **143 s** of wall clock (C17), so
    this is a real trade-off, not a free win.

**What must NOT be concluded from this research.** That the mechanism can know what was lost *without
reading disk*: it cannot. That a hook can make the model obey: A1's guarantee is *"a property of the
memory mechanism, not of the agent that uses it"*. Pushing the recovery instruction is necessary; it is not
sufficient.

---

## 12. UNVERIFIED / SINGLE-SOURCE — and the exact artefact that would settle each

| Item | Status | The exact measurement or artefact that would settle it |
|---|---|---|
| Are **`.claude/rules/*.mdc`** files loaded by Claude Code at all? (X13 — decides whether 17 of 23 governance files exist for Claude Code) | **[UNVERIFIED]** — docs say `.md`, never `.mdc` | Start one Claude Code session in `C:\Berk\SsmContentAssetCreator` and run **`/context`**, reading the **Memory files** list (P2 names `/context` as the authoritative check for what actually loaded). Belt-and-braces: wire an **`InstructionsLoaded`** hook (matcher `session_start`) logging `file_path` + `memory_type` + `load_reason` — it exists for exactly this purpose |
| The 3-message `preservedSegment` / `preservedMessages` structure (C16) | **[single-source]** — one compaction, v2.1.219, `claude-desktop` | A second `compact_boundary` record from a different session on the installed **2.1.217 CLI**; compare `preservedMessages.uuids` length |
| `durationMs 143022` as typical compaction latency (C17) | **[single-source]** | ≥3 `compact_boundary` records; report median and range |
| "3 most recent tool results kept" by microcompaction (C18) | **[single-source]** T3 | Grep a transcript for `[Tool result cleared]` and count surviving inline tool results before a boundary |
| **Five** recently-accessed files re-injected (P8) vs **a token budget** (T3) — the sources disagree (C19) | **[2 sources, in conflict]** | Read the post-boundary records of a real transcript and count the re-injected file reads. This is directly observable and I did not do it — the transcript I found was a research session, not a file-heavy coding session |
| Cross-session compaction-summary caching (C21) | **[UNVERIFIED]** — T3 only | No primary source exists. Treat as nonexistent |
| The 33K reserve constant / `bG6()`/`Rg()` function names (C6) | **[single-source]** for the constants (the 167K figure is measured) | Only a bundle inspection would settle it; **not needed** — `CLAUDE_CODE_AUTO_COMPACT_WINDOW` sets the window explicitly, which makes the internal constant irrelevant to us |
| Whether `SessionStart(compact)` fires **before or after** `PostCompact` | **[UNVERIFIED]** — no doc states the ordering, and it determines whether the current gate's `acknowledgeAll()` on SessionStart clears the flag before `PostCompact` has recorded the event | Wire both to a hook that appends `hook_event_name` + a monotonic timestamp to one log file, then trigger `/compact` in a live session and read the order off disk |
| Does the skill index really not survive? (C13) | **[single-source]** — all citations are P3 | After a compaction, ask for a skill by name that was never invoked; or diff `/context` output across a boundary |
| ACC's per-scenario numeric table (A4) | not read | Fetch and read `arXiv:2601.11653` §4–§5 in full. I read §1–§3 and the abstract only, and have not quoted numbers I did not see |
| Whether the **installed 2.1.217** behaves as the docs (written against ≤2.1.226) describe | **[UNVERIFIED]** for every version-gated claim | The CLI is **9 releases behind**. Every claim above carries its documented version gate; the ones that matter (`v2.1.198` thinking inheritance, `v2.1.211` frontmatter measurement, `v2.1.214` `modified` field, `v2.1.217` brace-expansion fix) are all **≤ 2.1.217** and therefore present — but this is inference from the changelog, not observation |

**Not measured at all, and stated as a gap rather than hidden:** I did not exercise a live compaction in
this project (Claude Code has never run here — C20), so **every claim about what the rebuilt mechanism
*will* do is documentation-based**. The only compaction evidence in this document is the one historical
transcript in a different project.

---

## 13. Application (mandatory under the research floor)

This research is **filed, not yet applied.** Under `AGENTS.md` §RESEARCH FLOOR, "APPLICATION is mandatory
— the deliverable is CHANGED according to the findings." That change is **not** made in this pass, for two
reasons, both rule-based rather than convenience:

1. **`agent-incident-reporting` (MEMORY.md L7):** the artefacts the findings would change are the
   governance layer — `.claude/rules/`, `.claude/settings.json`, `.claude/hooks/context-recovery-gate.cjs`,
   `CLAUDE.md`. That rule orders an agent to **report and STOP**, never to self-fix the governance layer.
2. **This is Round 1, Agent B of 2.** A sibling pass covers Cursor. The mechanism is cross-tool and
   `no-narrowing` forbids me deciding a single-tool rebuild on my own judgement.

**The one change that is safe, in-scope and rule-compliant is this document plus its index entry.**
Everything in §11 is written as evidence-backed options with sources, for Berk's decision.

**[YOUR DECISION REQUIRED] — the two zero-risk items, if you want them done now:** (i) delete the
`paths: ["**/*"]` frontmatter from `.claude/rules/research-standard.md` so the research floor stops being a
path-scoped rule that dies at every compaction (X11); (ii) add a **Compact Instructions** section to
`CLAUDE.md` (X9). Both are additive, both are documented Anthropic levers, neither touches a hook. One
word is enough.

---

## 14. Honest limits of this research

- **Documentation vs observation is separated throughout.** Every `[OBSERVED]` claim names the artefact and
  the command; everything else is `[DOCUMENTED]`.
- **One real compaction was examined, in another project.** Sample size 1 for every measured compaction
  number. Marked `[single-source]` wherever it matters (C16, C17).
- **The installed CLI (2.1.217) is 9 releases behind the documented head (2.1.226).** No behavioural claim
  here was observed on 2.1.217 in this project, because Claude Code has never run in this project.
- **`hooks.md` was read at ~1,900 of 3,339 lines line-by-line** plus targeted reads of every remaining
  section relevant to compaction, memory, context injection, timeouts and exit codes. Sections on HTTP
  hooks, MCP-tool hooks, agent hooks, worktrees, elicitation and PowerShell specifics were read but are
  not load-bearing here. It is marked `[FULL]` on that basis; a reader who needs the HTTP-hook detail
  should re-read it.
- **I did not read A4–A9 in full**, only abstracts plus the sections named. Each is marked `[ABS]` and no
  number is quoted from a table I did not open. A1, A2 and A3 — the three load-bearing papers — were read
  in full.
- **`AGENTS.md`/`CLAUDE.md` were also present in this session as injected rule text.** I re-read both from
  disk anyway, because injected text is not a file read (fs-verification law).
