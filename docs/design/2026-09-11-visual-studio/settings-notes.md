# Visual Studio settings asset

Assigned child of STUDIO-02, three-player-20260911. Only the settings asset, its check script and this note were written. Parent owns website integration, project ledgers, UI and actual rendered verification.

## Contract delivered

- `VISUAL_SCHEMA`: 29 frozen definitions, with English label, finite bounds, step, exact default, group and scene IDs from the shared brief. Seven look controls, eight motion controls, and 14 scene controls.
- `VISUAL_DEFAULTS`: exact brief values, including exposure 1.05, bloom radius .65, orbit speed .26 and Record fog .057.
- `VISUAL_PRESETS`: five complete frozen looks: Original, Night Drive, Dreamstate, High Voltage and Deep Space. Original equals the defaults exactly. Alternatives use bounded shared and scene-specific settings. Built-ins never include scene selection, atmosphere, audio level or Motion enable state.
- `sanitizeVisualSettings(value)`: returns a fresh complete settings object. Only own finite numeric data properties are accepted. Numeric strings, booleans, null and nonfinite numbers use defaults; finite values clamp to bounds. Unknown keys and inherited/accessor properties are ignored. Sanitizing does not quantize away accepted defaults.
- `VISUAL_STORAGE_KEY`: `pmp.room.visual-studio.v1`.
- `createVisualStore(adapter)`: the adapter uses `get(key, fallback)` and `set(key, value) -> boolean`. Initialization and `read()` never write. Stored shape is `{version:1, settings, presets}`; public state is `{settings, presets}`. Every mutation reads latest stored state before making its scoped change. Returned state is detached from stored objects.

## Mutation and persistence semantics

Every mutation returns `{ok, state, error?, id?}`. Only an adapter result of literal `true` yields `ok:true`. If persistence throws or returns another value, the result carries the requested candidate state with `ok:false` and an English temporary-changes message. `read()` still returns actual persisted state; the module does not cache failed writes or invent successful persistence. The parent should retain and label its current live preview on a save failure and merge subsequent unsaved changes in the UI as needed.

If the latest storage read throws, writes are refused because an unrelated stored setting or custom look could otherwise be overwritten. The requested transient candidate is still returned. Invalid requests return unchanged current state and do not write. Reads recover defaults and bounded valid custom entries from corrupt data without modifying that data.

- `patch(key,value)` changes exactly one known finite numeric key, retaining other settings and custom looks from the latest read.
- `replace(settings)` deliberately replaces the full current look; a partial valid input fills missing settings with defaults. Custom looks are preserved. Reset should call `replace(VISUAL_DEFAULTS)`.
- `savePreset(name,settings)` creates a custom look or updates an existing normalized name case-insensitively. Existing name updates retain its ID. Current live settings are unchanged. Names are trimmed, internal whitespace is collapsed, control characters are rejected, and length is 1–48 characters. There are at most 20 custom looks; updating an existing look remains possible at the limit.
- `deletePreset(id)` deletes only an existing safe custom ID and retains latest settings/other looks.
- `importPresets(payload)` accepts JSON text or the equivalent plain object. The exact envelope is `{format:'pmp-visual-looks',version:1,presets:[...]}`. Text is capped at 128 KiB. At most 20 input looks are accepted, including an empty export. Names and settings must validate; unknown settings, nonfinite/non-numeric values, unsafe IDs, unknown envelope/entry fields and prototype keys are rejected. Partial settings are completed with defaults and finite out-of-range values are clamped. Import upserts matching names and retains their target IDs. New IDs are kept if safe and unique, otherwise generated. Repeated names inside one file are rejected. Overflow or any invalid entry rejects the entire import without writing a partial result. Import does not change current visual settings.
- `exportPresets()` returns a formatted JSON **string** containing saved custom looks only. Built-in looks and playback/session data are excluded. Empty and nonempty exports roundtrip. The parent can offer this string as a JSON download.

Per-call latest-state reads protect ordinary sequential stale-tab edits; the storage adapter has no multi-tab transaction or compare-and-swap primitive, so this module does not claim a stronger atomic concurrency guarantee. Preset imports are validated as one candidate before a single storage write.

## Verification

Run the scoped checks with the bundled Node runtime:

`node docs/design/2026-09-11-visual-studio/settings-check.mjs`

Pass the absolute path to the parent-integrated `player-three-visual-settings.js` as the first argument to check the installed asset instead. All 44 scoped checks passed on the child source. The script covers every contracted key's exact default/bounds, coercion rejection, legitimate zero, inherited/accessor safety, exact Original, distinct built-ins, side-effect-free reads, fresh snapshots, all-key stale-tab patches, preset preservation, replacement/reset, name updates, 20-look limit, atomic overflow, empty and nonempty roundtrip, malformed and unsafe import rejection, ID collision handling, latest-state deletion, corrupt storage, failed writes and unreadable storage.

These checks establish the settings/schema/storage contract only. They do not prove that a rendering control has been connected or that preset artwork looks good. Parent must verify actual per-setting mappings, scene renders, import/export UI, cross-tab events, reset, comparison and clear unsaved-state feedback in the integrated player.
