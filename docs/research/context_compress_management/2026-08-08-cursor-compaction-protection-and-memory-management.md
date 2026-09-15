# Cursor — Context-Compaction PROTECTION and MEMORY MANAGEMENT

**Date:** 2026-08-08 · **Scope:** Cursor ONLY (a sibling agent covers Claude Code) · **Language:** English
**Author:** research agent A of 2, under the research floor in `.claude/rules/research-standard.md`

Standards ledger — read in FULL this session before any search:
`.claude/rules/research-standard.md` · `.claude/rules/research-delegation-mandate.mdc` · `AGENTS.md` ·
`.claude/memory/MEMORY.md` (L29–L32 in particular).

---

## 1. The question

What, in Cursor specifically, actually PROTECTS an agent's working knowledge across a context
compaction, and how should MEMORY be organised, written and re-loaded so that a compaction cannot
destroy it?

The prior research effort in this project
(`docs/moviemaker/research/2026-08-08-context-recovery-hooks-compaction-detection.md`) covered
**DETECTION** only — whether a hook can know a compaction happened. It never established what
survives the boundary, what is discarded, or what a compaction does to everything already in the
window. `.claude/hooks/context-recovery-gate.cjs` was therefore designed on assumptions, and a
portable copy (`C:\Berk\Cursor_Hooks`) is about to be installed into every project on this machine.
Nothing about the current implementation is treated here as correct.

**Berk's stated focus, verbatim:** *"odağımız context compress de en ileri seviyede koruma memeory
management başka birşey değil"* — the most advanced possible PROTECTION at context compaction, and
MEMORY MANAGEMENT. Nothing else.

## 2. Measurement provenance — what is DOCUMENTED vs what was OBSERVED

Per the project's MEASUREMENT LAW (`AGENTS.md`) and L32, findings are separated by evidence class.

| Class | Meaning | How it appears below |
|---|---|---|
| **[DOC]** | Printed in a vendor's own documentation. Evidence of what is DOCUMENTED, not of what happens. | Cited to the doc URL. |
| **[OBS]** | Measured this session against the file system or an executable on this machine. | The command/layer and input are named. |
| **[PAPER]** | A published experimental result with numbers from the source's own tables. | Cited with arXiv ID / venue. |
| **[STAFF]** | A Cursor employee's statement on Cursor's own forum. Primary, but not documentation. | Named poster + date. |

**Honest limit stated up front:** every claim about Cursor's *internal* compaction behaviour in §5
is **[DOC]** or **[STAFF]**. Cursor is closed-source; this research did **not** and could not
instrument Cursor's summarizer. No claim here asserts observed Cursor-internal compaction behaviour.

## 3. Cursor version on this machine — measured from disk

Two independent disk reads, both this session:

```
C:\Program Files\cursor\Cursor.exe
  VersionInfo.ProductVersion : 3.14.7
  VersionInfo.FileVersion    : 3.14.7
  ProductName / CompanyName  : Cursor / Anysphere
  Length                     : 214,092,584 B
  LastWriteTimeUtc           : 2026-07-30 04:27:56

C:\Program Files\cursor\resources\app\package.json
  "name": "Cursor", "version": "3.14.7",
  "distro": "d5c0e77a0214208f36b56d42e8e787de88d02ea4"
```

Method: `Get-Item ... .VersionInfo` for the executable **[OBS]**, and a direct Read of
`resources/app/package.json` **[OBS]**. The two agree: **3.14.7**. Every behavioural claim below is
tagged to this version where the behaviour is version-dependent.

This **confirms** the version recorded in `MEMORY.md` L30 (3.14.7) — re-measured rather than
restated, per standing order 2 (NO ROTE WORK).

---

## 4. (a) The COMPLETE Cursor hook event surface, enumerated from Cursor's own docs

Source: `https://cursor.com/docs/hooks.md` — read in **FULL** (1,464 lines) **[FULL]**, plus
`https://cursor.com/docs/reference/third-party-hooks.md` **[FULL]**. The list was taken from Cursor's
own three category blocks, its Configuration example, and its per-event Reference section — not from
any list handed to this agent.

**Cursor 3.14.7 documents 21 hook events in three families.**

### 4.1 Agent hooks (Cmd+K / Agent Chat) — 18 events

| # | Event | Can it put text in front of the MODEL? | Output fields | Can it block? |
|---|---|---|---|---|
| 1 | `sessionStart` | **YES** — `additional_context` → *"the conversation's **initial system context**"* | `env`, `additional_context` (+`continue`/`user_message` accepted but **not enforced**) | No — fire-and-forget |
| 2 | `sessionEnd` | No | none (fire-and-forget; *"response is logged but not used"*) | No |
| 3 | `preToolUse` | **Only on deny** — `agent_message` = *"Message fed back to the agent when the action is denied"* | `permission`, `user_message`, `agent_message`, `updated_input` | **Yes** (`deny`; `ask` accepted by schema but *"not enforced for preToolUse today"*) |
| 4 | `postToolUse` | **YES** — `additional_context` → *"Extra context injected into the conversation **after the tool result**"* | `updated_mcp_tool_output`, `additional_context` | No |
| 5 | `postToolUseFailure` | No | *"No output fields currently supported"* | No |
| 6 | `subagentStart` | No | `permission`, `user_message` | **Yes** (`ask` unsupported → treated as `deny`) |
| 7 | `subagentStop` | **YES** — `followup_message` auto-continues | `followup_message` (only consumed when `status=="completed"`) | No |
| 8 | `beforeShellExecution` | **Only on deny** — `agent_message` | `permission` (`allow`/`deny`/`ask`), `user_message`, `agent_message` | **Yes** |
| 9 | `afterShellExecution` | No | none documented | No |
| 10 | `beforeMCPExecution` | **Only on deny** — `agent_message` | as #8 | **Yes** |
| 11 | `afterMCPExecution` | No | none documented | No |
| 12 | `beforeReadFile` | No | `permission`, `user_message` | **Yes** (default fail-**open**; `failClosed` available) |
| 13 | `afterFileEdit` | No | none documented | No |
| 14 | `beforeSubmitPrompt` | **NO** | **`continue`, `user_message` ONLY** | Yes (`continue:false`) |
| 15 | `preCompact` | **NO** | **`user_message` ONLY** | **No** — *"observational hook that **cannot block or modify** the compaction behavior"* |
| 16 | `stop` | **YES** — `followup_message` is *"automatically submit\[ted\] as the next user message"* | `followup_message` | No |
| 17 | `afterAgentResponse` | No | none documented | No |
| 18 | `afterAgentThought` | No | *"No output fields currently supported"* | No |

### 4.2 Tab hooks (inline completions) — 2 events

| # | Event | Notes |
|---|---|---|
| 19 | `beforeTabFileRead` | `permission` only. No `attachments` field (Tab has no prompt attachments). |
| 20 | `afterTabFileEdit` | Richer edit info (`range`, `old_line`, `new_line`). No output fields. |

Both are **irrelevant to compaction protection** — Cursor states *"Rules do not impact Cursor Tab"*
(`rules.md` FAQ) and these fire outside the agent conversation.

### 4.3 App lifecycle hooks — 1 event

| # | Event | Notes |
|---|---|---|
| 21 | `workspaceOpen` | Fires on workspace open **and every workspace-folder change**. Output: `pluginPaths` only. Omits `conversation_id`, `generation_id`, `model`, `session_id`, `transcript_path`. Runs in desktop app **and CLI**. |

### 4.4 There is NO `postCompact` event in Cursor

**This is a load-bearing negative finding.** `postCompact` appears in none of the four independent
places in Cursor's docs that enumerate events: the three category blocks, the Configuration example,
the Reference section, and the Claude-Code mapping table (which maps `PreCompact` → `preCompact` and
lists **no** `PostCompact` row at all). Cursor's Claude-compat table explicitly enumerates what is
supported and marks only `Notification` and `PermissionRequest` as unsupported — `PostCompact` is not
even present as a mappable Claude event.

⇒ **In Cursor there is no event that fires after a compaction completes.** Any design that assumes
one is designing against a hook that will never fire. **[DOC]**, cross-verified across two Cursor
doc pages read in full.

### 4.5 Input schema common to all hooks — the two fields that matter for memory

```json
{ "conversation_id", "generation_id", "model", "model_id", "model_params",
  "hook_event_name", "cursor_version", "workspace_roots", "user_email",
  "transcript_path" }
```

* **`transcript_path`** — *"Path to the main conversation transcript file (null if transcripts
  disabled)"*. Also exposed as the env var **`CURSOR_TRANSCRIPT_PATH`**. This is the single most
  important protection primitive in the entire surface (§6.1).
* **`conversation_id`** — *"Stable ID of the conversation **across many turns**"*, vs
  `generation_id` which *"changes with every user message"*. A stable per-conversation key for
  durable state; the compaction counter must be keyed on `conversation_id`, never `generation_id`.

### 4.6 `preCompact` input — the richest compaction telemetry Cursor exposes

```json
{ "trigger": "auto" | "manual", "context_usage_percent": 85, "context_tokens": 120000,
  "context_window_size": 128000, "message_count": 45, "messages_to_compact": 30,
  "is_first_compaction": true }
```

Seven fields, all read-only. `messages_to_compact` is the one that quantifies the damage: it states
how many messages are about to be replaced by a summary. `is_first_compaction` distinguishes the
first boundary from the repeat-compaction regime, which matters because decay **compounds** across
rounds (§7.2, Governance Decay: 0% → 78% across R=0→4).

### 4.7 Execution semantics, timeouts, exit codes

