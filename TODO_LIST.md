# IELTS Writing Lab TODO_LIST

Last updated: 2026-07-01

Purpose: shared Claude/Codex planning list for genuinely breakthrough IELTS Lab directions. This file is for roadmap and debate, not implementation status.

## Current Consensus Before Further Debate

- [ ] Keep the previous idea as a baseline, not the final breakthrough:
  - Breakthrough direction name: Examiner Memory + Mission Engine.
  - First proposed slice: Dashboard "Next Band Blocker" from saved Writing evidence.
  - Why it may be insufficient: it improves personalization, but it still looks like a smart dashboard card rather than a new learning experience.

## Internet Research Signals

- [ ] British Council IELTS Ready / Premium already offers mock tests, AI feedback, model answers, question-type practice, personalised dashboard, progress tracking, webinars, and study recommendations.
- [ ] STUDY4 advertises IELTS software with exam-format practice, personalised route, spaced repetition flashcards, AI marking for pronunciation/speaking/writing, and detailed stats by day and question type.
- [ ] IELTS Online Tests already frames itself as a global IELTS platform with free tests, AI/examiner evaluation services for Writing/Speaking, live lessons, and exam libraries.
- [ ] YouPass positions itself as a free IELTS Reading/Listening/Writing practice platform.
- [ ] Duolingo Max/AI direction shows roleplay, video call, transcript review, AI feedback, and persistent character memory.
- [ ] AI Twin research suggests a stronger speaking breakthrough: let the learner hear a more fluent "better me" version of their own utterance, preserving flow and motivation instead of only explicit correction.
- [ ] Learning-science signal: spaced retrieval, repeated retrieval, and transfer practice matter. A breakthrough should schedule re-attempts and force transfer, not just explain errors once.

## Stronger Breakthrough Candidates To Debate

- [ ] Candidate A: IELTS Digital Twin / Exam Day Simulator
  - Simulate the whole IELTS journey as a live exam cockpit: timed Reading/Listening/Writing/Speaking, examiner behavior, pacing, confidence, interruptions, retake strategy, and after-action review.
  - Differentiator: not just practice tests; it behaves like a personal exam rehearsal system.
  - Risk: large scope; may duplicate existing Full Test unless the after-action review is excellent.

- [ ] Candidate B: Better-Me Replay
  - For Writing: show "your essay" vs "Band-7 you" sentence-by-sentence, preserving the user's ideas but upgrading development, cohesion, lexis, and grammar.
  - For Speaking: replay transcript and optionally TTS as a more fluent version of the user's answer, aligned phrase-by-phrase with their original.
  - Differentiator: learner experiences the gap emotionally and concretely, not as abstract feedback.
  - Risk: voice/TTS privacy and avoiding over-polished unnatural answers.

- [ ] Candidate C: Evidence-to-Output Transfer Loop
  - Reading/Listening passages generate reusable evidence, collocations, and topic frames.
  - User must transfer that input into Writing body paragraphs and Speaking Part 3 answers.
  - Examiner checks whether evidence was selected, paraphrased, and deployed naturally.
  - Differentiator: trains the academic-language pipeline IELTS actually rewards, not isolated skill pages.
  - Risk: needs careful UI so it feels like one mission, not three chores.

- [ ] Candidate D: Examiner Interrogation Mode
  - Instead of giving feedback immediately, the examiner asks 2-4 targeted Socratic follow-ups: "Which sentence proves your main idea?", "Where is the concrete example?", "Can you paraphrase this claim without repeating the prompt?"
  - Differentiator: converts feedback into self-diagnosis and active retrieval.
  - Risk: can feel annoying if overused; should be opt-in or only after grading.

- [ ] Candidate E: Personal IELTS Corpus + Forensic Memory
  - The app builds a private corpus of the user's essays, speaking transcripts, wrong answers, saved vocab, and rewritten improvements.
  - Every recommendation cites exact past evidence.
  - Differentiator: trustworthy local-first memory that competitors with cloud accounts may not expose transparently.
  - Risk: by itself still feels like analytics unless connected to missions/replays.

## Possible Synthesis To Debate

