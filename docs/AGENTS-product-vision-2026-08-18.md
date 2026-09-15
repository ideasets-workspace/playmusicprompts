# AGENTS.md — Agentic-Ideasets-Hybrid-Execution-Model

## GOVERNING LAW — RANK-0, MANDATORY BEFORE EVERY ACTION

The single authoritative law for every main agent, sub-agent, background agent, autonomous lane, reviewer, verifier and automation is:

`.cursor/rules/berk-rank0.mdc`

Cursor loads this law automatically with `alwaysApply: true`. Any runtime that does not automatically load Cursor rules must open and read the complete file before its first substantive action, after context compaction, after uncertain-state recovery, whenever the law hash changes and before any claim of done, complete, fixed or verified.

Never proceed from model memory, a summary, a cached interpretation, another agent’s relay or previous-session recollection. Never duplicate, paraphrase, summarize, shorten or weaken the law.

## MEMORY RECOVERY ORDER

Before substantive execution:

1. Read `memory/PROJECT.md`.
2. Read `memory/STATE.md`.
3. Read `memory/REQUIREMENTS.md`.
4. Read `memory/LANES.md`.
5. Resolve the exact project and lane.
6. Read `memory/lanes/<LANE_ID>/CURRENT.json`.
7. Follow `current_ledger_path`.
8. Read the complete current dated task ledger.
9. Recover every non-terminal task and the exact next action.
10. Verify the next action against current code, runtime, database and filesystem truth.

## EXECUTION AND CLOSURE

Before material work, atomize Berk’s complete request into explicit tasks in the current lane ledger. Every task must define its objective, scope, dependencies, current state, exact next action and expected completion evidence.

Execute only the next valid task. Verify one hundred percent of its scope before closing it. A task cannot close unless it is error-free, complete, connected to the real system, free of orphaned or unwired components, supported by scope-matching evidence and reviewed against the world’s most advanced standards.

A parent task cannot close until every required child task is verified and closed. Newly discovered work must immediately enter the ledger. No task may disappear, be skipped or be batch-closed from memory.

After compaction, never continue from a summary. Reload the law, project memory, lane memory and authoritative task ledger from disk.

Before claiming done, reconcile every task and claim against Berk’s original request. Name every unverified, blocked or unresolved item.

---

# PlayMusicPrompts — the prompt-to-music intelligence engine (PlayMusicPrompts.com)

<PRODUCT-PURPOSE-AND-VISION rank="0" origin="Berk, 2026-08-18" language="en">

## ⛔ WHAT THIS PROJECT IS — READ BEFORE DECIDING WHAT "DONE" MEANS

**On 2026-08-18 Berk PRODUCTISED the music platform out of `C:\Berk\SsmContentAssetCreator` into this
repository.** His words, verbatim, reproduced character for character: *"şimdi büyk gün süper iş çıkarttın
artık seni ürünleştiriyorum ve bu projeden çıkarıyorum :) C:\Berk\PlayMusicPrompts daki tüm detaylara bak ve
domainin PlayMusicPrompts.com şimdi taşınacağın yerdeki tüm bilgileri eksizsiz incele ve tüm herşeyi senile
ilgili tüm bilgileir tüm kodları araştırmaları bu music bölümü için tüm memeory state vs. leri eksizsiz yeni
yuvanda oluştur."*

**THE DOMAIN IS `PlayMusicPrompts.com`.** His stated aim, verbatim from the founding conversation
(`Brainstorming/ChatGPT-MusicHybridModel/conversation.md`): *"amacım insanların promptlarla müzik
üretebiliecğei en ileri sveiyed edünyadaki en ileri seviyede music üreten ai modeli."* — the world's most
advanced prompt-to-music AI. The brand line chosen there: **"Say what you want to hear. From a thought to a
finished song."**

**THE PRODUCT DIRECTION, decided in that conversation and binding until Berk supersedes it:**
- Not a generator with sliders — an **AI-native Music Creation OS**. The persistent object is the
  **Music Intent Graph / Living Score**, never the prompt and never the MP3.
- Three experience levels: **Spark** (one question: "What should exist?"), **Direct** (AI Producer +
  Living Score + contextual inspector + Audition Deck + version graph), **Deep** (the existing
  34-parameter Music Studio as the professional inspector — it is PRESERVED, not discarded), plus
  **Perform** (live musical partner) later.
