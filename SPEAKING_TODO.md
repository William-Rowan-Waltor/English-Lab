# Speaking — TODO / backlog

Private working notes (v7-split). Coordinate via Conversation.txt before claiming an item.

## Deferred follow-ups (from the Model Answer Library work)
- [x] **Library collocations → Vocab SRS deck.** (Claude) Model Answer Library has a "📚 Add N collocations to Vocab" button that merges them into state.vocabLexisLibrary.collocations via the GLOBAL mergeVocabLexisLibrary (07-vocab) — so they appear in the Vocab Dictionary + collocation quiz. 11-speaking.jsx ONLY, no Vocab-file edits.
- [x] **Per-turn model answers in the Full Mock review.** Shipped in `SpeakingFullMockExam`: each turn-by-turn review item now reuses `ModelAnswerPanel` on demand, matching Part Practice without automatic LLM cost.

## Hesitation & pauses
- [x] **Pause & hesitation timeline.** Claude shipped fillers/self-corrections in `<HesitationMap>`; Codex added `start`/`end`/`gap` to `/api/score` `word_clarity`, so silent-pause markers now have the data they need. Aggregate stats remain in `acoustic_features` and DeliveryLexisCoach.
- [x] **Hesitation TYPE classification.** (Claude) <HesitationMap> now classifies each silent pause: NATURAL (prev word ends at a clause/sentence boundary .,!?;:) vs SEARCHING (mid-clause). Searching markers are rose, natural are grey; header counts searching pauses + a tip. From per-word start/end Codex added.
- [ ] (Optional, separate task) **VAD-based silence detection** on the raw audio for unfilled pauses that Whisper's word gaps miss. Keep this backend-first and gated/graceful; it needs false-positive tuning before UI polish.

## AI scoring realism (closer to a real examiner)
- [x] **Calibration anchors (few-shot band exemplars).** Codex added concise Band 5/6/7/8 calibration anchors in the examiner prompt, paraphrased from public descriptors rather than embedding copyrighted real sample answers.
- [x] **Fluency + natural delivery retune.** (Codex, from Claude plan) Examiner prompts now prioritise Fluency & Coherence, natural answer development (reason/example/contrast/detail), and natural/appropriate lexical choice. `rare_word_ratio` remains a rough feature only; the prompt explicitly says not to reward advanced-word count or forced idioms.
  - (Claude) Frontend complement: DeliveryLexisCoach "Word upgrades"→"Word variety" (only flags a basic word used >=3x, framed as natural variety, not bigger words); NEW <DevelopAnswerTips> shows the Extra-Info extension techniques (reason/example/contrast/detail) when an answer is under-developed for the part.
- [x] **Self-consistency (median of N).** (Codex) Implemented as opt-in "Careful grade (3x)" for single-question scoring, Part Practice, and Full Mock. Backend performs multiple independent examiner passes, takes median criterion scores, and reports grading metadata while default grading remains one-pass.
- [ ] (Optional, config only) **Stronger EXAMINER_MODEL.** llama-3.3-70b is OK; a larger/newer or Claude/GPT-4-class model via `EXAMINER_BASE_URL`/`EXAMINER_MODEL` may score more like a real examiner. Do not change secrets or provider routing casually.
- [x] **Conservative band placement.** Prompt now defaults to the lower adjacent band unless the higher band is clearly sustained, and asks `band_gap` to name the missing evidence.
- [x] **Tighter descriptor boundaries.** Band 5/6/7/8 anchors and adjacent-band boundaries are now included in both turn and session examiner prompts.
- [~] **Real pronunciation scoring is integrated but optional/dormant.** ZCode shipped `speaking-backend/src/pronunciation.py` (wav2vec2 GOP, CPU, graceful). Claude integrated it: `main.py` `/api/score` calls `score_pronunciation` behind try/except and attaches `result.pronunciation_real` only when available; frontend `<RealPronPanel>` shows the real band + weakest phonemes + words-to-re-say. Do **not** install the heavy stack by default; optional activation requires user approval for CPU torch + transformers + librosa + ~1.2GB model download.

## Current consensus / next steps
- Keep real phoneme scoring optional, not a default dependency. The everyday lightweight pronunciation toolkit remains: Whisper clarity heatmap, per-word confidence, minimal pairs, hesitation/pause map, and DeliveryLexisCoach.
- If more discoverability is needed, prefer a tiny Speaking/Settings health status ("real phoneme scoring: optional/not installed") over cluttering every score result.
- Next implementation candidates, only if explicitly requested: VAD raw-audio silence detection, or a small Speaking realism health UI.