- [ ] New synthesis proposal: "Band-7 Digital Twin"
  - The app continuously builds a private model of:
    - what the user actually writes/says/gets wrong;
    - what a next-band version of the same answer would look/sound like;
    - which micro-skill must be retested after spacing.
  - First-screen experience should answer:
    - "What is the one thing blocking my next half-band?"
    - "Show me the exact evidence from my own work."
    - "Show me the Band-7 version of me."
    - "Make me redo it now, then schedule the next retest."

## Round 2: CONSENSUS — "Band-7 Digital Twin: Self-Correct -> Replay -> Retest"

Claude and Codex researched independently (web search + code inspection) and converged on the same loop inversion without seeing each other's final answer first — treated as a strong signal, not just agreement for agreement's sake.

- [x] Leading concept: the Better-Me Replay is the emotional hook, not the full breakthrough. The score-moving mechanism is the forced spaced retest with pass/fail tracking.
- [x] Research grounding:
  - Recasts (silently showing the better version) meta-analysis effect size ~.38 only; recasts suit structures the learner has NO prior knowledge of, while prompts (elicit self-correction) suit structures the learner already half-knows but applies unreliably — exactly the band 6->7 plateau profile (automaticity/reliability gap, not knowledge gap). A cold "Band-7 you" reveal risks being read as confirmation-of-meaning rather than feedback-on-form.
  - Generation-effect/Socratic research: guided self-explanation > free self-explanation > passive reception, but only when self-generation succeeds — argues for a structured nudge before reveal, not open-ended struggle.
  - Stanford/SCALE RCT (LLM-guided adaptive sequencing, Taipei City Govt, 10 high schools): adaptive sequencing alone produced +0.15 SD on unassisted exam performance (~6-9 months of schooling equivalent), attributed to engagement from the sequencing itself, not feedback quality. Spaced-retrieval-practice literature: spacing beats massed practice specifically on transfer. Strongest causal evidence found in either research pass.
  - Differentiator claim checked against every competitor scanned (British Council, STUDY4, IELTS Online Tests, YouPass, Gabble.ai, LexiBot, Cathoven): none do forced spaced retest of the SAME named weakness with before/after pass/fail evidence. Backed by the RCT, not just a competitor-gap guess.
- [x] Final loop (both agree):
  1. Identify one weakness from existing evidence: `gradeResult.cappingCriterion` / `mistakes[].category` (zero new AI).
  2. Ask ONE Socratic question generated from a real structural fact — reuse the deterministic Task 2 audit helpers in `src/09-writing-examiner.jsx` (`task2SentenceHasExample` / `task2BodyHasFinalLink` / `auditTask2ExampleStructure`, just hardened this session) — zero hallucination risk, near-free to compute.
  3. User self-rewrites that one paragraph FIRST (generation effect — before seeing any answer).
  4. Reveal Band-7 Replay with diff-style transformation labels, preserving the student's stance/idea — now functions as confirmation/contrast against their own attempt, not a cold answer.
  5. Schedule ONE spaced retest: same criterion, new topic, ~2-3 days later.
  6. On retest, re-run the SAME deterministic audit — pass/fail, no new AI judgment call. Track a minimal per-criterion streak (smallest possible mastery model, not a full taxonomy).
