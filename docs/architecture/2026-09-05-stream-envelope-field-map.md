# Stream envelope field map — every returned field, its component, its designed form

Generated 2026-09-05T18:58:35.859Z by `scripts/verify-tools/stream-field-map.cjs` (re-run it; it fails on any unmapped leaf).

**Law:** owner-profile 8 / quality-bar — every field the API returns appears in the interface; D-PMP-07 — designed, never raw JSON, never hidden. A row whose form is "not shown" is not permitted and the generator has no such value.

**Sources read in full this session:** the live delivered envelope `docs/api/_captures/2026-09-05-job-cmtomxb7x-envelope.json` (produced by the real service, request 596d7989…), `docs/api/06-response-envelope.md`, `docs/api/05-lyrics-and-singing.md` L204–L247. Fields present in the capture but absent from 06 (tempo, time signature, analysis_outputs, source_take, service, seed, rights, compliance, tradition_notices, export stage, duration_regeneration, arrangement_ai shape) are typed from the capture and labelled `live capture`; the API document is behind its own revision (music-api-00054-fpc).

**Counts (machine):** captured leaves 190 · sung-only leaves 43 · total 233 · mapped 233 · unmapped 0.

## Components and their leaf counts

| Component | Leaves | Where on the centre stop |
|---|---|---|
| SoundMeasurements | 19 | 'Sound' section — format, loudness meter, duration |
| QuotaAndSpend | 6 | footer of the stop — account quota and spend note |
| ArrangementSuggestions | 18 | 'The composer suggests' — unapplied suggestions with structure previews |
| SourceEcho | 7 | directly under the title — what the composer was told (K1/K2: interpretation exposed) |
| LyricsPanel | 45 | 'Words' — lyrics, what was sung, gate verdict; or the honest instrumental line |
| ProvenancePanel | 31 | 'Provenance' — who made this and how it is marked (Art. 50 / IPTC) |
| PulseReadout | 17 | beside the GPU visual — the measured pulse the visual locks to |
| CompositionPlan | 15 | 'Composition' — layers, refusals, plan header |
| MasteringChain | 43 | 'How it was finished' — conform → master → export → stems strip |
| TakeFiles | 32 | 'Files' — delivered mastered file and raw engine take |

## Every leaf