- The signature mechanics: **Conservation Locks** (hard/soft, refused rather than silently broken) ·
  **Audition Matrix** (cluster candidates, never dump files) · **Control↔Surprise dial** (per-axis
  variation budgets) · **Reversible AI Producer** (applyable diffs, no black-box "make it better") ·
  **Musical Causal Contract** · **NoRender Preflight** (the smartest generation is sometimes none) ·
  three identities (**Composition / Performance / Production**) · true multitrack over stem separation
  (per-stem `origin`) · causal **Failure Trace** · **Human Contribution Passport** (C2PA/DDEX) ·
  user-owned **Taste Constitution** · **Culture Engine** (Turkish makam/usul first) · open **`.pmp`**
  project protocol — the user can leave and lose nothing.
- North-star metric: **Idea-to-Owned-Release**. Generation count is explicitly NOT a success metric.
- The 49-screen web UX/UI package and the frontier research ZIP live under
  `Brainstorming/ChatGPT-MusicHybridModel/sandbox-downloads/` with measured hashes in the INDEX.

**WHAT ALREADY WORKS, measured in the source project and carried here whole:** the hybrid conductor
endpoint (`generate_music_hybrid_model/`) is LIVE as AWS Lambda `ssm-content-worker-generate-music-hybrid-model`
(eu-central-1) delegating to `ssm-content-worker-music-lyria` → Vertex AI Lyria; 35 parameters, 3,561
selectable values, honest binding classes (`typed/prose/enforced/compiled/refused/response_field/client_side`),
16/16 control suites green, live route proven 51/51 over the wire. The founding conversation names this
honest-binding architecture as the moat's substrate — it is preserved as the **Deep Inspector** layer.

</PRODUCT-PURPOSE-AND-VISION>

## Layout (identical relative layout to the source repository, BY DESIGN)

The 121 migrated scripts derive paths from the repository root (`Path(__file__).resolve().parents[1]`);
keeping the same relative layout is what keeps every one of them runnable without a rewrite:

```
generate_music_hybrid_model/   # the engine + Lambda endpoint (music_studio package inside)
scripts/                       # control suites, builders, fetchers, E2E runners, migration tools
artifacts/                     # song-rnd takes + ledger · music-studio measurements · deploy lineages
artifacts/calibration-corpus/  # vocadito + LM-SSD (CC BY 4.0, MD5-verified), 12.78 GB
docs/research/                 # the whole research tree with _sources archive and _runs manifests
docs/BerkSummary/              # his 1,332 messages (all sessions) + the 62-requirement register
config/music-studio-instance.json  # the GCP instance target as DATA with provenance
Brainstorming/                 # the founding vision conversation, UI packages, assets
migration-manifest.json        # what was carried, with counts and byte-level verification verdicts
```

## Deployment targets (inherited — verify against `.claude/memory/infra.md` before any deploy)

- **AWS:** account `723322847393` (beforetomorrow_production), region `eu-central-1`; endpoint Lambda
  `ssm-content-worker-generate-music-hybrid-model` (Timeout 900 s, 1024 MB); delegate
  `ssm-content-worker-music-lyria`; STT delegate `ssm-content-worker-stt-vertex`.
- **GCP:** project `contentanalyticsplatform`; Workbench instance `music-studio` (us-central1-a,
  n1-standard-8 + T4, ~$0.90/h RUNNING, ~$0.02/h STOPPED — list prices, no invoice ever read).
- **Spend law:** every generation call goes through a `SpendLedger` first; the R&D ledger lives at
  `artifacts/song-rnd/spend_ledger.json` (measured 2026-08-18: $48.02 remaining, 2 calls).

## Critical rules (carried from the source project's law, still binding here)

- Every artefact in ENGLISH; chat with Berk in Turkish. His dictated wording verbatim, never corrected.
- File checks against the FILE SYSTEM, never git (`scripts/verify-fs-identity.cjs` is in `scripts/`).
- No unsourced value: every parameter carries a research path or a named measurement (the engine's
  `research_application_ledger.json` and per-file `provenance` fields are the mechanism).
- A printed schema is never capability evidence — only a completed generation is.
- No new paid vendor without Berk's explicit approval; Google/AWS/Anthropic pre-approved.
- Honest bindings: no control may be accepted and silently ignored; `reported_not_compiled` is stated.
- Memory tier: `.claude/memory/STATE.md` (volatile), `DECISIONS.md` (append-only), `MEMORY.md`
  (durable lessons), `infra.md` (append-only infra facts). Update STATE.md at every milestone.