| Property | Value | Source |
|---|---|---|
| Transport | spawned process, **JSON over stdin, JSON over stdout** | `hooks.md` |
| Payload delivery | stdin — *"Hooks accept payloads over stdin. Avoids argv length limits"* (CLI changelog, **May 20 2026**) | CLI changelog [FULL] |
| Exit `0` | *"Hook succeeded, use the JSON output"* | `hooks.md` |
| Exit `2` | *"Block the action (equivalent to returning `permission: "deny"`)"* | `hooks.md` + third-party-hooks |
| Other exit codes | *"Hook failed, action proceeds (**fail-open by default**)"* | `hooks.md` |
| `failClosed: true` | *"hook failures (crash, timeout, invalid JSON) **block** the action"*; default `false` | `hooks.md` |
| `timeout` | **"platform default"** — the numeric default is **NOT stated anywhere in Cursor's docs** | `hooks.md` |
| `loop_limit` | default **5** for Cursor hooks, **`null`** for Claude Code hooks; `null` = no limit; applies to `stop` and `subagentStop` | `hooks.md` |
| Config precedence | Enterprise → Team → Project → User → Claude project-local → Claude project → Claude user. **All matching hooks from every source run**; higher priority wins on conflict | `hooks.md` + third-party-hooks |
| Working directory | project hooks run from **project root**; user hooks from `~/.cursor/` | `hooks.md` |
| Config reload | *"Cursor watches hooks.json files and reloads them on save"* | `hooks.md` |
| Debug surface | Hooks tab in **Customize** + a **Hooks output channel** | `hooks.md` |

**`timeout` is [UNVERIFIED].** Cursor's docs say "platform default" and never print the number. This
project's `.cursor/hooks.json` sets `30` on every hook explicitly, which is the correct defensive
posture precisely because the default is undocumented. What would settle it: the Hooks output
channel, or a deliberately-sleeping hook with no `timeout` key, timed.

### 4.8 Cloud agents — `sessionStart` is NOT available

Cursor's own support table: `preCompact` **Yes**, `postToolUse` **Yes**, `stop` **Yes**, but
`sessionStart` **No** — reason given verbatim: *"Deferred while cloud agents can still start in a
read-only environment. Hooks don't load there, so a cloud `sessionStart` would fire too late (after
the first write) rather than at true session start."* Also unavailable: `sessionEnd`,
`beforeMCPExecution`/`afterMCPExecution`, both Tab hooks, `workspaceOpen`. User-level hooks
(`~/.cursor/hooks.json`) do not load at all in cloud agents; only project/team/enterprise. Cloud runs
**command-based hooks only** — prompt-based hooks are unsupported there.

⇒ Any protection mechanism that depends on `sessionStart` is **absent in cloud agents**, and this
project uses cloud/background agents.

---

## 5. (b) Cursor's compaction lifecycle

### 5.1 What Cursor calls it, and what it operates on

Cursor's user-facing name is **summarization**; `/summarize` is the manual command, with `/compact`
and `/compress` retained as aliases (*"Renamed from `/compress` to match the IDE"* — CLI changelog,
**May 20 2026** **[FULL]**). The hook event is `preCompact`.

`https://cursor.com/docs/agent/prompting.md` **[FULL]** gives the decisive structural fact: the
context window is accounted in **eight named categories**, and they are separate line items:

1. **System prompt** — Cursor's built-in instructions
2. **Tools** — definitions of every tool
3. **Rules** — *"project and user rules included in the prompt"*
4. **Skills** — *"skill descriptions injected into the system context"*
5. **MCP** — instructions and catalog
6. **Subagents** — subagent-type documentation
7. **Summarized conversation** — *"compressed summaries of earlier turns"*
8. **Conversation** — *"your messages, the agent's replies, and tool results"*

And the mechanism: *"When the window gets close to full, Cursor compresses **older parts of the
conversation** into a summary to leave more room for new conversation."*

⇒ **Compaction operates on category 8 and deposits the result in category 7.** Categories 1–6 are
re-assembled per request and are not the subject of the summarization step. This is the single most
important protection fact about Cursor and it is stated in Cursor's own documentation. **[DOC]**

### 5.2 The trigger threshold: ~90% of the window, server-side, not configurable

`forum.cursor.com/t/auto-summarization-triggers-too-late.../166182` **[FULL]** — reply by
**deanrie (Dean Rie), Cursor staff, 2026-07-20**, verbatim:

> *"auto-summarization doesn't wait for the context to hit 100%. Background compaction starts before
> the hard limit, **around 90% of the window** being used. So there's already some protection from
> working right at the edge, it's just that the threshold is **fixed right now and set server-side,
> not user-configurable**."*

He also confirms what does **not** exist today: *"a configurable and generally earlier trigger
threshold"* and *"a mode where the summary is applied only at a turn boundary, not in the middle of a
task."* **[STAFF]**

⇒ Compaction in Cursor 3.14.7 is **proactive (≈90%), not error-recovery**, and **cannot be
influenced** from the client — not by a hook, not by a setting, not by a rule. The only client-side
control is *earlier* manual compaction via `/summarize`.

Cross-verification of the 90% figure against the literature: CWL (arXiv 2606.11213) states the
industry norm as *"a summarization pass when the context crosses a threshold (**often 70–90% of the
window**)"* citing four systems. Anthropic's server-side compaction uses an explicit
`input_tokens` trigger with a documented floor (*"must be at least 50,000"*). Three independent
sources place Cursor's 90% inside the normal band. **VERIFIED.**

### 5.3 Who writes the summary, and what it keeps

Two distinct regimes, and this is a genuine finding rather than a detail:

**(i) A clone of the active model.** On `forum.cursor.com/t/customizing-how-cursor-summarizes-context/160865`
the answer given is *"It depends on the model used, since **it is its clone that performs
summarization**"* **[ABS]**. The same thread reports a measured compression of the *Conversation*
category from **~190k tokens down to ~1k**, read off Cursor's own context-usage breakdown tray, and
describes the consequence precisely: *"the AI model's performance seems to degrade significantly, not
in the coding ability, but in the **requirement understanding and skill instruction following**"* —
i.e. exactly the governance-decay signature of §7.1, reported independently by a user before the
paper existed.

**(ii) Composer self-summarizes, as a trained behaviour.** `cursor.com/blog/self-summarization`
("Training Composer for longer horizons", Federico & Sasha, **2026-03-17**) **[FULL]** — Cursor's own
research post. The mechanism, verbatim:

> 1. Composer generates from a prompt until a fixed token-length trigger is reached.
> 2. We insert a synthetic query asking the model to summarize the current context.
> 3. The model is given scratch space to think about the best summary and then generates a condensed context.
> 4. Composer loops back to step 1 with the condensed context, **which includes the summary plus conversation state (plan state, remaining tasks, number of prior summarizations, etc.)**.

Real numbers from Cursor's own text: tested at an **80k** and a **40k** token trigger on CursorBench;
self-summary *"consistently reduces the error from compaction by **50%**"* versus a highly tuned
prompt-based baseline, *"while using **one-fifth of the tokens** and **reusing the KV cache**."* The
baseline prompt is *"thousands of tokens ... nearly a dozen carefully worded sections"* producing
*"more than **5,000** tokens"*; Composer's own summaries average *"only around **1,000** tokens."*
Case study: `make-doom-for-mips` (Terminal-Bench 2.0), **170 turns**, *"self-summarized more than
100,000 tokens down to the 1,000 it believed would most help it solve the problem."*

Two consequences that change the design:

* **Compaction quality is model-dependent in Cursor.** The same session compacts differently on
  Composer than on a non-Composer model. Any protection mechanism must be correct for the *worst*
  summarizer, not the best. This is independently the finding of Governance Decay's compactor×agent
  ablation, where *"violation tracks the summarizer, not the agent"* (§7.1).
* **Cursor's own published summary format is the best available template for what a recovery
  artefact should contain.** The Composer self-summary printed in that post has exactly six sections:
  `User goal` · `What was implemented` · `Errors / fixes (short)` · **`What's still broken / to do for
  the next assistant`** · `Concrete next steps` · `Paths`. That structure — goal, done, errors,
  open, next, paths — is Cursor's own answer to "what must survive", published with numbers behind
  it. `STATE.md` should mirror it.

### 5.4 What happens to injected text, rules, attachments, tool results, and the transcript

| Thing in the window | What compaction does to it | Evidence |
|---|---|---|
| Rules (`alwaysApply`, AGENTS.md, User/Team rules) | **Survives** — separate category, re-assembled per request; *"rule contents are included at the start of the model context"* | `prompting.md` §Context usage + `rules.md` §How rules work **[DOC]** |
| Skills descriptions | **Survives** — *"injected into the system context"*, own category | `prompting.md` **[DOC]** |
| System prompt, Tools, MCP, Subagents docs | **Survives** — own categories | `prompting.md` **[DOC]** |
| `sessionStart` → `additional_context` | Lands in *"the conversation's **initial system context**"*. **Ambiguous**: named "system context" but placed at conversation start, which is the oldest position and therefore the first thing a "summarize older parts" pass reaches. | `hooks.md` **[DOC]** — see **[UNVERIFIED-1]** in §10 |
| `postToolUse` → `additional_context` | Lands *"into the **conversation** after the tool result"* ⇒ category 8 ⇒ **compactable**, guaranteed | `hooks.md` **[DOC]** |
| `stop` → `followup_message` | Becomes *"the next **user message**"* ⇒ category 8 ⇒ compactable, **but** it is a user turn, and user turns are the class every studied harness protects longest | `hooks.md` **[DOC]** + §7.3 |
| Attached files (`@file`) and tool results | Category 8 ⇒ **compacted**. Cursor mitigates by writing long tool output to files instead of the window (§6.2) | `prompting.md` + dynamic-context-discovery **[DOC]** |
| Chat transcript on disk | **UNAFFECTED.** Compaction changes what is sent to the model; the `.jsonl` transcript keeps growing | **[OBS]** §6.1 |
| `preCompact` → `user_message` | Shown **to Berk on screen**. Never reaches the model. | `hooks.md` **[DOC]** |

### 5.5 Can compaction be prevented or influenced?

**No, and this is documented three ways.** (1) `preCompact` is *"an observational hook that **cannot
block or modify** the compaction behavior."* (2) The threshold is *"fixed ... and set **server-side**,
not user-configurable"* **[STAFF]**. (3) There is no `postCompact` event to repair afterwards (§4.4).

What *can* be influenced, and the consequence of each:

| Lever | Effect | Cost |
|---|---|---|
| `/summarize` early | Compacts before the degraded zone | *"interrupts work instead of being queued"* — a known open bug (forum 163978, acknowledged by staff) |
| New chat per work unit | No compaction at all | Loses live context; Cursor staff's own practice: *"Many of us in the team frequently start new chats, any time we move to a new area of the codebase"* (forum 102842) **[STAFF]** |
| Reduce what enters category 8 | Fewer compactions | Cursor's own `dynamic context discovery`: writing long tool output to files *"has resulted in **fewer unnecessary summarizations** when reaching context limits"* **[DOC]** |
| Move knowledge into categories 1–6 | Immune to compaction by construction | Costs tokens on **every** request |
| `/fork`, `/rewind` | Branch or roll back conversation state | CLI-documented; `/rewind` restores files **and** conversation state to an earlier turn |