| Leaf | Component | Designed form | Source |
|---|---|---|---|
| `analysis_outputs.intelligibility` | SoundMeasurements | loudness meter (integrated LUFS vs −14 target, true peak dBTP, loudness range LU); intelligibility row; measured_by/codec/channels/sample-rate rows; null_means shown verbatim next to any null | live capture |
| `analysis_outputs.measured_by` | SoundMeasurements | loudness meter (integrated LUFS vs −14 target, true peak dBTP, loudness range LU); intelligibility row; measured_by/codec/channels/sample-rate rows; null_means shown verbatim next to any null | live capture |
| `analysis_outputs.measured_channels` | SoundMeasurements | loudness meter (integrated LUFS vs −14 target, true peak dBTP, loudness range LU); intelligibility row; measured_by/codec/channels/sample-rate rows; null_means shown verbatim next to any null | live capture |
| `analysis_outputs.measured_codec` | SoundMeasurements | loudness meter (integrated LUFS vs −14 target, true peak dBTP, loudness range LU); intelligibility row; measured_by/codec/channels/sample-rate rows; null_means shown verbatim next to any null | live capture |
| `analysis_outputs.measured_duration_seconds` | SoundMeasurements | loudness meter (integrated LUFS vs −14 target, true peak dBTP, loudness range LU); intelligibility row; measured_by/codec/channels/sample-rate rows; null_means shown verbatim next to any null | live capture |
| `analysis_outputs.measured_loudness_lufs` | SoundMeasurements | loudness meter (integrated LUFS vs −14 target, true peak dBTP, loudness range LU); intelligibility row; measured_by/codec/channels/sample-rate rows; null_means shown verbatim next to any null | live capture |
| `analysis_outputs.measured_loudness_range_lu` | SoundMeasurements | loudness meter (integrated LUFS vs −14 target, true peak dBTP, loudness range LU); intelligibility row; measured_by/codec/channels/sample-rate rows; null_means shown verbatim next to any null | live capture |
| `analysis_outputs.measured_sample_rate` | SoundMeasurements | loudness meter (integrated LUFS vs −14 target, true peak dBTP, loudness range LU); intelligibility row; measured_by/codec/channels/sample-rate rows; null_means shown verbatim next to any null | live capture |
| `analysis_outputs.measured_true_peak_dbtp` | SoundMeasurements | loudness meter (integrated LUFS vs −14 target, true peak dBTP, loudness range LU); intelligibility row; measured_by/codec/channels/sample-rate rows; null_means shown verbatim next to any null | live capture |
| `analysis_outputs.null_means` | SoundMeasurements | loudness meter (integrated LUFS vs −14 target, true peak dBTP, loudness range LU); intelligibility row; measured_by/codec/channels/sample-rate rows; null_means shown verbatim next to any null | live capture |
| `auth.account_id` | QuotaAndSpend | account and key id rows | live capture |
| `auth.key_id` | QuotaAndSpend | account and key id rows | live capture |
| `auth.limit.daily_quota` | QuotaAndSpend | quota gauge: used_today / daily_quota, rate_per_min | live capture |
| `auth.limit.rate_per_min` | QuotaAndSpend | quota gauge: used_today / daily_quota, rate_per_min | live capture |
| `auth.limit.used_today` | QuotaAndSpend | quota gauge: used_today / daily_quota, rate_per_min | live capture |
| `bindings.arrangement_ai.applied_to_this_delivery` | ArrangementSuggestions | header: state badge (SUGGESTED/APPLIED/…), model, binding class, applied_to_this_delivery, rejected, reason, note | live capture |
| `bindings.arrangement_ai.binding` | ArrangementSuggestions | header: state badge (SUGGESTED/APPLIED/…), model, binding class, applied_to_this_delivery, rejected, reason, note | live capture |
| `bindings.arrangement_ai.model` | ArrangementSuggestions | header: state badge (SUGGESTED/APPLIED/…), model, binding class, applied_to_this_delivery, rejected, reason, note | live capture |
| `bindings.arrangement_ai.note` | ArrangementSuggestions | header: state badge (SUGGESTED/APPLIED/…), model, binding class, applied_to_this_delivery, rejected, reason, note | live capture |
| `bindings.arrangement_ai.reason` | ArrangementSuggestions | header: state badge (SUGGESTED/APPLIED/…), model, binding class, applied_to_this_delivery, rejected, reason, note | live capture |
| `bindings.arrangement_ai.rejected[]` | ArrangementSuggestions | header: state badge (SUGGESTED/APPLIED/…), model, binding class, applied_to_this_delivery, rejected, reason, note | live capture |
| `bindings.arrangement_ai.state` | ArrangementSuggestions | header: state badge (SUGGESTED/APPLIED/…), model, binding class, applied_to_this_delivery, rejected, reason, note | live capture |
| `bindings.arrangement_ai.suggestions[].apply` | ArrangementSuggestions | suggestion card: title, category, rationale, apply flag, diff_format | live capture |
| `bindings.arrangement_ai.suggestions[].category` | ArrangementSuggestions | suggestion card: title, category, rationale, apply flag, diff_format | live capture |
| `bindings.arrangement_ai.suggestions[].diff_format` | ArrangementSuggestions | suggestion card: title, category, rationale, apply flag, diff_format | live capture |
| `bindings.arrangement_ai.suggestions[].patch[].op` | ArrangementSuggestions | patch op row: op, path, value rendered as section/bars pairs | live capture |
| `bindings.arrangement_ai.suggestions[].patch[].path` | ArrangementSuggestions | patch op row: op, path, value rendered as section/bars pairs | live capture |
| `bindings.arrangement_ai.suggestions[].patch[].value[].bars` | ArrangementSuggestions | patch op row: op, path, value rendered as section/bars pairs | live capture |
| `bindings.arrangement_ai.suggestions[].patch[].value[].section` | ArrangementSuggestions | patch op row: op, path, value rendered as section/bars pairs | live capture |
| `bindings.arrangement_ai.suggestions[].patched_fields_preview.structure[].bars` | ArrangementSuggestions | structure preview as a bar strip (section label × bars) | live capture |
| `bindings.arrangement_ai.suggestions[].patched_fields_preview.structure[].section` | ArrangementSuggestions | structure preview as a bar strip (section label × bars) | live capture |
| `bindings.arrangement_ai.suggestions[].rationale` | ArrangementSuggestions | suggestion card: title, category, rationale, apply flag, diff_format | live capture |
| `bindings.arrangement_ai.suggestions[].title` | ArrangementSuggestions | suggestion card: title, category, rationale, apply flag, diff_format | live capture |
| `bindings.duration.binding` | SourceEcho | per-parameter binding rows: class badge, exact `sent` text, note (prompt, duration, vocal, and any other set parameter) | live capture |
| `bindings.duration.note` | SourceEcho | per-parameter binding rows: class badge, exact `sent` text, note (prompt, duration, vocal, and any other set parameter) | live capture |
| `bindings.duration.sent` | SourceEcho | per-parameter binding rows: class badge, exact `sent` text, note (prompt, duration, vocal, and any other set parameter) | live capture |
| `bindings.lyrics.binding` | LyricsPanel | lyrics binding rows: class, convention, orthography route, note | docs/api/05 or 06 (sung-only) |
| `bindings.lyrics.convention` | LyricsPanel | lyrics binding rows: class, convention, orthography route, note | docs/api/05 or 06 (sung-only) |
| `bindings.lyrics.note` | LyricsPanel | lyrics binding rows: class, convention, orthography route, note | docs/api/05 or 06 (sung-only) |
| `bindings.lyrics.orthography_route` | LyricsPanel | lyrics binding rows: class, convention, orthography route, note | docs/api/05 or 06 (sung-only) |
| `bindings.phoneme_timeline.reason` | LyricsPanel | phoneme timeline availability: status, reason, research item | docs/api/05 or 06 (sung-only) |
| `bindings.phoneme_timeline.research_item` | LyricsPanel | phoneme timeline availability: status, reason, research item | docs/api/05 or 06 (sung-only) |
| `bindings.phoneme_timeline.status` | LyricsPanel | phoneme timeline availability: status, reason, research item | docs/api/05 or 06 (sung-only) |
| `bindings.prompt.binding` | SourceEcho | per-parameter binding rows: class badge, exact `sent` text, note (prompt, duration, vocal, and any other set parameter) | live capture |
| `bindings.vocal.binding` | SourceEcho | per-parameter binding rows: class badge, exact `sent` text, note (prompt, duration, vocal, and any other set parameter) | live capture |
| `bindings.vocal.sent` | SourceEcho | per-parameter binding rows: class badge, exact `sent` text, note (prompt, duration, vocal, and any other set parameter) | docs/api/05 or 06 (sung-only) |
| `compliance.c2pa` | ProvenancePanel | marking rows: C2PA flag + note verbatim, DDEX AI credit + note verbatim, source | live capture |
| `compliance.c2pa_note` | ProvenancePanel | marking rows: C2PA flag + note verbatim, DDEX AI credit + note verbatim, source | live capture |
| `compliance.ddex_ai_credit` | ProvenancePanel | marking rows: C2PA flag + note verbatim, DDEX AI credit + note verbatim, source | live capture |
| `compliance.ddex_ai_credit_note` | ProvenancePanel | marking rows: C2PA flag + note verbatim, DDEX AI credit + note verbatim, source | live capture |
| `compliance.source` | ProvenancePanel | marking rows: C2PA flag + note verbatim, DDEX AI credit + note verbatim, source | live capture |
| `duration_regeneration` | LyricsPanel | duration regeneration row (value or honest null) | live capture |
| `endpoint` | ProvenancePanel | endpoint constant row | live capture |
| `language_fallback` | LyricsPanel | language row: requested language accepted, or the fallback reason verbatim | live capture |
| `lyrics_verification` | LyricsPanel | verdict badge (PASS/FAIL/not measured) with PER/CER/WER vs threshold; null → 'instrumental take — no lyrics gate' | live capture |
| `lyrics_verification.cer` | LyricsPanel | verdict badge (PASS/FAIL/not measured) with PER/CER/WER vs threshold; null → 'instrumental take — no lyrics gate' | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.counts.deletions` | LyricsPanel | phoneme count table: reference, hypothesis, S/D/I, hits | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.counts.hits` | LyricsPanel | phoneme count table: reference, hypothesis, S/D/I, hits | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.counts.hypothesis_phonemes` | LyricsPanel | phoneme count table: reference, hypothesis, S/D/I, hits | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.counts.insertions` | LyricsPanel | phoneme count table: reference, hypothesis, S/D/I, hits | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.counts.reference_phonemes` | LyricsPanel | phoneme count table: reference, hypothesis, S/D/I, hits | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.counts.substitutions` | LyricsPanel | phoneme count table: reference, hypothesis, S/D/I, hits | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.human_verdict.axes_only_he_can_judge[]` | LyricsPanel | human-judgement block: status, the axes only a human judges, rule verbatim | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.human_verdict.rule` | LyricsPanel | human-judgement block: status, the axes only a human judges, rule verbatim | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.human_verdict.status` | LyricsPanel | human-judgement block: status, the axes only a human judges, rule verbatim | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.hypothesis.phonemes[]` | LyricsPanel | what was actually sung (ASR transcript) in full; phoneme sequence; tier counts; unresolved words | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.hypothesis.text` | LyricsPanel | what was actually sung (ASR transcript) in full; phoneme sequence; tier counts; unresolved words | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.hypothesis.tiers.lexicon` | LyricsPanel | what was actually sung (ASR transcript) in full; phoneme sequence; tier counts; unresolved words | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.hypothesis.tiers.unresolved` | LyricsPanel | what was actually sung (ASR transcript) in full; phoneme sequence; tier counts; unresolved words | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.hypothesis.tiers.variant_rule` | LyricsPanel | what was actually sung (ASR transcript) in full; phoneme sequence; tier counts; unresolved words | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.hypothesis.unresolved_words[]` | LyricsPanel | what was actually sung (ASR transcript) in full; phoneme sequence; tier counts; unresolved words | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.measured` | LyricsPanel | verdict badge (PASS/FAIL/not measured) with PER/CER/WER vs threshold; null → 'instrumental take — no lyrics gate' | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.per` | LyricsPanel | verdict badge (PASS/FAIL/not measured) with PER/CER/WER vs threshold; null → 'instrumental take — no lyrics gate' | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.protocol.a8_chain` | LyricsPanel | measurement protocol rows (language, symbol set, measured_on, stem path, separator, ASR, phonemiser, metric, chain) | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.protocol.asr` | LyricsPanel | measurement protocol rows (language, symbol set, measured_on, stem path, separator, ASR, phonemiser, metric, chain) | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.protocol.language` | LyricsPanel | measurement protocol rows (language, symbol set, measured_on, stem path, separator, ASR, phonemiser, metric, chain) | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.protocol.measured_on` | LyricsPanel | measurement protocol rows (language, symbol set, measured_on, stem path, separator, ASR, phonemiser, metric, chain) | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.protocol.metric` | LyricsPanel | measurement protocol rows (language, symbol set, measured_on, stem path, separator, ASR, phonemiser, metric, chain) | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.protocol.phonemiser` | LyricsPanel | measurement protocol rows (language, symbol set, measured_on, stem path, separator, ASR, phonemiser, metric, chain) | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.protocol.separator` | LyricsPanel | measurement protocol rows (language, symbol set, measured_on, stem path, separator, ASR, phonemiser, metric, chain) | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.protocol.stem_path` | LyricsPanel | measurement protocol rows (language, symbol set, measured_on, stem path, separator, ASR, phonemiser, metric, chain) | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.protocol.symbol_set` | LyricsPanel | measurement protocol rows (language, symbol set, measured_on, stem path, separator, ASR, phonemiser, metric, chain) | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.reference.phonemes[]` | LyricsPanel | reference lyric text in full; phoneme sequence; tier counts | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.reference.text` | LyricsPanel | reference lyric text in full; phoneme sequence; tier counts | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.reference.tiers.lexicon` | LyricsPanel | reference lyric text in full; phoneme sequence; tier counts | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.reference.tiers.unresolved` | LyricsPanel | reference lyric text in full; phoneme sequence; tier counts | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.reference.tiers.variant_rule` | LyricsPanel | reference lyric text in full; phoneme sequence; tier counts | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.threshold` | LyricsPanel | verdict badge (PASS/FAIL/not measured) with PER/CER/WER vs threshold; null → 'instrumental take — no lyrics gate' | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.verdict` | LyricsPanel | verdict badge (PASS/FAIL/not measured) with PER/CER/WER vs threshold; null → 'instrumental take — no lyrics gate' | docs/api/05 or 06 (sung-only) |
| `lyrics_verification.wer` | LyricsPanel | verdict badge (PASS/FAIL/not measured) with PER/CER/WER vs threshold; null → 'instrumental take — no lyrics gate' | docs/api/05 or 06 (sung-only) |
| `measured.bits_per_sample` | SoundMeasurements | format strip (codec · sample rate · channels · bit depth · sample format · size); duration with measured flag and measured_on | live capture |
| `measured.channels` | SoundMeasurements | format strip (codec · sample rate · channels · bit depth · sample format · size); duration with measured flag and measured_on | live capture |
| `measured.codec` | SoundMeasurements | format strip (codec · sample rate · channels · bit depth · sample format · size); duration with measured flag and measured_on | live capture |
| `measured.duration_measured` | SoundMeasurements | format strip (codec · sample rate · channels · bit depth · sample format · size); duration with measured flag and measured_on | live capture |
| `measured.duration_seconds` | SoundMeasurements | format strip (codec · sample rate · channels · bit depth · sample format · size); duration with measured flag and measured_on | live capture |
| `measured.measured_on` | SoundMeasurements | format strip (codec · sample rate · channels · bit depth · sample format · size); duration with measured flag and measured_on | live capture |
| `measured.sample_fmt` | SoundMeasurements | format strip (codec · sample rate · channels · bit depth · sample format · size); duration with measured flag and measured_on | live capture |
| `measured.sample_rate` | SoundMeasurements | format strip (codec · sample rate · channels · bit depth · sample format · size); duration with measured flag and measured_on | live capture |
| `measured.size_bytes` | SoundMeasurements | format strip (codec · sample rate · channels · bit depth · sample format · size); duration with measured flag and measured_on | live capture |
| `measured.tempo.agreement` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.analysis.ac_size_s` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.analysis.analysis_sample_rate_hz` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.analysis.duration_s` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.analysis.max_tempo` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.analysis.onset_frames` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.analysis.prior_start_bpm` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.analysis.prior_std_octaves` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.measured_on` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.method` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.reason` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.state` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.tempo_bpm_estimated` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.tempo.tempo_bpm_requested` | PulseReadout | BPM dial (estimated vs requested, agreement badge); method/reason/measured_on/state as labelled rows; analysis.* as the 'how it was measured' table | live capture |
| `measured.time_signature_estimated.reason` | PulseReadout | time-signature chip with state (MEASURED/NOT_RUN) and reason | live capture |
| `measured.time_signature_estimated.state` | PulseReadout | time-signature chip with state (MEASURED/NOT_RUN) and reason | live capture |
| `measured.time_signature_estimated.value` | PulseReadout | time-signature chip with state (MEASURED/NOT_RUN) and reason | live capture |
| `mix_plan.layer_count` | CompositionPlan | plan header: layer_count, multi_path, research_item; refusals as first-class cards (role, reason, law, what_is_still_lawful, what_would_unblock_it); unmeasured verbatim | live capture |
| `mix_plan.layers[].delivery_class` | CompositionPlan | layer card: role, engine, origin, delivery class badge; prompt_intent, evidence and measured_caveat as full-text rows | live capture |
| `mix_plan.layers[].engine` | CompositionPlan | layer card: role, engine, origin, delivery class badge; prompt_intent, evidence and measured_caveat as full-text rows | live capture |
| `mix_plan.layers[].evidence` | CompositionPlan | layer card: role, engine, origin, delivery class badge; prompt_intent, evidence and measured_caveat as full-text rows | live capture |
| `mix_plan.layers[].measured_caveat` | CompositionPlan | layer card: role, engine, origin, delivery class badge; prompt_intent, evidence and measured_caveat as full-text rows | live capture |
| `mix_plan.layers[].origin` | CompositionPlan | layer card: role, engine, origin, delivery class badge; prompt_intent, evidence and measured_caveat as full-text rows | live capture |
| `mix_plan.layers[].prompt_intent` | CompositionPlan | layer card: role, engine, origin, delivery class badge; prompt_intent, evidence and measured_caveat as full-text rows | live capture |
| `mix_plan.layers[].role` | CompositionPlan | layer card: role, engine, origin, delivery class badge; prompt_intent, evidence and measured_caveat as full-text rows | live capture |
| `mix_plan.multi_path` | CompositionPlan | plan header: layer_count, multi_path, research_item; refusals as first-class cards (role, reason, law, what_is_still_lawful, what_would_unblock_it); unmeasured verbatim | live capture |
| `mix_plan.refusals[]` | CompositionPlan | plan header: layer_count, multi_path, research_item; refusals as first-class cards (role, reason, law, what_is_still_lawful, what_would_unblock_it); unmeasured verbatim | live capture |
| `mix_plan.research_item` | CompositionPlan | plan header: layer_count, multi_path, research_item; refusals as first-class cards (role, reason, law, what_is_still_lawful, what_would_unblock_it); unmeasured verbatim | live capture |
| `mix_plan.stage.id` | CompositionPlan | stage row: id, position, reuses | live capture |
| `mix_plan.stage.position` | CompositionPlan | stage row: id, position, reuses | live capture |
| `mix_plan.stage.reuses` | CompositionPlan | stage row: id, position, reuses | live capture |
| `mix_plan.unmeasured` | CompositionPlan | plan header: layer_count, multi_path, research_item; refusals as first-class cards (role, reason, law, what_is_still_lawful, what_would_unblock_it); unmeasured verbatim | live capture |
| `originality_gate.measured` | ProvenancePanel | originality rows: opt_in, measured, status/poll when present, reason/note verbatim | live capture |
| `originality_gate.opt_in` | ProvenancePanel | originality rows: opt_in, measured, status/poll when present, reason/note verbatim | live capture |
| `originality_gate.reason` | ProvenancePanel | originality rows: opt_in, measured, status/poll when present, reason/note verbatim | live capture |
| `prompt_sent` | SourceEcho | the full prose sent to the engine, quoted in full | live capture |
| `render_plan.executed` | MasteringChain | chain header state (executed yes/no) | live capture |
| `render_plan.processed_duration_seconds` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_gcs_uri` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_probe.bits_per_sample` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_probe.channels` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_probe.codec_name` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_probe.duration_seconds` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_probe.measured_by` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_probe.sample_fmt` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_probe.sample_rate` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_probe.size_bytes` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_url` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_url_expires_at` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_url_kind` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.processed_url_signer` | TakeFiles | mastered file card: URL kind, expiry, signer, GCS id, duration, probe (codec, sample rate, channels, bit depth, sample format, size, measured_by) | live capture |
| `render_plan.stages.conform.action` | MasteringChain | stage 'Conform': action, delivered seconds, reason | live capture |
| `render_plan.stages.conform.delivered_seconds` | MasteringChain | stage 'Conform': action, delivered seconds, reason | live capture |
| `render_plan.stages.conform.reason` | MasteringChain | stage 'Conform': action, delivered seconds, reason | live capture |
| `render_plan.stages.export.applied` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.description` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.file_size_bytes` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.measured.bit_rate` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.measured.bits_per_raw_sample` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.measured.channels` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.measured.codec` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.measured.sample_rate` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.measured_by` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.ok` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.output_path` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.requested` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.source.bits_per_sample` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.source.sample_rate` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.export.upsampled_from` | MasteringChain | stage 'Export': requested → applied, source vs output format (sample rate, bit depth, upsampled_from), measured bit-rate/codec/channels, file size, output path, ok flag, description verbatim | live capture |
| `render_plan.stages.master.mode` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.normalization_type` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.ok` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.pass1.input_i` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.pass1.input_lra` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.pass1.input_thresh` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.pass1.input_tp` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.pass1.normalization_type` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.pass1.output_i` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.pass1.output_lra` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.pass1.output_thresh` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.pass1.output_tp` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.pass1.target_offset` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.target.lufs` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.target.true_peak_db` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.verification.channels` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.verification.has_audio` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.verification.integrated_lufs` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.verification.lra_lu` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.verification.measured` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.verification.measured_by` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.master.verification.true_peak_dbtp` | MasteringChain | stage 'Master': mode, target LUFS/TP, pass-1 loudnorm readings table, independent verification readings, ok flag | live capture |
| `render_plan.stages.stems.note` | MasteringChain | stage 'Stems': requested list and note verbatim | live capture |
| `render_plan.stages.stems.requested[]` | MasteringChain | stage 'Stems': requested list and note verbatim | live capture |
| `request_id` | ProvenancePanel | request id (monospace, copyable) — also the panel's data-request-id attribute | live capture |
| `rights.basis` | ProvenancePanel | rights rows: sync, commercial use, copyright warranted, basis verbatim, source | live capture |
| `rights.commercial_use` | ProvenancePanel | rights rows: sync, commercial use, copyright warranted, basis verbatim, source | live capture |
| `rights.copyright_warranted` | ProvenancePanel | rights rows: sync, commercial use, copyright warranted, basis verbatim, source | live capture |
| `rights.source` | ProvenancePanel | rights rows: sync, commercial use, copyright warranted, basis verbatim, source | live capture |
| `rights.sync` | ProvenancePanel | rights rows: sync, commercial use, copyright warranted, basis verbatim, source | live capture |
| `route.delegate_reported.model` | ProvenancePanel | route rows: model, why (verbatim), delegate surface, delegate model with equality check against route.model | live capture |
| `route.delegate_reported.surface` | ProvenancePanel | route rows: model, why (verbatim), delegate surface, delegate model with equality check against route.model | live capture |
| `route.model` | ProvenancePanel | route rows: model, why (verbatim), delegate surface, delegate model with equality check against route.model | live capture |
| `route.why` | ProvenancePanel | route rows: model, why (verbatim), delegate surface, delegate model with equality check against route.model | live capture |
| `seed.honest_limit` | ProvenancePanel | seed rows: value, sent_to_model, source, note verbatim, honest_limit verbatim | live capture |
| `seed.note` | ProvenancePanel | seed rows: value, sent_to_model, source, note verbatim, honest_limit verbatim | live capture |
| `seed.sent_to_model` | ProvenancePanel | seed rows: value, sent_to_model, source, note verbatim, honest_limit verbatim | live capture |
| `seed.source` | ProvenancePanel | seed rows: value, sent_to_model, source, note verbatim, honest_limit verbatim | live capture |
| `seed.value` | ProvenancePanel | seed rows: value, sent_to_model, source, note verbatim, honest_limit verbatim | live capture |
| `service.api_version` | ProvenancePanel | engine identity rows: service, platform, revision, revision_known, api_version, configuration | live capture |
| `service.configuration` | ProvenancePanel | engine identity rows: service, platform, revision, revision_known, api_version, configuration | live capture |
| `service.platform` | ProvenancePanel | engine identity rows: service, platform, revision, revision_known, api_version, configuration | live capture |
| `service.revision` | ProvenancePanel | engine identity rows: service, platform, revision, revision_known, api_version, configuration | live capture |
| `service.revision_known` | ProvenancePanel | engine identity rows: service, platform, revision, revision_known, api_version, configuration | live capture |
| `service.service` | ProvenancePanel | engine identity rows: service, platform, revision, revision_known, api_version, configuration | live capture |
| `source_take[].gcs_uri` | TakeFiles | raw engine take card: take number, URL kind, expiry, GCS id, public URL, measured (codec, sample rate, channels, duration) | live capture |
| `source_take[].measured.channels` | TakeFiles | raw engine take card: take number, URL kind, expiry, GCS id, public URL, measured (codec, sample rate, channels, duration) | live capture |
| `source_take[].measured.codec` | TakeFiles | raw engine take card: take number, URL kind, expiry, GCS id, public URL, measured (codec, sample rate, channels, duration) | live capture |
| `source_take[].measured.duration_seconds` | TakeFiles | raw engine take card: take number, URL kind, expiry, GCS id, public URL, measured (codec, sample rate, channels, duration) | live capture |
| `source_take[].measured.sample_rate` | TakeFiles | raw engine take card: take number, URL kind, expiry, GCS id, public URL, measured (codec, sample rate, channels, duration) | live capture |
| `source_take[].public_url` | TakeFiles | raw engine take card: take number, URL kind, expiry, GCS id, public URL, measured (codec, sample rate, channels, duration) | live capture |
| `source_take[].take` | TakeFiles | raw engine take card: take number, URL kind, expiry, GCS id, public URL, measured (codec, sample rate, channels, duration) | live capture |
| `source_take[].url_expires_at` | TakeFiles | raw engine take card: take number, URL kind, expiry, GCS id, public URL, measured (codec, sample rate, channels, duration) | live capture |
| `source_take[].url_kind` | TakeFiles | raw engine take card: take number, URL kind, expiry, GCS id, public URL, measured (codec, sample rate, channels, duration) | live capture |
| `spend_note` | QuotaAndSpend | spend note verbatim | live capture |
| `success` | TakeFiles | delivery state header (success = every measurement taken) | live capture |
| `takes_delivered` | TakeFiles | takes delivered count | live capture |
| `tracks[].derived_from` | TakeFiles | delivered take card: kind, take number, URL kind, expiry, GCS id, public URL, derived_from | live capture |
| `tracks[].gcs_uri` | TakeFiles | delivered take card: kind, take number, URL kind, expiry, GCS id, public URL, derived_from | live capture |
| `tracks[].kind` | TakeFiles | delivered take card: kind, take number, URL kind, expiry, GCS id, public URL, derived_from | live capture |
| `tracks[].public_url` | TakeFiles | delivered take card: kind, take number, URL kind, expiry, GCS id, public URL, derived_from | live capture |
| `tracks[].take` | TakeFiles | delivered take card: kind, take number, URL kind, expiry, GCS id, public URL, derived_from | live capture |
| `tracks[].url_expires_at` | TakeFiles | delivered take card: kind, take number, URL kind, expiry, GCS id, public URL, derived_from | live capture |
| `tracks[].url_kind` | TakeFiles | delivered take card: kind, take number, URL kind, expiry, GCS id, public URL, derived_from | live capture |
| `tradition_notices[]` | ProvenancePanel | tradition notices list (or 'none for this take') | live capture |

