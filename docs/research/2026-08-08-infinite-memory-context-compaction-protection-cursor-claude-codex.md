# Standards ledger

Read THIS session before/during this run: `.claude/rules/research-standard.md` (engraved from Berk's 2026-08-08 dictation) · `.claude/rules/research-delegation-mandate.mdc` · `AGENTS.md` §RESEARCH FLOOR · `.claude/memory/BOOT.md` + `STATE.md` + `MEMORY.md` (L35 supreme decree) · the DEEP RESEARCH COVENANT R0–R18 (supplied verbatim by Berk in-prompt; canonical at `C:/Users/berke/.codex/skills/deep-research/SKILL.md`). Path resolution per R15.1: this is a general (non-film) topic in SsmContentAssetCreator → `docs/research/`. Preflight: `docs/research/_runs/2026-08-08-infinite-memory-context-compaction-protection-cursor-claude-codex.preflight.json`.

# Research: Infinite memory / context-compaction protection for ALL agents on this computer (Cursor + Claude Code + Codex)

Date: 2026-08-08 · Decision served: which architecture and which exact per-tool wiring give every agent on this machine memory that cannot be lost at context compaction ("SONSUZ MEMORY"), and install it computer-wide.
Sources: **22 authoritative / 6 academic / 5 academic [FULL] / 8 primary [FULL]** (floors: ≥20/≥5 — met; counts per R11.2 family dedup).
Owner's order (verbatim, provenance): *"ŞİMDİ TÜM İSTEDİKLERİMİ DÜNYADAKİ EN KARANLIK NOKTALAR DAHİL EN İLERİ SEVİYEDE ARAŞTIRIP ÖZELLİKLE CONTEXT COMPRESS DE SONSUZLUK SONSUZ MEMORY YAPISINI BU BİLGİSAYARDAKİ TÜM AGENTLAR İÇİN KURACAKSIN CURSOR CLAUDE VE CODEX İÇİN."*

# Outcome first

1. **"Infinite memory" is real and it is NOT a bigger context window — it is state externalized to disk plus addressable/programmatic recall.** The five 2026 academic primaries converge: InfiAgent's ablation (Table 2) shows file-centric state reaches **80.0/80 coverage** on an 80-paper task while the same models with compressed long-context prompts collapse to **3.2–27.7**; PRO-LONG's append-all lossless log + code search beats no-log by **+18.0pp** and hits **97.4% best@2** on ARC-AGI-3; ARC proves (Theorem 1) lossless compaction with a bounded active view is achievable and hits **99.40% vs 88.12%** needle recall.
2. **Installed and control-proven this session, computer-wide:** the portable context-recovery gate now lives at `~/.claude/hooks/context-recovery-gate.cjs` (28,888 B) with Codex support, wired at USER level in all three tools — `~/.cursor/hooks.json` (4 events), `~/.claude/settings.json` (4 events incl. `SessionStart` matcher `compact`), `~/.codex/hooks.json` (4 events incl. `SessionStart` matcher `compact`). Isolated 4-part control passed (no-false-alarm · codex-record-unacknowledged · alarm-with-required-sentence · clears-after-carried) plus 3-tool envelope controls; and the global gate **fired inside this live Cursor session** (its second banner block appeared in this turn's hook output — integration proof, not just script proof).
3. **A root-resolution defect was found by the control and fixed:** the portable gate preferred its own file location, so a global install resolved every project's root to `~` and wrote all memory into `~/.claude/memory/` (measured: three identical 3,754 B payloads; log written to the home tier). Fix: payload `cwd` now outranks file location, and the HOME directory is excluded as a root marker. Fix flowed back to `C:/Berk/Cursor_Hooks/hooks/` (hash-identical).
4. **Surviving-channel law files installed** (L34: rules/instructions survive compaction by construction, hook output does not): `~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md` now carry the L35 decree + compaction protocol + research law for every session on this machine. Cursor has **no file-based global rules** (3-source verified) — its global channel is the user-level hook, which is installed.

# Framing and falsifiers

Sub-questions: (a) which memory architecture is evidence-best; (b) exact current hook/memory schemas per tool at installed versions (Cursor 3.15.6, Claude Code 2.1.217, Codex Desktop w/ gpt-5.6-sol); (c) what each tool natively persists; (d) the global (user-level) wiring surface per tool. Falsifiers: a vendor doc showing user-level hooks unsupported; a control run showing the gate silent on any tool path; an architecture paper showing summarization beats lossless externalization on long horizons (none found — the opposite is measured three times).

# Inclusion, exclusion, geography, dates, languages, constraints

Included: 2025–2026 primaries; official vendor docs at current versions; first-party repos; lawful dark tier (changelogs, forum staff answers, repo READMEs/PRs, DeepWiki, live on-disk surfaces). Excluded: blogspam, unverifiable aggregators, paywalled content. GLOBAL geography; English+Turkish sources. Constraint: no paid dependency added — everything built on local Node + existing hooks (BUILD-over-buy honored).

# Methodology and exact query/action log

1. `WebSearch "AI coding agent infinite memory context compaction survival architecture 2026"` → ARC, InfiAgent, ACM, PRO-LONG, CAT (raw texts captured).
2. `WebSearch "LLM agent memory system MemGPT Letta mem0 persistent memory across context window compression 2026"` → Letta repo/docs, framework comparison, hierarchy analyses.
3. `WebSearch "OpenAI Codex memories feature 2026..."` → official memories doc, codex-rs/memories READMEs, PR #11364, DeepWiki.
4. `WebSearch "Cursor IDE memories feature user-level hooks.json global 2026 documentation"` → cursor.com/docs/hooks.md [captured FULL], third-party-hooks reference, community references.
5. `WebSearch "Claude Code 2026 auto memory MEMORY.md user settings.json hooks scope"` → memory/settings/claude-directory/hooks-guide official docs [captured].
6. `WebSearch "Cursor user rules global ~/.cursor/rules directory file based 2026"` → official rules.md + forum staff answer + voxmedia doc (three independent: file-based global rules NOT supported).
7. Codex manual fetched via the tool's own bundled `fetch-codex-manual.mjs` (THE DARK — an on-disk primary channel); Hooks §21390–22324 and Skills sections read [FULL].
8. Local primaries: `~/.codex/*` live surface enumerated; `Continuity.cs` read; both gate sources read; global tier absence measured (`Test-Path` ×5 = False before install).
9. Build + controls: 3 global configs + 2 instruction files written; gate patched (Codex discriminator, root fix); 6 control invocations run; project harness re-run.

# Source register and read-status counts

| # | Source (family) | Class | Date | Status | Capture |
|---|---|---|---|---|---|
| 1 | ARC — Addressable Recall Compaction, arXiv 2607.25066 | academic | 2026-07 | [FULL] | `_sources/2026-08-08-arc-…txt` (104,303 B) |
| 2 | ACM — Agentic Context Management, CMU/Meta, arXiv 2607.23809 | academic | 2026-07 | [FULL] | `_sources/…acm…txt` (63,212 B) |
| 3 | InfiAgent, ACL 2026 Findings pp.35884–94 | academic | 2026-07 | [FULL] | `_sources/…infiagent…txt` (44,742 B) |
| 4 | CAT — Context as a Tool, ACL 2026 Findings pp.20604–17 | academic | 2026-07 | [FULL] | `_sources/…cat…txt` (60,276 B) |
| 5 | PRO-LONG, Duke, arXiv 2607.20064 | academic | 2026-07 | [FULL] | `_sources/…prolong…txt` (45,7xx B) |
| 6 | MemGPT, arXiv 2310.08560 (foundational lineage, R6.1) | academic | 2023-10 | [PARTIAL] (abs page) | `_sources/…memgpt…abs.txt` |
| 7 | OpenAI Codex manual (learn.chatgpt.com; Hooks + Skills + memories doc) | official | 2026-08 cache | [FULL] (cited sections) | temp cache + notes |
| 8 | openai/codex repo (codex-rs/memories READMEs + PR #11364) | first-party code | 2026 | [PARTIAL] | search captures |
| 9 | DeepWiki openai/codex memories system | third-party technical | 2026 | [PARTIAL] | `_sources/…codex-memories-deepwiki.txt` |
| 10 | Cursor official docs (hooks.md; rules.md; help/customization) | official | 2026 | hooks.md [FULL capture]; rules [PARTIAL] | `_sources/…cursor-hooks-md-official.txt` (54,495 B) |
| 11 | Cursor forum staff thread 144739 (global .mdc unsupported) | community/staff | 2026 | [PARTIAL] | quoted in report |
| 12 | Cursor forum thread 157335 (global rules in Agents Window) | community | 2026 | [PARTIAL] | quoted |
| 13 | voxmedia/open-agent-toolkit cursor-rules-files.md | third-party technical | 2026 | [PARTIAL] | agent-tools capture |
| 14 | Anthropic Claude Code docs (memory; settings; claude-directory; hooks-guide) | official | 2026 | [PARTIAL captures, 4 files] | 4 files in `_sources/` |
| 15 | Letta (MemGPT) repo + docs (context hierarchy) | first-party code/docs | 2026 | [PARTIAL] | search captures |
| 16 | Production memory frameworks comparison (Letta/mem0/Zep/Graphiti) | technical analysis | 2026 | [PARTIAL] | search captures |
| 17 | SurePrompts Letta walkthrough | technical analysis | 2026 | [PARTIAL] | search capture |
| 18 | Continuity.cs + README (AllInsights runtime) | local primary | 2026-08-08 | [FULL] (relevant sections + README full) | on disk |
| 19 | context-recovery-gate.cjs (project + portable) | local primary | 2026-08-08 | [FULL] | on disk |
| 20 | Cursor_Hooks package (docs 01–06 + evidence; 21-source ledger) | local primary (prior verified research) | 2026-08-08 | 01 [FULL] | on disk |
| 21 | Round-1 docs (Cursor 26/8 + Claude 28/9 sources) | local primary (this project) | 2026-08-08 | [PARTIAL this run; verified 2× primary claims earlier today] | on disk |
| 22 | Live machine surfaces (~/.codex config/rules/skills; global-tier absence; hook log injection this turn) | local primary | 2026-08-08 | [FULL] | measured |

# Findings — five-part academic records ([FULL] floor sources)

**1. ARC (arXiv 2607.25066).** Problem (authors): all four mainstream compaction paradigms (truncation, summarization, state folding, RAG) are fundamentally lossy; a discarded needle must be re-derived or hallucinated. Method: append-only content-addressed ObsStore (`id = enc_b(j) ∥ fp_d(signature(A) ∥ 0x1F ∥ O)`), citations `§id` with head/tail previews replace long observations; `_recall §id` re-injects verbatim; deterministic non-LLM compaction; Theorem 1: bounded active view `K ≤ L` with exact address-conditioned recovery in `⌈|O|/q⌉` chunks; linear external growth is a proven lower bound for exact recovery. Numbers: NIH 99.00%/99.80% (Qwen3-8B/32B) vs best baseline RAG 79.57%/96.67%; LongBench-v2-Hard 27.47%/32.47% vs 25.83%/30.67%; HBM −38.8%/−73.5%; McNemar p≪0.001 everywhere. Limitations (authors): guarantee is conditional on the model requesting a valid address; Qwen3-only; citation stub overhead. Application here: our design keeps the lossless store OUTSIDE the window (transcripts + `.claude/memory` + compaction-events.json) and injects only a bounded banner — ARC is the proof this shape is optimal, and its "mechanism ≠ agent behavior" caveat is why the banner FORCES the read (declaration + SELF-TEST) instead of trusting recall.

**2. ACM (arXiv 2607.23809, CMU/Meta).** Problem: compression triggered by rigid external heuristics is misaligned with reasoning focus and lossy. Method: two tools (`manage_context` summarize+offload to disk with ID; `query_memory` retrieve by ID); teacher–student dual-constraint on-policy distillation (top-K=20 soft labels) teaching WHEN to compress and when not. Numbers: Qwen3.5-9B 0.727 vs ReAct 0.570 on BrowseComp-Plus (+27% rel.), peak tokens −~20% (59k→54k), GPT-5.5 under ACM makes near-zero context-management calls untrained. Limitations: needs a strong base model; baselines re-implemented. Application: agent-initiated management cannot be assumed — even frontier models don't self-manage; hence our management is HOOK-initiated (deterministic, every turn), not left to the agent.

**3. InfiAgent (ACL 2026).** Problem: prompt-as-state entangles long-term state with reasoning; truncation/summarization/RAG lose fidelity. Method: file-centric persistent state `S_t = F_t`; bounded context `c_t = g(F_t, a_{t−k:t−1})`, |c| = O(1); fixed 4-part thinking record (todo, file descriptions, pinned state, next steps) rewritten periodically; checkpoint resume. Numbers: **Table 2 — coverage 80/80 avg 80.0 (Gemini-3-Flash & Claude-4.5-Sonnet with file state) vs ablation without file state 21.1/27.7; GPT-OSS-20B 67.1 vs 3.2; Cursor baseline 1.0/0.1**; DeepResearch Bench 41.45 with a 20B model. Limitations: serial execution; hallucinations can persist into state. Application: our BOOT.md/STATE.md/MEMORY.md + context_boot.py IS this architecture (fixed-schema record reconstructed from disk each turn); the ablation is the strongest quantitative proof that the disk tier, not the window, is the memory.

**4. CAT (ACL 2026).** Problem: append-only ReAct explodes; passive threshold compression is inflexible. Method: 3-segment workspace (fixed anchor Q · long-term memory M(t) · last-k working memory); condenser as a first-class tool; CAT-GENERATOR offline injection; SFT (Qwen2.5-Coder-32B). Numbers: SWE-Bench Verified 57.6% vs ReAct 49.8/threshold 53.8; ReAct saturates & degrades after ~60 rounds while CAT still climbs at 500; stable ~35k tokens; avg compression 15,585→4,676 tokens (30%). Limitations: heuristic condenser supervision; no verification of summary hallucinations. Application: validates our fixed-anchor design — laws in the surviving channel (AGENTS.md/rules = Q), live state re-read from disk; and its no-verification caveat is why our banner carries only disk-read numbers.

**5. PRO-LONG (arXiv 2607.20064, Duke).** Problem: fidelity–tractability tradeoff — saving less makes retrieval easy but destroys hindsight-relevant detail. Method: write = append EVERYTHING to `logs.txt`; read = programmatic search (grep/python); ~30-line prompt, no subagents. Numbers: +18.0pp avg over no-log; 97.4% best@2 (Fable 5, $1,750); tool ladder 23.1→27.2 (+grep)→38.3 (+python)→41.2 (+write); workspace wipe costs no-log −4.1pp but PRO-LONG only −0.5. Limitations: high run variance; coding-agent-only mechanism. Application: coding agents (all three of ours) already have the lossless log — the transcript on disk — and grep/python native; the gate's `transcript_path` + our fs-verification law operationalize exactly this read path.

**Foundational lineage (R6.1):** MemGPT (2310.08560) [PARTIAL] — OS-paging framing (context=RAM, disk=storage, function calls=page faults) is the ancestor of all five; Letta's live 3-tier implementation (memory blocks <50k chars in-context · files · archival unlimited) confirms the productized shape.

# Companies / APIs / repositories — the per-tool contract (verified this session)

**Codex** [FULL, official manual + live surface]: events PascalCase (`SessionStart[startup|resume|clear|compact]`, `UserPromptSubmit`, `PreCompact|PostCompact[manual|auto]`, `PreToolUse`, `PostToolUse`, `PermissionRequest`, `Stop`, `SubagentStart/Stop`, `SessionEnd`); config `~/.codex/hooks.json` AND project `.codex/hooks.json` (trust hash-bound via `/hooks`; `--dangerously-bypass-hook-trust` exists); envelope IDENTICAL to Claude (`hookSpecificOutput.additionalContext`); post-compaction `SessionStart(compact)` context reaches the model **even mid-turn**; timeouts in SECONDS (default 600); >~2,500-token outputs SPILL unless `additionalContextLimit` set (0 = full); every payload carries `model` (the tool discriminator we use); repo skills at `.agents/skills`; native memories pipeline (Phase-1 extraction + Phase-2 global consolidation into `~/.codex/memories/raw_memories.md` + `rollout_summaries/`, usage-ranked, 30-day window, secret-redacting) — complements but does NOT replace project state (global root, asynchronous, selective).
**Cursor** [FULL capture + 3-source]: user-level `~/.cursor/hooks.json` applies to ALL projects (commands run from `~/.cursor`); merge order Enterprise→Team→Project→User, all matching hooks run; `postToolUse.additional_context` reaches the model only at 3.9.8+ (installed 3.15.6); `beforeSubmitPrompt` cannot inject; `preCompact` observational with the loss numbers; **NO file-based global rules** (official rules.md: "A plain .md in .cursor/rules is ignored"; staff: `~/.cursor/rules` unsupported; voxmedia doc concurs) — User Rules are UI/cloud-only, so the global file channel = the user hook.
**Claude Code** [official docs, 4 captures]: `~/.claude/settings.json` = user scope for hooks; `~/.claude/CLAUDE.md` = instructions for ALL projects, loaded every session; auto memory ON by default (MEMORY.md first 200 lines/25KB at session start; per-project under `~/.claude/projects/*/memory/`); `SessionStart(compact)` remains the only post-compaction injection path (Round-1 finding re-confirmed).

# Hidden and contrary evidence

Dark tier used: Codex's own bundled manual fetcher (an on-disk primary channel nobody browses); openai/codex PR #11364 (mem v2 migration — single global memory root, 64-job cap, 12h idle rule); forum staff answers; live `[hooks.state]` trust entry in config.toml proving the hash-bound trust mechanism. Contrary evidence honestly kept: ARC notes implicit retrieval WINS on dialogue-history tasks (explicit+implicit are complementary); ACM shows untrained frontier models DON'T use memory tools (management must be forced — ours is); PRO-LONG shows self-authored notes matter little (−2.9pt) — the LOG is what matters.

# Claim cross-verification and independence ledger

| # | Load-bearing claim | Sources (independent) | Status |
|---|---|---|---|
| C1 | Lossless externalization ≫ summarization/window for long horizons | ARC Thm1+NIH · InfiAgent Table 2 ablation · PRO-LONG tool ladder (+CAT trend) | **3+ verified** |
| C2 | Codex hooks: events/envelope/trust/spilling as stated | Official manual [FULL] · live `[hooks.state]` in config.toml · repo schema pointer (codex-rs/hooks/schema) | **3 verified** (manual is single normative authority for schema details → [single-source official] on field names) |
| C3 | Cursor user-level `~/.cursor/hooks.json` is global | cursor.com/docs/hooks.md · third-party-hooks reference · voxmedia doc | **3 verified** |
| C4 | Cursor has NO file-based global rules | rules.md official · forum staff (144739) · voxmedia | **3 verified** |
| C5 | `~/.claude/CLAUDE.md` + `~/.claude/settings.json` are user-global | memory doc · settings doc · claude-directory doc (one producer family) | **[single-source official]** — corroborated behaviorally by this session's live injection |
| C6 | Codex native memories = 2-phase global pipeline | official memories doc · codex-rs READMEs · PR #11364 · DeepWiki | **3+ verified** |
| C7 | Global gate fires on all 3 tool paths and isolates per-project memory | isolated 4-part control · 3-envelope control · live in-session injection (this turn's hook output) | **3 controls, measured** |
| C8 | Cursor postToolUse injection needs 3.9.8+ | Cursor staff statement (Round-1/pkg docs) | **[single-source]** — installed 3.15.6 makes it moot |

# Contradictions, corrections, uncertainty, and gaps

- My own instrument errors this run, corrected: quoting bug measured a section as 9,712 B (real: 6,398); cp1252 harness crash; a false-positive Codex-trust detector (13th); the portable gate's root bug (found by control, fixed, flowed back).
- [UNVERIFIED]: Codex hooks have not yet fired in a REAL Codex session (trust must be granted by Berk via `/hooks` — I cannot); Cursor `postToolUse`/`sessionStart` global-hook injection is proven for `beforeSubmitPrompt` live (this turn) and by schema-shaped control for the others; AllInsights `continuity.exe --host codex` live run was approval-blocked (envelope compatibility verified from BOTH primaries' source/docs instead).
- Gap: Codex `SessionEnd`≤3s cannot host heavy work; Cursor cannot re-inject post-compaction natively (no postCompact) — mitigated by per-turn `postToolUse` injection + `preCompact` on-screen alarm.

# Synthesis — adopt / build / avoid

**ADOPT:** disk-tier state (BOOT/STATE/MEMORY + transcripts) as the ONLY memory of record (InfiAgent/PRO-LONG/ARC evidence); tool-native surfaces as supplements (Codex memories, Claude auto memory). **BUILD (built):** one portable root-resolving gate, three global wirings, two surviving-channel law files, harness controls. **AVOID:** summarization as memory (lossy — all five papers), window-size faith (InfiAgent ablation; ARC full-context 0%), agent-initiated-only management (ACM: even GPT-5.5 won't), file-location root resolution in global hooks (measured failure).

# Committed recommendation

Keep exactly this two-layer design everywhere: **(1) surviving channel** (project AGENTS.md/rules + `~/.claude/CLAUDE.md` + `~/.codex/AGENTS.md`) carries the laws; **(2) per-turn disk-fresh injection + compaction record/alarm** via the single portable gate at user level, with project-level gates where a project has its own (project overrides nothing — both fire; Cursor merges all layers). One remaining human step: Berk runs `/hooks` once in Codex (global + SsmContentAssetCreator + AllinsightsAi) — hash-bound trust cannot be granted by an agent.

# Application/change ledger (all verified this session)

| Change | Path | Proof |
|---|---|---|
| Global gate installed + Codex support + root fix | `C:/Users/berke/.claude/hooks/context-recovery-gate.cjs` (28,888 B) | 4-part isolated control PASS; live in-session firing |
| Cursor global wiring | `C:/Users/berke/.cursor/hooks.json` | sessionStart/beforeSubmitPrompt/preCompact/postToolUse; fired live this turn |
| Claude Code global wiring | `C:/Users/berke/.claude/settings.json` | 4 events incl. SessionStart(compact) |
| Codex global wiring | `C:/Users/berke/.codex/hooks.json` | 4 events; trust pending Berk |
| Global instruction files (L35 decree) | `C:/Users/berke/.claude/CLAUDE.md` · `C:/Users/berke/.codex/AGENTS.md` | on disk, English |
| Portable package updated | `C:/Berk/Cursor_Hooks/hooks/context-recovery-gate.cjs` | hash-identical to global |
| Project Codex layer (earlier today) | `.codex/hooks.json` + `.agents/skills/*` (4) | harness 42/42 incl. Codex controls |
| AllinsightsAi Codex layer (earlier today) | `C:/Berk/AllinsightsAi/.codex/hooks.json` + `.agents/skills/*` (4) + AGENTS.md §6 + research standard | on disk; STATE §0 records it |

# Living-update watchlist

Watch: Cursor changelog (postCompact/context-injection additions; file-based global rules feature request), Claude Code hooks.md + memory doc, Codex manual Hooks/Memories sections + codex-rs/hooks/schema/generated, ARC/ACM/PRO-LONG follow-ups. Invalidators: any tool adding native post-compaction full-state restore; Cursor shipping global file rules (then move law text there per L34).

# Artifact index and produced-vs-planned count

Planned 4 / produced 4: this report · preflight JSON · completion manifest (`_runs/…json`) · index entry in `docs/README.md`. Plus 19 source captures under `docs/research/_sources/` (inventory in the manifest).

# Completion audit

Floors met (22/6/5/8); C1–C8 ledger above; [UNVERIFIED] items named; instrument errors disclosed; application verified per row. NOT claimed: Codex live-fire (trust pending), AllInsights codex live-fire (approval-blocked control).