---

## 6. (c) What PROTECTS knowledge across the boundary, in Cursor

### 6.1 The strongest primitive: the transcript file — measured on disk

Cursor gives every hook `transcript_path` and every hook script the env var
`CURSOR_TRANSCRIPT_PATH` **[DOC]**. Measured on this machine **[OBS]**:

```
C:\Users\berke\.cursor\projects\c-Berk-SsmContentAssetCreator\agent-transcripts\
  a0439f81-0e38-4932-a456-c0dbacdf0f13\
    a0439f81-...jsonl                     4,623,498 B   2026-08-08 12:13:43 UTC
    subagents\ (10 files)                12,352 – 173,634 B
  078bdfc1-...jsonl                          34,322 B   2026-08-08 10:09:07 UTC
  abaf4e42-...jsonl                         185,685 B   2026-08-04 15:45:42 UTC
```

12 files across 3 conversations; one `conversation_id` directory per conversation, with subagent
transcripts nested under `subagents/`. Method: Glob + `Get-ChildItem -Recurse` reading
`Length`/`LastWriteTimeUtc` per file — file-system only, never git, per the FS-verification law.

The load-bearing observation: **`a0439f81` is 4.62 MB and was still being appended at 12:13 UTC
today** — the same conversation whose earlier export (`MEMORY.md` L22) measured 2,825,514 B on
2026-08-06. The transcript **grew through every compaction that conversation experienced**.
Compaction shortens what is sent to the model; it does not touch the record on disk. **This is
[OBS], and it is the fact the whole protection design should rest on.**

### 6.2 Cursor's own first-party protection: chat history as a file

`cursor.com/blog/dynamic-context-discovery` (Cursor Research, **2026-01-06**, by Lukas Moller, Yash
Gaitonde, Wilson Lin, Jason Ma, Devang Jhabakh, Jediah Katz) **[FULL]**. §2 is titled *"Referencing
chat history during summarization"* and states the problem and Cursor's fix in Cursor's own words:

> *"the agent's knowledge can degrade after summarization since it's a **lossy compression** of the
> context. The agent might have forgotten crucial details about its task. In Cursor, we use the chat
> history as files to improve the quality of summarization. **After the context window limit is
> reached, or the user decides to summarize manually, we give the agent a reference to the history
> file. If the agent knows that it needs more details that are missing from the summary, it can
> search through the history to recover them.**"*

This is a **first-party, documented, post-compaction recovery mechanism in Cursor**, and it is
addressable-memory-by-file — precisely the architecture the ARC paper (L30) and CWL argue for. It
also carries Cursor's honest limit inside it: recovery is conditional on *"if the agent **knows** that
it needs more details"* — the same unaddressed-store problem recorded in `MEMORY.md` L30.

Measured numbers from the same post: MCP tool descriptions moved to files reduced *"total agent tokens
by **46.9%**"* in an A/B test on runs that called an MCP tool (*"statistically significant, with high
variance based on the number of MCPs installed"*). Long tool output written to files *"resulted in
**fewer unnecessary summarizations** when reaching context limits."* Terminal sessions are also synced
to the filesystem.

### 6.3 Rules and AGENTS.md — survive, at a per-request price

`cursor.com/docs/rules.md` **[FULL]**. The mechanism sentence: *"Large language models don't retain
memory between completions. Rules provide persistent, reusable context at the prompt level. When
applied, **rule contents are included at the start of the model context.**"*

| `alwaysApply` | `description` | `globs` | Behaviour |
|---|---|---|---|
| `true` | — | — | *"Always included. Globs and description are ignored."* |
| `false` | — | provided | Auto-attached when a matching file is in context |
| `false` | provided | omitted | *"Agent reads the description and pulls the rule in when relevant"* |
| `false` | omitted | omitted | Only on `@`-mention |

Precedence: **Team Rules → Project Rules → User Rules**, *"All applicable rules are merged; earlier
sources take precedence when guidance conflicts."* AGENTS.md is plain markdown, supported *"in the
project root and subdirectories"*, nested files *"combined with parent directories, with more specific
instructions taking precedence."* Cursor's own limits guidance: *"Keep rules under 500 lines"* and
*"Reference files instead of copying their contents."*