- [x] Retest scheduling — resolved, reuse don't build: `revisitDue` / `revisitedAt` essay revision queue via `getDueRevisits()` + Dashboard Revision Queue already exists for essays; `state.studyPlans.dailyPlan.items` and Vocab `getSchedule()` are other existing scheduling precedents. Gap: no first-class retest-mission metadata keyed by weakness/criterion — that's the one real piece of new plumbing, not a whole new scheduler.
- [x] Strongest v1 candidate: Writing-only "Self-Correct -> Band-7 Replay -> Retest" for one Task 2 body paragraph. Reuses cappingCriterion/mistakes (targeting), the Task 2 structural audit (Socratic question + retest pass/fail check), Rewrite Trainer UI shell, essay revisit queue (scheduling). New: the sequencing/orchestration, diff-transformation reveal, minimal per-criterion streak, retest-mission metadata.
- [x] Where to start (Codex refinement, agreed): NOT Dashboard first. Start inside the existing graded Task 2 review / Rewrite Trainer surface, since the learner is already emotionally engaged with that exact failed artifact. Name candidates: "Band-7 Drill" / "Next-Band Replay". Supersedes "Dashboard Next Band Blocker" as the first slice (that idea drops to a later/optional surface, not the entry point).
- [x] Retest mission shape (Minimal option, agreed - reuse the essay revisit queue, don't build a new global mission system yet):
  ```
  { type:"band7-replay", skill:"writing",
    weaknessKey:"task-response:evidence" | "cohesion:link" | ...,
    sourceEssayId, sourceParagraphIndex, dueAt,
    passCondition:"body-has-topic-support-example-link",
    status:"scheduled|done|missed" }
  ```
  Attached as optional metadata on the essay record (alongside existing `revisitDue`/`revisitedAt`), surfaced later by the existing Dashboard Revision Queue - no new global planner for v1.
- [x] Hard gates for the reveal step (prevents the exact "weak AI Example" problem the user hit this session):
  - Generated paragraph must preserve the original stance/main idea.
  - Must include a transformation map tied to exact original sentence(s) - no vague "improved version".
  - Must pass the same deterministic Task 2 structure audit used for AI Example.
  - Any newly added example/support must be explicitly labeled as an addition, never presented as if it were in the original.

## Status: v1 implemented — Writing Band-7 Drill

- [x] Implemented first slice in Writing review:
  - `src/09-writing-examiner.jsx`: reusable body-paragraph audit, deterministic Socratic question, paragraph picker, Band-7 replay generation with structure audit/retry, mission metadata builder.
  - `src/09-writing-suite.jsx`: `Band7DrillPanel` in Writing Review Dashboard, self-correct-before-reveal flow, transformation reveal, 3-day retest scheduling, due retest pass/fail check.
- [x] Browser click-through verification (Claude): DONE. Full panel logic chain + real React component render verified against the built bundle in preview (picker targets weakest body, deterministic Socratic question, selfRewrite reaches the model prompt, mission schema correct, due-retest pass/fail deterministic, component mounts with zero console errors). See Conversation.txt DONE log 2026-07-01.
- [x] Dashboard-level surfacing for `band7Mission` / due retests (Claude): DONE + verified.
  - `src/09-practice-helpers.jsx`: added `getDueBand7Missions` + `getUpcomingBand7Missions` (parallel to getDueRevisits/getUpcomingRevisits). Standalone-tested (due/upcoming/done/missed/future filtering, oldest-first, null-safe).
  - `src/06-dashboard.jsx`: extended the "🔁 Revision Queue" card with a "🎯 Band-7 retests due" sub-section (weakness label + source date + days overdue); "Drill →" sets activePracticeTask="review" then goTo("practice"), landing on Writing → Review Tools where the Band-7 Drill lives.
  - Verified in preview: DashboardPage renders with seeded backdated mission, section + weakness label + overdue text appear, Drill click fires both the activePracticeTask="review" patch and goTo("practice"), zero console errors. Build PASS, graphify updated.
- [ ] Still open for next lane:
  - Extend the same loop to Speaking/Reading only after Writing v1 is stable.

## Debate Questions For Claude/Codex

- [ ] Which candidate would make a user say "I have not seen this in an IELTS app before"?
- [ ] Which candidate can be shipped as a thin v1 without lying about its intelligence?
- [ ] Which candidate best uses assets already in the project: Writing grader, Speaking backend, Reading generation/review, vocab, dashboard, saved state?
- [ ] Which candidate creates a durable moat: local-first privacy, personal corpus, exact evidence, or cross-skill transfer?
- [ ] What is the smallest demo that feels magical within one session?

## Implementation Guardrails

- [ ] No private data in public release.
- [ ] Do not modify generated files directly.
- [ ] If code changes happen later in v7-split, run `node scripts/build.mjs`.
- [ ] If UI behavior changes, verify in browser/Playwright.
- [ ] After code changes in v7-split, run `graphify update D:\Downloads\ielts-writing-lab-v7-split`.
- [ ] Keep claims in Conversation.txt before implementation and DONE logs after verification.