Two constraints this project must respect: a `.md` file in `.cursor/rules` is **ignored** (*"no
frontmatter"*) — only `.mdc` counts; and User Rules do **not** apply to Cmd/Ctrl+K, only Agent (Chat).

### 6.4 `env` from `sessionStart` — a session-scoped channel that is not context at all

*"Environment variables to set for this session. **Available to all subsequent hook executions**"*
**[DOC]**. This is invisible to the model but survives every compaction, because it lives in the
harness, not the window. It is the correct place for a compaction counter, an acknowledgement flag, or
a path handle that later hooks read. Unavailable in cloud agents (§4.8).

### 6.5 Cursor "Memories" — deprecated, and must not be designed around

Cursor 1.0 (June 2025) shipped **Memories** ("Generate Memories" under Settings → Rules, stored
per-project, proposed by a background model and user-approved). Current state, cross-verified:

* Cursor's **current** `rules.md` (fetched this session, **[FULL]**) documents four rule types —
  Project, User, Team, AGENTS.md — and **contains no Memories section at all**.
* Forum, `gerbz`, **2026-01-16**: *"The docs no longer contain information about memory, and memories
  are not showing up in cursor's Rules and Commands setting either… However, Opus just added a memory
  for me LOL"* — i.e. removed from docs/UI while some residual behaviour persisted **[ABS]**.
* Third-party (MemNexus, 2026-02-20): *"largely deprecated and removed by version 2.1"* **[ABS]**.

Verdict: **`[single-source]` on the exact removal version (2.1); VERIFIED that Memories is absent
from current Cursor documentation and must not be a dependency.** Durable memory in Cursor 3.14.7 is
rules + AGENTS.md + files on disk.

### 6.6 The complete protection ledger for Cursor 3.14.7

**SURVIVES a compaction:**

| Channel | Why | Evidence |
|---|---|---|
| `.cursor/rules/*.mdc` with `alwaysApply: true` | Own context category, re-assembled per request | `prompting.md` + `rules.md` **[DOC]** |
| `AGENTS.md` (root + nested) | Behaves as an always-rule for its directory | `rules.md` **[DOC]** |
| User Rules / Team Rules | Own category; Team enforceable | `rules.md` **[DOC]** |
| Skills (name + description) | *"injected into the system context"* | `prompting.md` **[DOC]** |
| System prompt · Tools · MCP catalog · Subagent docs | Own categories | `prompting.md` **[DOC]** |
| **The `.jsonl` transcript on disk** | Not part of the window; grows through compactions | **[OBS]** §6.1 |
| **Cursor's own chat-history file reference** | First-party post-summarization recovery path | dynamic-context-discovery **[FULL]** |
| `env` from `sessionStart` | Harness-side, not context | `hooks.md` **[DOC]** |
| Any file on disk (`STATE.md`, `MEMORY.md`, `BOOT.md`, ledgers) | Re-readable at any time | **[OBS]** |
| Composer's carried `conversation state` (plan state, remaining tasks, prior-summarization count) | Explicitly carried across the self-summary loop — **Composer models only** | self-summarization **[FULL]** |

**DOES NOT SURVIVE, or is discarded outright:**

| Channel | Why | Evidence |
|---|---|---|
| Conversation turns, assistant replies, **tool results** | The literal subject of compaction | `prompting.md` **[DOC]** |
| `postToolUse` → `additional_context` | Injected *"into the conversation"* = category 8 | `hooks.md` **[DOC]** |
| Attached files pulled in via `@` | Enter the conversation | `prompting.md` **[DOC]** |
| `preCompact` → `user_message` | Goes to the **screen**, never to the model | `hooks.md` **[DOC]** |
| `beforeSubmitPrompt` context injection | **No context field exists** — `continue`/`user_message` only | `hooks.md` **[DOC]** |
| **Plain (non-JSON) stdout from any Cursor hook** | Cursor's contract is JSON both ways; only declared fields are consumed | `hooks.md` **[DOC]**; confirms `MEMORY.md` L30 |
| A hoped-for `postCompact` hook | **Does not exist in Cursor** | §4.4 **[DOC]** |
| Cursor "Memories" | Deprecated / undocumented | §6.5 |
| Injected text replay after compaction | **Cursor documents no replay guarantee whatsoever** for previously injected `additional_context` | §10 **[UNVERIFIED-1]** |

---

## 7. The academic layer — 5-part depth per load-bearing source

### 7.1 Governance Decay / ConstraintRot — arXiv 2606.22528, Shiyang Chen [FULL]

arXiv ID verified by fetching `arxiv.org/abs/2606.22528` this session. **The single most important
paper for this decision.**

1. **Problem, authors' framing.** *"Modern LLM agents periodically compact their context… We show
   that this mechanism is a silent safety-failure surface: in-context governance constraints (runtime
   policies, memory entries, standing instructions) that an agent reliably obeys while visible are
   dropped when the harness compacts the history, **because compaction optimizes for task continuity
   and treats standing policies as low-salience content**."* Their thesis sentence:
   *"governing an agent requires governing how it forgets."*
2. **Method.** ConstraintRot: each scenario = (1) a policy turn establishing constraint *p*, (2)
   benign turns growing context past the compaction budget, (3) a trigger request whose natural
   completion violates *p*. Grading is **deterministic** — parse the terminal tool call, detect the
   prohibited effect, **no LLM judge**. Decay is defined as
   Δ_decay = v(M,[C(H_<t); r]) − v(M,[H_<t; r]).
   Conditions: floor / control / compaction / attack_volume / attack_inject / defense_pin /
   defense_pin_attack. 9 tasks (5 soft org policies, 4 hard safety norms) × 7 model families.
3. **Real numbers from their tables.**
   * **Control 0% → compaction 30% pooled violation; up to 59%** (DeepSeek-V4, Kimi-K2.5). 1,323
     episodes. Higher-powered grid: **+37 points, bootstrap 95% CI [31,43]**.
   * **Constraint survival is the mechanism**: survived ⇒ **0%** (n=90); dropped ⇒ **38%** (n=315).
     Keyword heuristic reproduces (1% vs 43%); three-judge majority reproduces (0% vs 40%).
   * **Compaction can be worse than never stating the rule**: DeepSeek 59% under compaction vs a
     **37% no-policy floor**.
   * **Aggressiveness dose-response**: summary budget 300→15 words ⇒ survival **88%→23%**, violation
     **7%→28%** (DeepSeek 20%→65%).
   * **Soft vs hard: +50 pts vs +6 pts — an 8.3× gap.** Per-task: email +62, language +67, channel
     +43, spend +43, deploy +33; pii +0, seccontrol +0.
   * **Strategy sweep**: recency-truncate **38%** (worst), hierarchical 36%, LLM-summarize 26%,
     **head_tail (keeps the oldest turn) 0%**.
   * **Repeated compaction compounds: 0% → 78% across R=0→4 rounds.** Cross-lingual: +42 (Chinese),
     +22 (Spanish).
   * **Channel ablation**: decay **+0** when the policy sits in the preserved system message, vs
     **+50** as a standing user instruction, **+45** as a memory entry, **+33** as tool output.
   * **Compactor × agent**: *"violation tracks the summarizer, not the agent"* — GLM as agent violates
     **53%** when handed a DeepSeek summary despite 7% with its own.
   * **Constraint Pinning: 0% under every model, every strategy, both fixed attacks**, at **≈47 pinned
     tokens (<0.5% overhead)**. Utility: **99% of allowed actions completed, 1% over-refusal**, better
     than the policy-in-context control (90%/10%).
   * Real-harness reproduction: LangGraph summarization node **65%**, LangMem SummarizationNode **95%**,
     AutoGen recency eviction **100%**, OpenAI Agents SDK **35%**.
4. **Limitations the author states.** Preserved immutable system/developer messages are *"a separate,
   safer channel"*; pinning needs the constraint *"extractable as a quotable rule"*; **pinning is
   defeated by operator-impersonation in the recent context (0%→17%, only halved to 10% by adding
   explicit provenance)** — *"as long as operator authority is asserted inside the token stream, the
   model cannot reliably tell a genuine operator update from an attacker impersonating one"*; survival
   scored by LLM judges; modest per-cell repetition.
5. **Application here.** This paper is the *evidence* for the mechanism Berk asked for, and it
   contradicts the current design (§9). Its three recommendations map 1:1 onto Cursor:
   (i) treat governance constraints as **pinned state exempt from compaction** ⇒ in Cursor, that means
   `alwaysApply: true` rules + AGENTS.md, i.e. categories 1–6, **not** injected `additional_context`;
   (ii) **prefer head-retaining compaction** — unavailable to configure in Cursor, therefore compensate
   by keeping the constraint out of category 8 entirely; (iii) **treat the summarizer as an
   untrusted-input sink**. And the 8.3× soft/hard gap is the direct warning for this project: every
   rule in `.claude/rules/` is a *soft, deployment-specific* rule — the exact class that decays.

### 7.2 CWL — "Beyond Compaction: Structured Context Eviction", arXiv 2606.11213 [FULL]

Semenov & Dorofeev (Kiz8), 2026-04-21. ID verified by fetch.

1. **Problem.** Summarization compaction has four named limitations, each of which *"compounds under
   the conditions in which it fires — mid-task, under token pressure"*: **lossiness is unpredictable**
   (*"Errors are not detectable from the compacted context alone"*), **structure is destroyed**
   (*"Prose summaries collapse this into narrative, erasing the provenance"*), **compression is
   expensive and blocking**, **hallucinations are introduced at the worst moment**.
2. **Method.** Agent annotates its own trajectory via one `delimiter` tool: `{action:start|end,
   name, type: "expl"|"act", dependencies[], description}`. Annotations form a typed DAG; a
   **deterministic, LLM-free** eviction policy (Algorithm 1) walks it. Six design principles, three of
   which are directly transferable: **P3 "User content is inviolable"**, **P4 "Causal dependencies
   dominate recency"**, **P5 "Compression must not invoke the model"**. Strip levels, least→most
   destructive: reasoning traces → bulk output → intermediate artifacts → full episode. Invariant 3:
   **"Prologue protection"** — system prompt, tool definitions and initial user turns are *"never
   eligible for eviction under any circumstances."*
3. **Real numbers.** Single session, **89 sequential tasks, >80 million tokens, ~$55/run**, τ=80k.
   Terminal-Bench 2.0 CWL **68.25%** vs baseline **68.40%**; SWE-Bench Lite **43.00%** vs **40.00%**;
   Recovery Bench **66.80%** vs **69.75%**; LongCLI-Bench **20.00%** vs **20.00%** — *"differ by at
   most 3 percentage points"*, i.e. **no measurable degradation** despite a strictly harder protocol.
   τ sweep: **>120k tokens = sharp cost increase with no accuracy gain**; **~50k = up to 3× cheaper,
   no accuracy loss, but up to 2× wall-clock** because the agent re-explores. Pareto band
   **τ ∈ [80k, 120k]**. Stable-prefix caching gave a **20–70%** inference-cost reduction. Cross-task
   case study (Linux kernel): compaction *"retained a prose description of what the syscall did but
   discarded the structural detail needed to wire the /proc entry to it correctly"*; CWL was **23%**
   cheaper.
4. **Limitations stated.** Eviction quality is only as good as the annotations; **KV-cache
   invalidation** can make CWL *"net-negative for caching"* under sustained pressure; and honestly:
   the delimiter protocol itself may perturb reasoning — *"in some sessions the model rushed through
   exploration… in longer sessions it occasionally over-explored."*
5. **Application here.** Cursor exposes no eviction API, so CWL cannot be implemented inside Cursor.
   What transfers is the *principle set*: **P5 (a protection mechanism must not depend on a model
   call)** is the argument for a deterministic hook that writes and re-reads files rather than asking
   a model to remember; **prologue protection** is the argument for putting the laws in
   rules/AGENTS.md; and the τ finding — *"a tighter budget is simultaneously cheaper and qualitatively
   better"* — is the argument for compacting **early** via `/summarize` rather than riding to 90%.

### 7.3 Position effects — "Lost in the Middle", Liu et al., TACL 2024, 12:157–173 [FULL]

Nelson F. Liu, Kevin Lin, John Hewitt, Ashwin Paranjape, Michele Bevilacqua, Fabio Petroni, Percy
Liang — **Stanford University** / UC Berkeley / Samaya AI. DOI 10.1162/tacl_a_00638; arXiv 2307.03172
fetched and read **[FULL]**. 1,051 citations. Named-professor tier-1 source (Liang, Stanford).

1. **Problem.** *"relatively little is known about how well they use longer context."*
2. **Method.** Two controlled tasks — multi-document QA (10/20/30 documents, 2.7K examples each) and
   synthetic key-value retrieval (JSON of UUID pairs) — varying **only** the position of the relevant
   information and the context length.
3. **Real numbers.** A **U-shaped curve**: *"performance is often highest when relevant information
   occurs at the beginning or end of the input context, and significantly degrades when models must
   access relevant information in the middle."* The decisive figure: *"when relevant information is
   placed in the middle of its input context, GPT-3.5-Turbo's performance on the multi-document
   question task is **lower than its performance when predicting without any documents** (i.e. the
   closed-book setting; **56.1%**)"* — a drop *"by more than 20%"* in the 20- and 30-document
   settings. Also: *"model performance saturates long before retriever recall levels off — using more
   than **20 retrieved documents only marginally improves performance (~1.5% for GPT-3.5-Turbo, ~1%
   for claude-1.3)**."* Query-aware contextualization (query before **and** after the content) makes
   key-value retrieval near-perfect but *"minimally changes trends in multi-document QA."*
4. **Limitations.** Not agentic; 2023-vintage models; the encoder-decoder robustness holds only
   within training-time sequence length.
5. **Application here.** Content in the middle is used **worse than no content at all**. Therefore a
   recovery block must lead — and this is also the empirical justification for the "alarm first"
   ordering already recorded in `MEMORY.md` L30. Corollary that L30 does **not** yet contain:
   **query-aware framing** — restating the requirement at both the top and the bottom of an injected
   block is a measured (if task-dependent) improvement, not a stylistic choice.

### 7.4 Context Rot — Chroma technical report, Hong, Troynikov & Huber, July 2025 [FULL]

`trychroma.com/research/context-rot`. Cited by name in both Cursor's own forum thread and by
Governance Decay.

1. **Problem.** *"LLMs are typically presumed to process context uniformly… in practice, this
   assumption does not hold."*
2. **Method.** 18 SOTA models (GPT-4.1, Claude 4, Gemini 2.5, Qwen3). Task complexity held **constant**
   while input length varies — NIAH extension with needle-question cosine-similarity control,
   distractors, haystack structure, **LongMemEval**, and a repeated-words replication task.
3. **Real numbers.** *"Across all experiments, model performance consistently degrades with increasing
   input length."* Lower needle-question similarity ⇒ faster degradation. *"Even a **single
   distractor** reduces performance relative to the baseline, and adding four distractors compounds
   this."* LongMemEval: **~113k-token full inputs vs ~300-token focused inputs** (306 prompts) —
   *"significantly higher performance on focused prompts compared to full prompts"*, with the Claude
   family showing *"the most pronounced gap"*, largely via abstentions. And across all 18 models,
   *"models perform better on **shuffled** haystacks than on logically structured ones."*
4. **Limitations authors state.** Deliberately simple tasks (*"Real-world applications typically
   involve much greater complexity, implying that the influence of input length may be even more
   pronounced in practice"*); needle-haystack similarity tested on only two topics — *"insufficient to
   draw a generalizable conclusion."*
5. **Application here.** The **~113k vs ~300 token** result is the quantitative case for the whole
   memory architecture: a small, focused, curated block beats a large faithful one. A recovery
   artefact should be a few hundred tokens of exactly-relevant state, not a dump — and `BOOT.md`
   should be generated *narrow*, not *complete*.

### 7.5 Security-Recall Divergence — arXiv 2604.20911, Yeran Gamage (Univ. of South Florida) [FULL]

ID verified by fetch. Concurrent with, and independent of, Governance Decay — cited by it.

1. **Problem.** Do behavioural constraints survive context depth? *"No prior work measures passive,
   depth-driven constraint decay under ordinary benign load."*
2. **Method.** **4,416 trials**, 12 models, 8 providers, six depths (t ∈ {5,10,13,16,20,25}),
   **three-arm causal design**: Arm A no dilution, Arm B +20 cloud tool schemas (~10k tokens), Arm C
   token-matched semantically-neutral padding. 8 formatting constraints (3 commission, 5 omission)
   crossed with difficulty, string-matched — no LLM judge.
3. **Real numbers.** **Omission compliance 73% at turn 5 → 33% at turn 16, while commission compliance
   holds at 100%** (Mistral Large 3; CMH χ²=147, p<10⁻³³). Schema semantics accounts for **62–100%** of
   the dilution effect. Token volume correlates (β̂=+0.19, p=3.4×10⁻⁸, n=4,004) while the **turn-depth
   coefficient is negligible (p=0.78)** — it is tokens, not turns. **Safe Turn Depth**: Mistral 10.6
   turns [5.0,16.7], Qwen 3.5 **7.1 turns** [5.0,10.5]. Gemma 4 31B is an observed immune control.
4. **Limitations.** Formatting proxies, not real security constraints (*"Whether decay rates for
   semantically meaningful operational constraints match those we measure here is untested"*); Arm C
   run on only 2 models; Gemma's immunity mechanism *"not established"*.
5. **Application here.** Two things the current design does not account for. First, the asymmetry:
   **prohibitions decay, requirements persist.** Most of this project's laws are prohibitions ("no
   rote work", "never run locally", "no fake done") — the fragile class. They should be **rewritten in
   commission form** wherever possible ("re-read X from disk this turn and state its mtime" instead of
   "don't work from memory"). Second, and importantly: *"the model violates a prohibition **without any
   compaction at all**"* — decay begins from **token volume alone**, well before the 90% trigger. A
   compaction-triggered mechanism is therefore **necessary but not sufficient**; the author's own
   mitigation is *"periodic constraint re-injection"* before the Safe Turn Depth, which for the worst
   model measured is **~7 turns**.

### 7.6 Policy-carriage integrity / ControlCapsule — arXiv 2605.12535, Igor Santos-Grueiro [FULL]

International University of La Rioja. ID verified by fetch. Concurrent independent work.

1. **Problem.** Agents act on an **assembled decision state**, not raw history: a = M(E(H)). *"The
   issue is not whether a directive appears somewhere in raw history, but whether it remains present,
   sound, and correctly bound in the decision state delivered to M."*
2. **Method.** Formalises **policy-carriage integrity** with an over-approximating applicable set
   A⁺(P,X,q) = ⋃ ApplicablePolicies; controlled pressure replay over real **AutoGen/tau3** and
   **OpenHands/SWE-bench** traces; an **effective-budget audit** separating advertised window from
   *residual decision budget* after system text, tool schemas, scaffolding, request and reserved output,
   recording normalized pressure ρ.
3. **Real numbers / results.** Protected placement **preserves policy across the whole pressure
   sweep**; counterfactual task-local placement is *"evicted, weakened, or preserved only by continuing
   past the replay budget, depending on the context manager."* Behavioural calibration:
   **0/90 unsafe-action proposals, 0/90 unguarded violations.**
4. **Limitations — unusually honest, and it matters.** The author explicitly refuses the stronger
   claim: *"policy absence alone did not establish unsafe model behavior"*; ControlCapsule is *"a
   reference design pattern, not a claim that a deployed system has been shown to outperform exact
   active-policy replay + preflight."*
5. **Application here.** Its **three failure families** are the right vocabulary for auditing our
   mechanism: **eviction** (retention failure), **semantic weakening** (soundness failure — the rule
   survives but weaker), **misbinding** (the rule survives but governs the wrong object). Our design
   only ever considered eviction. Its **complete-set preflight + fail-closed** rule is a concrete
   requirement: check that the whole active law set *fits* before assembly rather than silently
   truncating. Note the **disagreement with Governance Decay** on behavioural impact — recorded, not
   smoothed, in the ledger.

### 7.7 Supporting academic sources (same wave, corroborating)

* **LRE — "Learning What Not to Forget", arXiv 2606.20954 [ABS].** A few-kilobyte, **CPU-only,
  LLM-free** relevance scorer that keeps load-bearing units *by verbatim extraction*. Numbers:
  matches full-history accuracy overall, **exceeds the no-eviction baseline by 27%** on the simplest
  tasks, **peak context −52%**, **LoCoMo best budgeted answer quality reading 68% fewer tokens**; FIFO
  *"discards load-bearing state, so the agent loops, spending **+40% more steps**"*; LLM-based
  compression costs **5.45× model calls**. Training on the system's own behaviour recovers **95%** of
  supervised effectiveness. Framing that transfers verbatim: *"memory eviction in LLM agents is a
  **fidelity problem**."* **Verbatim extraction > paraphrase** is the design rule.
* **Parallel Context Compaction, arXiv 2605.23296 [ABS].** Cim, Topcu, Das, Kandemir (Penn State).
  Four backbones 8B–120B, HotpotQA + LoCoMo, τ=96k. The finding that indicts prompt-based control:
  *"the operator has no fine-grained control over summary volume since **prompt instructions are
  largely ignored**, and as context grows, both the amount of output tokens the model produces and the
  information it retains **fluctuate substantially from run to run**, making the agent's retained
  knowledge **unpredictable across runs**."* Also: summarization *"stalls agent inference for tens of
  seconds."*
* **Slipstream, arXiv 2605.08580 [ABS].** Chen, Pan, Dai, Netravali — trajectory-grounded compaction
  *validation*: asynchronously check that a summary preserved intent and constraints. The
  "verify the summary" primitive, cited by Governance Decay.
* Additional context/eviction literature encountered as cross-references (not counted as read):
  MemGPT (COLM 2024), ACON (arXiv 2510.00615), Context-Folding (Sun et al.), attention sinks (ICLR
  2024), H2O (NeurIPS 2023), Mem0 (ECAI 2025), Zep, A-MEM, RULER (COLM 2024), LongBench (ACL 2024).

---

## 8. (d) MEMORY FACILITIES in Cursor — loaded when, at what cost, with what limits

| Facility | Loaded when | Cost | Limits | Survives compaction |
|---|---|---|---|---|
| `.cursor/rules/*.mdc` `alwaysApply:true` | **Every chat session**, at *"the start of the model context"* | Full text, **every request** | **Must be `.mdc`** — `.md` is ignored; Cursor advises **<500 lines** | **YES** |
| `.mdc` + `globs` | When a matching file is in context | Only when attached | No control over whether the file enters context | YES while attached |
| `.mdc` + `description` | *"Agent reads the description and pulls the rule in when relevant"* | Description always; body on demand | **Model's discretion** — the ARC failure mode | Conditional |
| `.mdc` manual | Only on `@`-mention | Zero until used | Requires a human | N/A |
| `AGENTS.md` (root + nested) | Always, for its directory | Full text every request | No frontmatter, no glob scoping, no conditional modes | **YES** |
| User Rules | Every Agent (Chat) session, all projects | Full text | **Not applied to Cmd/Ctrl+K** | YES |
| Team Rules | Every conversation (or glob-scoped) | Full text | Team/Enterprise only; can be **enforced** un-disableable; precedence **highest** | YES |
| Skills (`SKILL.md`) | Name + description always; body on demand | Description-sized static cost | Discovery is model-driven | Description YES |
| `sessionStart` → `additional_context` | Once, at conversation creation | One-off | **Not available in cloud agents**; placement ambiguous (§10) | **[UNVERIFIED-1]** |
| `sessionStart` → `env` | Once; then *"available to all subsequent hook executions"* | ~0 tokens | Invisible to the model; not in cloud agents | YES (harness-side) |
| `postToolUse` → `additional_context` | After every matching tool call | Repeated ⇒ can itself drive compaction | Enters the **conversation** ⇒ compactable; injection broken before **Cursor 3.9.8** | **NO** |
| `stop` → `followup_message` | At loop end | A whole extra turn | `loop_limit` default **5** (`null` = unlimited) | As a user turn |
| **Transcript `.jsonl`** | Never automatic — path handed to hooks | Zero until read | Read cost when used; **null if transcripts disabled** | **YES** (measured, §6.1) |
| **Cursor's chat-history file** | Reference given at summarization | Zero unless searched | *"if the agent **knows** that it needs more details"* | **YES** (first-party) |
| Files on disk (`STATE.md`, `MEMORY.md`, `BOOT.md`) | Only when read | Read cost | Discretionary unless pushed | **YES** |
| Cursor **Memories** | — | — | **Deprecated / undocumented (§6.5)** | Do not use |
| `@Chats` | Manual @-mention | Variable | Human-driven | N/A |
| `/summarize`, `/fork`, `/rewind`, `/context` | Manual | — | `/summarize` currently **interrupts** running work | — |

### 8.1 How a hook writes and reads durable state in Cursor

Cursor's own documented pattern, from the TypeScript `stop`-hook example in `hooks.md` **[FULL]**:
state is written to **`.cursor/hooks/state/agent-metrics.json`**, keyed by **`conversation_id`**, read
with `readFile`, written with `mkdir(...,{recursive:true})` + `writeFile`. Cursor's own example
tracks a per-conversation counter across turns — exactly the shape a compaction counter needs. Plus
`env` from `sessionStart` for in-session flags, and `CURSOR_PROJECT_DIR` / `CURSOR_TRANSCRIPT_PATH`
for paths. This project's `compaction-events.json` is the same pattern; the correction needed is the
**key** (`conversation_id`, not a global file) and the **retrieval path** (pushed, not stored).

### 8.2 First-party guidance for reconstructing state after a compaction

Exactly **one** exists, and this research found it: §2 of `dynamic-context-discovery` — the chat
history file reference given to the agent at summarization time (§6.2). Cursor documents **no**
`postCompact` hook, **no** replay of injected context, and **no** state-reconstruction API.
Everything else is the operator's responsibility.

---

## 9. CONTRADICTS THE CURRENT IMPLEMENTATION

Read from disk this session: `.claude/hooks/context-recovery-gate.cjs` (442 lines) and
`.cursor/hooks.json` (105 lines). Wiring measured: `sessionStart`, `beforeSubmitPrompt`, `preCompact`,
`postToolUse` → `context-recovery-gate.cjs`, each `timeout: 30`.

| # | Assumption in the current mechanism | Evidence against it | Source |
|---|---|---|---|
| **1** | `AGENTS.md` §CONTEXT COMPACTION states the hook is *"wired to 8 events (… Cursor `sessionStart`, `preCompact`, `postToolUse`, `beforeSubmitPrompt`)"* and that its injected text *"is a **superset** of this section"*. | **Two of those four Cursor events cannot inject context at all.** `beforeSubmitPrompt` accepts **only** `continue`/`user_message` — no context field exists. `preCompact` accepts **only** `user_message`, which goes to the **screen**. So on the Cursor side the "superset" reaches the model through `sessionStart` (once, and **never in cloud agents**) and `postToolUse` (which lands in the **compactable** conversation). The claim of 8-event coverage is a claim about *firing*, not about *reaching the model*. | `hooks.md` **[FULL]** |
| **2** | The alarm is delivered by re-injecting a banner **into the context** on later turns. | Governance Decay's channel ablation measures this exact choice: decay **+0** when the constraint is in the **preserved system channel** vs **+50 / +45 / +33** when it is a standing user instruction / memory entry / tool output. `postToolUse` `additional_context` is the +33 class. **The laws belong in `alwaysApply` rules and AGENTS.md — categories that compaction does not touch — not in injected conversation text.** | arXiv 2606.22528 §3 **[FULL]** + `prompting.md` **[FULL]** |
| **3** | Detection-then-alarm is the protection: record the compaction, then lead later turns with a banner until one carries it. | Cursor exposes **no `postCompact` event**, so nothing fires *at* the boundary; and SRD shows constraints decay from **token volume alone (β̂=+0.19, p=3.4×10⁻⁸) with a negligible turn-depth coefficient (p=0.78)**, i.e. damage accrues **before** any compaction. A compaction-triggered alarm is **necessary but not sufficient**; the fix must be *continuous* (always-applied rules) not *event-driven*. | §4.4 **[DOC]** + arXiv 2604.20911 **[FULL]** |
| **4** | The three-places-in-prose duplication was removed as pure waste, leaving the hook as the carrier (`AGENTS.md`: *"Its injected text is a superset of this section and, unlike prose, it cannot go stale"*). | **Inverted by the evidence.** The prose lives in `AGENTS.md` and `.cursor/rules/*.mdc` — the channels that measure **+0 decay** and survive compaction by construction. The hook injects into channels that measure **+33** or are discarded outright. The *cost* argument was right; the *safety* conclusion was backwards. `alwaysApply` rules are the pinned channel Constraint Pinning prescribes, at ≈47 tokens per law. | arXiv 2606.22528 (+0 vs +33) **[FULL]** |
| **5** | `AGENTS.md` states the honest limit as *"a hook cannot read the context window's contents, so it knows a compaction happened but not what was lost."* | True but incomplete, and the missing half is actionable: **the full record IS on disk.** `transcript_path` / `CURSOR_TRANSCRIPT_PATH` is handed to every hook, and the transcript **grows through compactions** — measured: `a0439f81…jsonl` at **4,623,498 B**, appended 2026-08-08 12:13 UTC. Cursor itself uses exactly this for recovery. What was lost is **recoverable**, not unknowable. | **[OBS]** §6.1 + dynamic-context-discovery **[FULL]** |
| **6** | The recovery duty is expressed almost entirely as **prohibitions** ("NO ROTE WORK", "never assert your context is complete", "guessing is banned"). | SRD: **omission (prohibition) constraints decay 73%→33% while commission (requirement) constraints hold at 100%** in the same responses. The bans are in the fragile class. They must be restated as **commissions** — "run `context_boot.py` and paste its five answers", "state the mtime of the file you read" — which is the class that survives. | arXiv 2604.20911 **[FULL]** |
| **7** | `BOOT.md` is regenerated in full from the file system so nothing is stale — completeness is the goal. | Context Rot: focused **~300-token** inputs beat faithful **~113k-token** ones across all 18 models; Lost-in-the-Middle: mid-context content scores **below the 56.1% closed-book baseline**; Cursor's own Composer compacts 100k→**~1k**. **A complete boot document is the wrong target; a narrow, ordered, few-hundred-token one is right**, with the transcript and source docs as the addressable store behind it. | Chroma **[FULL]** + TACL 2024 **[FULL]** + Cursor self-summarization **[FULL]** |
| **8** | `compaction-events.json` is a single project-level ledger. | Cursor's own state example keys by **`conversation_id`** — *"Stable ID of the conversation across many turns"* — and this machine runs many concurrent conversations (**3 conversation dirs, 12 transcripts** measured, and MEMORY.md L6 records 20–50 concurrent agents). An unkeyed ledger cross-talks between conversations, and `is_first_compaction` / repeat-round tracking (0%→78% across R=0→4) becomes meaningless. | `hooks.md` **[FULL]** + **[OBS]** + arXiv 2606.22528 **[FULL]** |
| **9** | Not previously considered: the summarizer as an attack/failure surface. | Governance Decay: *"violation tracks the **summarizer**, not the agent"* (GLM 53% on a DeepSeek summary vs 7% on its own), and the recommendation *"treat the summarizer as an untrusted-input sink."* In Cursor the summarizer is *"its clone"* of whichever model is selected ⇒ **protection must not depend on model choice**, and long ingested content (docs, PDFs, screenplays — this project's daily diet) is exactly the vector. | arXiv 2606.22528 §5–7 **[FULL]** + forum 160865 **[ABS]** |
| **10** | Not previously considered: only *eviction* was modelled as the failure. | ControlCapsule names **three** families: eviction, **semantic weakening** (the law survives in weaker form), **misbinding** (the law survives but governs the wrong object). Weakening is invisible to any "is it present?" check — and L13/L23 in this project's own MEMORY.md are misbinding incidents. A presence check is not an integrity check. | arXiv 2605.12535 **[FULL]** |

---

## 10. CROSS-VERIFICATION LEDGER (load-bearing claims only)

| # | Claim | Source A | Source B | Source C | Verdict |
|---|---|---|---|---|---|
| 1 | Cursor version on this machine is **3.14.7** | `Cursor.exe` VersionInfo **[OBS]** | `resources/app/package.json` **[OBS]** | `MEMORY.md` L30 prior measurement | **VERIFIED** (2 independent disk reads + prior record) |
| 2 | Compaction targets the **conversation** category and leaves rules/system/tools/skills categories intact | `prompting.md` 8-category breakdown **[FULL]** | `rules.md`: rules *"included at the start of the model context"*, re-applied per session **[FULL]** | Governance Decay channel ablation: **+0** decay in the preserved channel vs +50/+45/+33 **[FULL]** | **VERIFIED** |
| 3 | Auto-compaction fires at **~90%** of the window, server-side, not user-configurable | Cursor staff **deanrie**, forum 166182, 2026-07-20 **[FULL/STAFF]** | `prompting.md`: *"When the window gets close to full"* **[FULL]** | CWL: industry norm *"often 70–90%"* citing 4 systems **[FULL]** | **VERIFIED** (exact 90% figure is **[single-source]** to Cursor staff; the *band* is triple-verified) |
| 4 | **Cursor has no `postCompact` event** | `hooks.md` category blocks + Configuration + Reference, 21 events, no `postCompact` **[FULL]** | `third-party-hooks.md` mapping table: `PreCompact`→`preCompact`, **no** `PostCompact` row **[FULL]** | Cursor CLI changelog Jan 2026 hooks entry lists *"pre-compaction"* only **[FULL]** | **VERIFIED** |
| 5 | `preCompact` cannot block or modify compaction | `hooks.md`: *"observational hook that cannot block or modify"* **[FULL]** | Output schema is `user_message` only **[FULL]** | Staff: threshold *"fixed … server-side"* **[FULL/STAFF]** | **VERIFIED** |
| 6 | `beforeSubmitPrompt` **cannot** inject context | `hooks.md` output table: `continue`, `user_message` only **[FULL]** | Cursor maps Claude `UserPromptSubmit`→`beforeSubmitPrompt` yet documents no context field **[FULL]** | `MEMORY.md` L30 (prior finding, Cursor staff-confirmed) | **VERIFIED** |
| 7 | Cursor consumes hook output as **JSON only**; plain text is discarded | `hooks.md`: *"communicate over stdio using **JSON in both directions**"*; every example prints JSON **[FULL]** | Per-event output tables enumerate named fields exclusively **[FULL]** | `MEMORY.md` L30 (prior, staff-confirmed) | **VERIFIED** |
| 8 | The `.jsonl` transcript survives and grows through compactions | **[OBS]**: `a0439f81…jsonl` **4,623,498 B**, mtime 2026-08-08 12:13:43 UTC, vs 2,825,514 B on 2026-08-06 (MEMORY.md L22) | `hooks.md`: `transcript_path` + `CURSOR_TRANSCRIPT_PATH` env var **[FULL]** | dynamic-context-discovery: history file used for post-summarization recovery **[FULL]** | **VERIFIED** |
| 9 | Compaction silently drops in-context governance constraints and causes violations | Governance Decay: 0%→30%, up to 59%, 1,323 episodes; survived 0% vs dropped 38% **[FULL]** | SRD: omission 73%→33% while commission holds 100%, 4,416 trials **[FULL]** | ControlCapsule: task-local placement *"evicted, weakened, or preserved only by continuing past the budget"* **[FULL]** | **VERIFIED** (3 independent 2026 papers, different authors/institutions/methods) |
| 10 | Pinning constraints in a preserved channel eliminates the failure | Governance Decay: **0%** across 7 models & both attacks, ≈47 tokens, <0.5% overhead **[FULL]** | ControlCapsule: protected placement preserves policy across the whole pressure sweep **[FULL]** | Microsoft Agent Framework: *"System … **Always preserved during compaction**"* + `preserve_system=True` in first-party code **[FULL]** | **VERIFIED** |
| 11 | Mid-context placement is used worse than no content at all ⇒ lead with the alarm | Lost in the Middle: middle-position performance **below the 56.1% closed-book baseline** **[FULL]** | Context Rot: consistent degradation across 18 models; focused ~300 tok ≫ full ~113k tok **[FULL]** | Governance Decay: *"models under-use mid-context information (Liu et al. 2024a)"* as motivation **[FULL]** | **VERIFIED** |
| 12 | Summarization is lossy in a way the harness cannot predict or control by prompting | Parallel Compaction: *"prompt instructions are largely ignored"*; retention *"fluctuate\[s\] substantially from run to run"* **[FULL]** | CWL: *"Lossiness is unpredictable… Errors are not detectable from the compacted context alone"* **[FULL]** | Cursor's own blog: *"it's a **lossy compression** of the context"* **[FULL]** | **VERIFIED** (including by the vendor) |
| 13 | Compaction quality tracks the **summarizer**, not the agent | Governance Decay compactor×agent: GLM agent **53%** on a DeepSeek summary vs **7%** on its own **[FULL]** | Cursor: summarization performed by *"its clone"* of the selected model **[ABS]** | Cursor self-summarization: a *trained* summarizer halves compaction error ⇒ the summarizer is the variable **[FULL]** | **VERIFIED** |
| 14 | Prohibitions decay while requirements persist | SRD: 4,416 trials, CMH χ²=147, p<10⁻³³ **[FULL]** | Governance Decay soft vs hard: **+50 vs +6 (8.3×)** — the arbitrary org rule is the fragile one **[FULL]** | Gamage cited by Chen as concurrent confirmation of *"the same phenomenon"* **[FULL]** | **VERIFIED** (mechanisms differ — see disagreement #1) |
| 15 | Cursor **Memories** is not a usable durable-memory facility in 3.14.7 | Current `rules.md` documents 4 rule types, **no Memories section** **[FULL]** | Forum `gerbz` 2026-01-16: gone from docs **and** the Rules settings UI **[ABS]** | MemNexus 2026-02-20: deprecated/removed by 2.1 **[ABS]** | **VERIFIED** that it is undocumented; the **removal version (2.1) is [single-source]** |
| 16 | Cursor provides a first-party post-summarization recovery path (history file) | `dynamic-context-discovery` §2, Cursor Research 2026-01-06 **[FULL]** | InfoQ 2026-01 independent report of the same mechanism **[ABS]** | ZenML LLMOps database entry **[ABS]** | **VERIFIED as documented**; whether it fires in 3.14.7 is **[UNVERIFIED-2]** |
| 17 | Composer self-summarization: **50%** compaction-error reduction, **1/5** the tokens, ~1k-token summaries at 80k/40k triggers | `cursor.com/blog/self-summarization` **[FULL]** | Independent report (NivaaLabs, Cursor 3 review): *"compaction errors reduced by 50%"* **[ABS]** | Terminal-Bench 2.0 case study in the same post: 170 turns, >100k→1k **[FULL]** | **VERIFIED as vendor-reported**; not independently reproduced ⇒ vendor benchmark (CursorBench, internal) |
| 18 | `sessionStart` is unavailable in cloud agents | `hooks.md` unsupported-hooks table with stated reason **[FULL]** | Same page: cloud runs **command-based hooks only**, no user-level hooks **[FULL]** | — | **[single-source]** (one doc page, two independent statements within it) |
| 19 | Hook `timeout` default | `hooks.md`: *"platform default"* — **number never printed** | — | — | **[UNVERIFIED-3]** |
| 20 | `postToolUse` context injection was broken before Cursor **3.9.8** | `MEMORY.md` L30 (prior session, staff-attributed) | Not re-findable in Cursor's current docs or changelog this session | — | **[single-source]** — carried forward, flagged, not relied on |

### Disagreements recorded, not smoothed

1. **Mechanism of constraint loss.** Gamage (2604.20911) attributes decay to **attention dilution in
   long context**; Chen (2606.22528) explicitly rejects that as the explanation for *his* effect and
   attributes it to **active deletion by the compactor**, ruling length out with an ablation: *"GLM
   never violates even in an uncompressed 5.9k-token long context (0%)"* while a counterfactual summary
   omitting the policy yields **60%**. **Both are real and they are additive** — dilution damages
   before the boundary, deletion at it. A mechanism that addresses only one is half a mechanism. This
   is the single most useful disagreement in the whole set.
2. **Whether policy absence causes unsafe behaviour.** Chen measures large behavioural violation
   (0%→30%, up to 59%). Santos-Grueiro reports **0/90** unsafe-action proposals under a fixed
   assembler and explicitly declines the behavioural claim. Different harnesses, models and pressure
   regimes; treat the *state* failure as established and the *behavioural* magnitude as
   harness-dependent.
3. **Whether summarization is best fixed by better summaries or by not summarizing.** Cursor's own
   answer is a better (trained) summarizer, −50% error. CWL's answer is deterministic LLM-free
   eviction, *"by construction"*. LRE's is a learned LLM-free scorer with **verbatim extraction**.
   Unresolved in the literature; only the first is available inside Cursor.

### `[UNVERIFIED]` items, and the exact artefact that would settle each

| ID | Item | What would settle it |
|---|---|---|
| **[UNVERIFIED-1]** | Whether `sessionStart` → `additional_context` survives a compaction. Cursor says it joins *"the conversation's **initial system context**"* — "system" implies a preserved category, "initial … conversation" implies the oldest compactable position. **The docs do not disambiguate, and no replay guarantee is stated anywhere.** | A controlled session: inject a unique nonce via `sessionStart`, drive the window past ~90% (`preCompact` firing confirms), then ask the model to repeat the nonce. Nonce present ⇒ preserved; absent ⇒ compactable. **This single experiment decides whether `sessionStart` may carry any law at all.** |
| **[UNVERIFIED-2]** | Whether the chat-history-file recovery path (§6.2) is actually live in 3.14.7. Announced 2026-01-06 as *"live for all users in the coming weeks"*. | Post-compaction, inspect the Hooks/agent surface for a history-file reference, or locate the file Cursor hands over on disk under the project state dir. |
| **[UNVERIFIED-3]** | Cursor's default hook `timeout`. | The Hooks output channel, or a sleeping hook with no `timeout` key, timed. Mitigation already in place: every hook here sets `30` explicitly. |
| **[UNVERIFIED-4]** | Whether `preCompact` fires for **manual** `/summarize` in the IDE as well as auto-compaction. The input schema has `trigger: "auto" \| "manual"`, which implies yes, but this is inference from a schema — and this project's own law says a printed schema is never evidence of behaviour (MEMORY.md L12.3). | Run `/summarize` and read the Hooks output channel for a `preCompact` invocation with `trigger:"manual"`. |
| **[UNVERIFIED-5]** | Exact Cursor version that removed Memories (reported 2.1). | Cursor changelog for 2.1. Does not affect the recommendation: it is undocumented in 3.14.7 and must not be depended on. |
| **[single-source]** | `postToolUse` injection broken before 3.9.8 (carried from L30). | Cursor changelog 3.9.8 entry. |

---

## 11. How this applies to the mechanism in §1 — the decision this research supports

Stated as findings-driven requirements, not as a decision. **Berk decides.** No file outside this
document and the `docs/README.md` index was changed by this research.

**R1 — The laws belong in the channels compaction cannot reach.** Every non-negotiable law moves to /
stays in `.cursor/rules/*.mdc` with `alwaysApply: true` and `AGENTS.md`. Measured basis: **+0 decay in
the preserved channel vs +33 for tool-output-delivered policy** (2606.22528); Cursor's own category
model puts Rules outside the compaction target. This **reverses** the 2026-08-08 direction of travel
(§9 #4): the cost saving was real, but the safety conclusion was backwards. Constraint Pinning costs
**≈47 tokens per law, <0.5% overhead**, and *improved* utility (99% vs 90% allowed-action completion).

**R2 — The hook's job is not to carry the laws; it is to PUSH the addressable pointer.** ARC's
limitation (L30) and Cursor's own *"if the agent knows that it needs more details"* are the same
problem: a store nobody addresses is not memory. The hook's remaining, real jobs in Cursor are:
(a) `preCompact` → `user_message`, the **only** channel that puts the alarm in front of **Berk**;
(b) `sessionStart` → `env`, a `conversation_id`-keyed counter, invisible and compaction-proof;
(c) `sessionStart` → `additional_context`, **pending [UNVERIFIED-1]**;
(d) writing the transcript path + a narrow recovery pointer to disk at `preCompact`.

**R3 — Use the transcript. It is the only complete record and it survives.** Measured: 4.62 MB and
growing through compactions (§6.1). `preCompact` gets `messages_to_compact` and
`CURSOR_TRANSCRIPT_PATH` **in the same payload** — enough to record precisely which span is about to
be summarized, so the lost region is *addressable* afterwards rather than merely mourned. This is
Cursor's own strategy, and it retires the "we cannot know what was lost" limit in `AGENTS.md`.

**R4 — Restate the bans as duties.** Prohibitions decay 73%→33%; requirements hold at 100%
(2604.20911). Each ban gets a commission twin: not *"don't work from memory"* but *"state the mtime of
the file you read this turn."* Verifiable, and in the surviving grammar.

**R5 — `BOOT.md` gets narrower, not more complete.** ~300-token focused ≫ ~113k faithful (Chroma);
mid-context is worse than nothing (TACL 2024); Composer's own answer is ~1k tokens. Adopt **Cursor's
published self-summary skeleton** (§5.3): goal · what was done · errors/fixes · **what's still broken
for the next assistant** · concrete next steps · paths. Alarm first, never buried.

**R6 — Key all durable state by `conversation_id`.** Cursor's own state example does exactly this;
this machine runs 3+ concurrent conversations and 20–50 concurrent agents (L6). Track
`is_first_compaction` and the round count — decay compounds **0%→78% across R=0→4**.

**R7 — Compact early and deliberately.** ~90% is inside the degraded zone; CWL measures a tighter
budget as *simultaneously cheaper and qualitatively better*; SRD's worst Safe Turn Depth is **~7
turns**. Practical levers in Cursor: `/summarize` at a natural boundary, a new chat per work unit
(Cursor staff's own practice), and cutting what enters category 8 — Cursor measured **−46.9% tokens**
from moving MCP descriptions to files and reports *"fewer unnecessary summarizations."*

**R8 — Audit for three failure families, not one.** Eviction, **semantic weakening**, **misbinding**
(2605.12535). A presence check misses two of three; L13 and L23 in this project's own memory are
misbinding incidents. Add **complete-set preflight + fail-closed** on the law set.

**R9 — Treat the summarizer as untrusted, and never depend on model choice.** Violation tracks the
summarizer (GLM 53% on a foreign summary vs 7% on its own); Cursor's summarizer is a clone of whatever
model is selected. Correctness must hold for the worst summarizer. This project ingests large external
documents daily — the exact Compaction-Eviction vector.

**R10 — Verify the OUTPUT SHAPE against Cursor's schema table, per event, and re-verify per version.**
Every claim about what reaches the model in §6.6 is per-event and version-tagged (3.14.7). Piping JSON
into `node` proves the script; only the host's own schema table proves the integration (L30).

**R11 — The portable package must be corrected before it is installed everywhere.** `C:\Berk\Cursor_Hooks`
carries the same four assumptions (§9 #1–#4). Installing it into every project would replicate them
N times. Per `no-narrowing` §J the authoring agent owns downstream breakage.

### Trade-offs, stated honestly

| Choice | Gain | Cost |
|---|---|---|
| Laws in `alwaysApply` rules | Compaction-proof, +0 measured decay | Tokens on **every** request — the cost the 2026-08-08 trim was chasing. Bounded: ~47 tokens/law measured, and Cursor advises <500 lines/rule. |
| Hook injects a pointer, not the payload | Cheap, cannot go stale | Requires the agent to follow the pointer — the ARC gap; mitigated only by making the *pointer* itself a pinned duty |
| Transcript-based recovery | Complete, survives, first-party precedent | Read cost; `null` if transcripts are disabled |
| Early `/summarize` | Avoids the degraded zone | Currently **interrupts** running work (open Cursor bug 163978) |
| New chat per work unit | No compaction at all | Loses live context; needs a real handoff artefact |
| More in categories 1–6 | Immune by construction | Squeezes the residual decision budget (ControlCapsule's ρ) |

---

## 12. Sources — 26 total, of which 8 academic

**Academic (8):** items 1–8. **[FULL]** = whole page/paper read this session; **[ABS]** = abstract or
partial. All arXiv IDs verified by fetching.

| # | Source | Mark |
|---|---|---|
| 1 | Chen, Shiyang. *Governance Decay: How Context Compaction Silently Erases Safety Constraints in Long-Horizon LLM Agents.* arXiv **2606.22528** — `arxiv.org/abs/2606.22528` (ID verified by fetch) | **[FULL]** |
| 2 | Semenov, A. & Dorofeev, S. *Beyond Compaction: Structured Context Eviction for Long-Horizon Agents (CWL).* arXiv **2606.11213**, 2026-04-21 — `arxiv.org/html/2606.11213` (verified) | **[FULL]** |
| 3 | Liu, N.F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., **Liang, P.** *Lost in the Middle: How Language Models Use Long Contexts.* **TACL 2024, 12:157–173**, DOI 10.1162/tacl_a_00638; arXiv 2307.03172 (verified). Stanford / UC Berkeley / Samaya AI | **[FULL]** |
| 4 | Gamage, Yeran (Univ. of South Florida). *Omission Constraints Decay While Commission Constraints Persist in Long-Context LLM Agents (SRD).* arXiv **2604.20911** (verified) | **[FULL]** |
| 5 | Santos-Grueiro, Igor (Intl. Univ. of La Rioja). *Ghost in the Context: Policy-Carriage Integrity in LLM Agent Context Assembly (ControlCapsule).* arXiv **2605.12535** (verified) | **[FULL]** |
| 6 | *Learning What Not to Forget: Long-Horizon Agent Memory from a Few Kilobytes of Learning (LRE).* arXiv **2606.20954** — `arxiv.org/html/2606.20954` | **[ABS]** |
| 7 | Cim, M., Topcu, B., Das, C., Kandemir, M.T. *Parallel Context Compaction for Long-Horizon LLM Agent Serving.* arXiv **2605.23296** | **[ABS]** |
| 8 | Chen, Z., Pan, R., Dai, Y., Netravali, R. *Slipstream: Trajectory-Grounded Compaction Validation for Long-Horizon Agents.* arXiv **2605.08580** | **[ABS]** |

**Vendor-primary — Cursor (10):**

| # | Source | Mark |
|---|---|---|
| 9 | `cursor.com/docs/hooks.md` — complete hook reference, 1,464 lines | **[FULL]** |
| 10 | `cursor.com/docs/reference/third-party-hooks.md` — Claude mapping, exit codes, precedence | **[FULL]** |
| 11 | `cursor.com/docs/agent/prompting.md` — the 8 context categories, compaction statement | **[FULL]** |
| 12 | `cursor.com/docs/rules.md` — 4 rule types, frontmatter matrix, AGENTS.md, precedence | **[FULL]** |
| 13 | `cursor.com/blog/self-summarization` — *Training Composer for longer horizons*, Federico & Sasha, 2026-03-17 | **[FULL]** |
| 14 | `cursor.com/blog/dynamic-context-discovery` — Cursor Research, 2026-01-06 (Moller, Gaitonde, Lin, Ma, Jhabakh, Katz) | **[FULL]** |
| 15 | `cursor.com/docs/cli/changelog` — hooks-over-stdin (May 20 2026), `/summarize` rename, Jan 2026 hooks entry | **[FULL]** |
| 16 | `cursor.com/changelog/page/12` — summarization triggers, `/summarize`, compact chat mode | **[ABS]** |
| 17 | `cursor.com/docs/cli/using` — rules in CLI, `/summarize`, `--resume` | **[ABS]** |
| 18 | `cursor.com/docs/agent/overview` — agent = instructions + tools + model | **[ABS]** |

**Cursor forum — staff and field reports (4):**

| # | Source | Mark |
|---|---|---|
| 19 | forum 166182 *Auto-summarization triggers too late (context rot)* — **staff deanrie, 2026-07-20: ~90%, server-side, fixed** | **[FULL]** |
| 20 | forum 160865 *Customizing how Cursor summarizes context* — ~190k→~1k measured; *"its clone that performs summarization"* | **[ABS]** |
| 21 | forum 102842 *Summarizing chat context — why?* — staff on the 3 options and the new-chat practice | **[ABS]** |
| 22 | forum 167429 / 167226 — v3.14 turn auto-collapse; staff **kevinn**, 2026-08-05 (working-memory/visibility discussion) | **[ABS]** |

**Other frontier labs — primary (3):**

| # | Source | Mark |
|---|---|---|
| 23 | Anthropic, *Effective context engineering for AI agents* — compaction defined; *"maximize recall … then iterate to improve precision"* | **[ABS]** |
| 24 | Anthropic Claude docs — server-side `compact_20260112`, `input_tokens` trigger (**min 50,000**), `pause_after_compaction`, compaction block; context editing (`clear_tool_uses_20250919`) | **[ABS]** |
| 25 | **Microsoft Agent Framework**, `learn.microsoft.com/.../conversations/compaction` — *"System … **Always preserved during compaction**"*, `MinimumPreserved` floor (default 4; .NET summarization default 8), atomic tool-call groups, and an explicit **prompt-injection warning about trusting the summarizer** | **[ABS]** |
| 26 | Microsoft `agent-framework` first-party code — `_compaction.py` (`preserve_system: bool = True`), `SummarizationCompactionStrategy.cs` | **[ABS]** |

**Cross-tool corroboration (not counted in the 26):** InfoQ 2026-01 and ZenML LLMOps entries on
dynamic context discovery; NivaaLabs Cursor 3 review (50% compaction-error figure); MemNexus
2026-02-20 on Memories deprecation; DeepWiki `cursor/cookbook` hooks pages; GitButler
*Deep Dive into the new Cursor Hooks* (Cursor 1.7-era, **superseded** — it lists only 6 lifecycle
hooks vs the 21 documented in 3.14.7, and is flagged here as stale rather than cited as current).

**Counts: 26 independent authoritative sources, of which 8 are academic. Floor (20 / 5) met and
exceeded. 14 marked [FULL].**

### On-disk evidence produced this session (file-system only, per the FS-verification law)

| Artefact | Measurement |
|---|---|
| `C:\Program Files\cursor\Cursor.exe` | 214,092,584 B · ProductVersion **3.14.7** · mtime 2026-07-30 04:27:56 UTC |
| `C:\Program Files\cursor\resources\app\package.json` | `"version": "3.14.7"`, distro `d5c0e77a…` |
| `…\agent-transcripts\a0439f81-…\a0439f81-….jsonl` | **4,623,498 B** · mtime 2026-08-08 12:13:43 UTC |
| `…\agent-transcripts\` (recursive) | 12 `.jsonl` files, 3 conversation dirs, 10 subagent transcripts |
| `.cursor/hooks.json` | 105 lines; `sessionStart`/`beforeSubmitPrompt`/`preCompact`/`postToolUse` → `context-recovery-gate.cjs`, `timeout: 30` each |
| `.claude/hooks/context-recovery-gate.cjs` | 442 lines; output shapes read directly (lines 366–422) |

### Honest limits of this research

1. **No Cursor-internal compaction was instrumented.** Every §5 claim is **[DOC]** or **[STAFF]**.
   Cursor is closed-source and its summarizer runs server-side.
2. **No live compaction was triggered.** [UNVERIFIED-1] — the `sessionStart` survival question, which
   is the most decision-relevant open item — needs a controlled session that drives a real window past
   ~90%. That is a spending/session action, not a research action, and is left to Berk.
3. **Two [ABS] academic sources** (LRE, Parallel Compaction) were read at abstract + results depth,
   not full text; both are corroborating rather than load-bearing.
4. **Cursor's own benchmark numbers are vendor-reported** (CursorBench is internal, not reproducible
   externally). Marked as such in ledger #17.
5. **The 90% threshold is [single-source]** to one Cursor staff post, though the *band* is
   triple-verified. It is server-side and can change without a changelog entry.








