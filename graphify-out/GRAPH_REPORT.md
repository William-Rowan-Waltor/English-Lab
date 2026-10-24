# Graph Report - ielts-writing-lab-v7-split  (2026-10-24)

## Corpus Check
- 63 files · ~553,090 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .bat 5, (none) 3, .example 2)

## Summary
- 3524 nodes · 9204 edges · 135 communities (121 shown, 14 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 1258 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- babel.min.js
- 04-state.js
- 11-reading.jsx
- 11-listening.jsx
- 02-api.js
- gsap.min.js
- serve.mjs
- 05-common-components.jsx
- sa
- 04-design-eras.jsx
- 09-practice-helpers.jsx
- 09-writing-examiner.jsx
- 09-writing-suite.jsx
- Word Study Card (indicate)
- db.py
- 11-speaking.jsx
- migrate-edge-localstorage.mjs
- Dashboard Screen (IELTS Writing Lab)
- build.mjs
- buildAndConvertQuestions
- Vocab Quiz screen (Definition to Word match)
- ReadingQuestion
- Feedback Screenshot — IELTS Writing Practice Grading View
- Revision / Practice screen (IELTS Writing Lab)
- Vocab Daily — Word Debt / Overdue Review Screenshot
- test-unified-mastery.mjs
- n
- isReadingAnswerCorrect
- ReadingAnswerControl
- SpeakingFullMockExam
- 11-saved.jsx
- 11-vocab-lookup.jsx
- 01-awl-card-data.js
- ReadingWorkspace
- 00-data.js
- t
- r
- normalizeWritingExaminerResult
- SpeakingPage
- xie
- chart.umd.min.js
- rs
- zs
- de
- react-dom.production.min.js
- I
- w
- m
- os
- b
- n
- ae
- .getParsed
- pronunciation.py
- O
- test_examiner.py
- transcriber.py
- e
- N
- ia
- il
- a
- Agent Recovery Brief - IELTS Writing Lab
- auditBodyParagraphStructure
- 03-vocab-utils.js
- oi
- jszip.min.js
- en
- react.production.min.js
- IELTS Writing Lab
- 12-app.jsx
- SpeakingPartPracticeSession
- IELTS Writing Lab TODO_LIST
- examiner.py
- cr
- IELTS Writing Coach
- 11-task2.jsx
- 08-theory.jsx
- 00-vn-exam-data.js
- 09-writing-aid-display.js
- WordCard
- users.md
- IELTS Speaking Backend (Phase 1)
- Tween
- 06-dashboard.jsx
- b
- sg
- main.py
- Ce
- Qf
- na
- handleReadingFetchSource
- Eme
- ja
- Ji
- ni
- 11-full-test.jsx
- gj
- _d
- Troubleshooting
- imageToText
- .toString
- 07b-vocab-study-modes.jsx
- x
- da
- ebe
- ua
- ModelAnswerLibrary
- wg
- useSkillWorkTabs
- ml
- mb
- savedSignature
- ModelAnswerPanel
- 11-translate-widget.jsx
- an
- data/README.md
- NF
- fs
- 11-settings.jsx
- Listening real audio via Supertonic TTS (single + multi-voice dialogue)
- Vf
- 09-writing-calibration.jsx
- AK
- ly
- sn
- vp
- Ub
- Vb
- pP

## God Nodes (most connected - your core abstractions)
1. `xie()` - 320 edges
2. `rs()` - 135 edges
3. `a()` - 121 edges
4. `t()` - 117 edges
5. `r()` - 110 edges
6. `w()` - 100 edges
7. `n()` - 85 edges
8. `x()` - 82 edges
9. `I()` - 75 edges
10. `zs` - 73 edges

## Surprising Connections (you probably didn't know these)
- `AI scoring realism (closer to a real examiner)` --references--> `score_pronunciation()`  [INFERRED]
  SPEAKING_TODO.md → speaking-backend/src/pronunciation.py
- `Hesitation & pauses` --references--> `start()`  [INFERRED]
  SPEAKING_TODO.md → vendor/chart.umd.min.js
- `Round 2: CONSENSUS — "Band-7 Digital Twin: Self-Correct -> Replay -> Retest"` --references--> `getSchedule()`  [INFERRED]
  TODO_LIST.md → src/04-state.js
- `Round 2: CONSENSUS — "Band-7 Digital Twin: Self-Correct -> Replay -> Retest"` --references--> `getDueRevisits()`  [INFERRED]
  TODO_LIST.md → src/09-practice-helpers.jsx
- `Status: v1 implemented — Writing Band-7 Drill` --references--> `Band7DrillPanel()`  [INFERRED]
  TODO_LIST.md → src/09-writing-suite.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Writing grading + feedback pipeline** — src_02_api, src_09_writing_examiner, src_09_writing_suite, feat_local_grader, feat_collocation_detection [EXTRACTED 0.85]
- **Study Plans F1/F2 feature flow** — src_04_state, src_06_dashboard, src_12_app, src_02_api, feat_study_plans [EXTRACTED 0.85]

## Communities (135 total, 14 thin omitted)

### Community 0 - "babel.min.js"
Cohesion: 0.01
Nodes (117): _9(), AB(), Abe(), AJ(), Ame(), ap(), Ape(), aq() (+109 more)

### Community 1 - "04-state.js"
Cohesion: 0.11
Nodes (27): applyStorageBundle(), canUseFolderStorage(), createVocabPatch(), defaultState(), defaultStudyPlans(), describeStorageError(), folderStorageAvailable(), getSchedule() (+19 more)

### Community 2 - "11-reading.jsx"
Cohesion: 0.06
Nodes (40): Reading forensic missed-question review + scan/paraphrase drill, Reading Notes drawer + id-based unhighlight, Reading strict-mock mode + 40Q validation, Yes/No/Not Given reading question type, addReadingHighlights(), AI_TELL_PATTERNS, buildPassagePrompt(), fetchMediaWikiSource() (+32 more)

### Community 3 - "11-listening.jsx"
Cohesion: 0.07
Nodes (59): Listening dictation micro-drill, Listening guided full-mock controller + checking phase, buildListeningPrompt(), buildListeningQuestionsFromTranscriptPrompt(), clientFetchListeningText(), clientImportListeningUrl(), clientImportTedTranscript(), clientImportYouTubeCaptions() (+51 more)

### Community 4 - "02-api.js"
Cohesion: 0.06
Nodes (58): Gemini 429 zero-quota error clarity, Reading strategy dataset + animated walkthrough (Pell strategies), balanceJSONText(), _baselineSortItems(), buildLearnerProfile(), callAPI(), _callAPIOnce(), _callProvider() (+50 more)

### Community 5 - "gsap.min.js"
Cohesion: 0.07
Nodes (14): hb(), la(), ma(), na(), oa(), ob(), Q(), Qb() (+6 more)

### Community 6 - "serve.mjs"
Cohesion: 0.10
Nodes (31): AI proxy + URL/doc import routes (serve.mjs), Listening import-status contract (real_audio / transcript_only / source_link_only), basicHtmlToReadingText(), cleanMarkitdownStderr(), collectTedCues(), decodeHtml(), extractJsonAfter(), extractReadingSourceText() (+23 more)

### Community 7 - "05-common-components.jsx"
Cohesion: 0.16
Nodes (18): WorkTab close-confirm + restore, _browserHasVoices(), _OCR_HOMOGLYPHS, pickBestEnglishVoice(), pickEnglishVoices(), SpeakButton(), speakDialogue(), speakSmart() (+10 more)

### Community 8 - "sa"
Cohesion: 0.28
Nodes (9): ai(), bi(), dd(), di(), ka(), b(), nf(), rf() (+1 more)

### Community 9 - "04-design-eras.jsx"
Cohesion: 0.13
Nodes (28): Era-aware toast + .era-input shared CSS, applyDesignEra(), _bauhausConcentricSVG(), _bauhausPrimitivesSVG(), _buildEraCSS(), _classicalWreathSVG(), _decoChevSVG(), _decoSunSVG() (+20 more)

### Community 10 - "09-practice-helpers.jsx"
Cohesion: 0.15
Nodes (14): getDueBand7Missions(), getUpcomingBand7Missions(), MapRender(), MiniChartCanvas(), MultiChartRender(), PracticeChartCanvas(), PracticeTableRender(), PracticeVisualRender() (+6 more)

### Community 11 - "09-writing-examiner.jsx"
Cohesion: 0.11
Nodes (24): Collocation / misused-rare-word detection in graders, Local grader schema parity (off-topic / promptFit / drill / vocab), Next Band Blocker (target-aware writing trainer), BAND7_RETEST_PROMPTS, _band7PromptIndex(), band7ReplayRules(), buildBand7Mission(), buildBand7RetestPrompt() (+16 more)

### Community 12 - "09-writing-suite.jsx"
Cohesion: 0.14
Nodes (25): Cross-attempt analytics + shared Mistake Journal, Band7DrillPanel(), Band7DueMissionsList(), BandDescriptorPanel(), buildMistakeCategoryStats(), buildMistakeJournal(), buildWritingErrorBank(), collectGradeText() (+17 more)

### Community 13 - "Word Study Card (indicate)"
Cohesion: 0.14
Nodes (20): Vocab Word Card Screenshot, AWL Word Data Source, AWL Progress Footer (3 of 570, Daily, Band target 7.5), Bilingual Definition (Vietnamese chi ra plus English gloss), Collocations Panel (strongly indicate, indication of, leading indicator), Dark Theme with Lime Accent Design, Headword indicate with POS verb noun adjective, IELTS Academic Writing Lab App (+12 more)

### Community 14 - "db.py"
Cohesion: 0.11
Nodes (20): connect(), get_question(), init_db(), insert_question(), insert_session(), list_questions(), list_sessions(), list_topics() (+12 more)

### Community 15 - "11-speaking.jsx"
Cohesion: 0.11
Nodes (23): Speaking no-backend Warm-up + minimal-pair drill, _BASIC_UPGRADES, _buildHesitationTokens(), buildMockSummary(), _COACH_STOP, CRITERIA_META, _deliveryChecks(), DeliveryLexisCoach() (+15 more)

### Community 16 - "migrate-edge-localstorage.mjs"
Cohesion: 0.15
Nodes (13): blockEntries(), bundle, configs, defaultEdgeLevelDb, outFile, projectRoot, readBlock(), readHandle() (+5 more)

### Community 17 - "Dashboard Screen (IELTS Writing Lab)"
Cohesion: 0.21
Nodes (15): Dashboard Subsystem, Settings / Config Subsystem, Theory Subsystem, Vocab / AWL Subsystem, Writing Practice & Grading Subsystem, Last 14 Days Real Learning Heatmap, AWL Progress Panel (Mastered/Total learned of 570), Band Score History Line Chart (Overall vs LR) (+7 more)

### Community 18 - "build.mjs"
Cohesion: 0.09
Nodes (14): index.html (generated app bundle), Vendor + CDN fallback loader, banner, body, distDir, files, indexFile, jsFiles (+6 more)

### Community 19 - "buildAndConvertQuestions"
Cohesion: 0.08
Nodes (32): buildAndConvertQuestions(), buildMatchingFeaturesPrompt(), buildMatchingHeadingsPrompt(), buildMatchingInfoPrompt(), buildMatchingSentenceEndingsPrompt(), buildMCQMultiplePrompt(), buildMCQPrompt(), buildReadingAcceptedAnswers() (+24 more)

### Community 20 - "Vocab Quiz screen (Definition to Word match)"
Cohesion: 0.27
Nodes (11): Vocab Quiz screen (Definition to Word match), AWL vocabulary subsystem, Bilingual definition prompt (Vietnamese gloss), Dark theme with neon-green accent, Definition-to-Word matching mode, Multiple-choice answer tiles (4 options), Phase 1/4 progress bar and 1/14 counter, Footer stats (AWL 3/570, Daily 15w, Band target 7.5, AI Groq) (+3 more)

### Community 21 - "ReadingQuestion"
Cohesion: 0.20
Nodes (12): formatReadingTime(), readingDrillSuggestion(), _readingKeywordSegments(), ReadingPracticeHub(), ReadingQuestion(), readingQuestionGroups(), ReadingQuestionStrategy(), readingResultStats() (+4 more)

### Community 22 - "Feedback Screenshot — IELTS Writing Practice Grading View"
Cohesion: 0.27
Nodes (10): Feedback Screenshot — IELTS Writing Practice Grading View, Annotated Essay with Inline Corrections (highlighted/struck text), Band Score Cards (7.0 / 6.5 grading summaries), Dark-Theme Left Sidebar Navigation (Practice active), Fixed Essay / Mistake Corrections Feature, Essay Grading / Band Scoring Subsystem, Practice Workspace, Strengths / Feedback Bullet Panels (+2 more)

### Community 23 - "Revision / Practice screen (IELTS Writing Lab)"
Cohesion: 0.29
Nodes (10): Revision / Practice screen (IELTS Writing Lab), Action toolbar (Revisit detail, Load to editor, Copy, Delete, Export JSON, Clear all), Band score 7.0 with TR/CC/LR/GRA criterion breakdown, TARGET band badge (top bar), Dark left sidebar navigation (Dashboard / Vocab / Theory / Practice / Settings), Graded essay response text body, Saved attempt history list (All 11 / Graded 11 / Draft 19), Practice essay review view (+2 more)

### Community 24 - "Vocab Daily — Word Debt / Overdue Review Screenshot"
Cohesion: 0.29
Nodes (10): Vocab Daily — Word Debt / Overdue Review Screenshot, AWL progress bar (3 / 569, Sub 1-10), Dark theme, serif heading, left nav (Dashboard/Vocab/Theory/Practice/Settings), 15 New Words today (indicate, individual, interpret, ...), Stats cards: Streak / Mastered / Learned, Study Words / Quiz Only / Import vocab actions, Upcoming schedule with missed/review markers (spaced repetition), Vocab Daily page (AWL 570 words) (+2 more)

### Community 25 - "test-unified-mastery.mjs"
Cohesion: 0.07
Nodes (24): againStat, awlCardDataContent, awlDataContent, baseDir, createdId, dataContent, distApp, easyStat (+16 more)

### Community 26 - "n"
Cohesion: 0.09
Nodes (64): aF(), f(), l(), bh(), bN(), c(), Cf(), dg() (+56 more)

### Community 27 - "isReadingAnswerCorrect"
Cohesion: 0.33
Nodes (7): countReadingAnswerWords(), isReadingAnswerCorrect(), normalizeReadingAnswer(), plainSectionText(), readingNumberCanonical(), readingWordLimit(), validateReadingTest()

### Community 28 - "ReadingAnswerControl"
Cohesion: 0.16
Nodes (20): ReadingAnswerControl(), readingChoiceValue(), ReadingCompletionFrame(), ReadingCompletionInput(), ReadingHeadingPicker(), ReadingInlineCompletion(), ReadingLetterPicker(), ReadingMatchingEndingAnswer() (+12 more)

### Community 29 - "SpeakingFullMockExam"
Cohesion: 0.22
Nodes (17): buildMockTurns(), formatTimer(), mockExaminerSpeak(), mockStopVoice(), SpeakingFullMockExam(), beginPrep(), fetchMockQuestions(), finalizeSession() (+9 more)

### Community 30 - "11-saved.jsx"
Cohesion: 0.33
Nodes (8): 8. Recent important work from Conversation, _BookmarkGlyph(), SaveButton(), _SAVED_TYPE_ACCENT, SavedItemCard(), SavedPage(), SavedTypeBadge(), _savedTypeLabel()

### Community 31 - "11-vocab-lookup.jsx"
Cohesion: 0.48
Nodes (6): _vlBlocked(), _vlCacheTranslation(), _vlResolveKnown(), _vlTranslateCache, _vlWordAtPoint(), VocabLookupLayer()

### Community 33 - "01-awl-card-data.js"
Cohesion: 0.50
Nodes (3): AWL_DATA, AWL_DATA_MAP, TASK1_AWL

### Community 35 - "ReadingWorkspace"
Cohesion: 0.09
Nodes (27): buildDatasetEntryFromCompleteTest(), buildDatasetEntryFromTest(), detectAITells(), extractHeadingOptions(), fetchUrlSource(), formatWithLabels(), getReadingQuestionMix(), keepQuestionTargetWithVariety() (+19 more)

### Community 37 - "t"
Cohesion: 0.14
Nodes (17): et(), tt(), Ab(), Bb(), cb(), Context(), Ec(), fb() (+9 more)

### Community 38 - "r"
Cohesion: 0.18
Nodes (16): _a(), ac(), Co(), db(), ea(), eb(), fa(), ga() (+8 more)

### Community 39 - "normalizeWritingExaminerResult"
Cohesion: 0.16
Nodes (15): criterionBand(), defaultTaskAudit(), detectMechanicalIssues(), ensureWritingFixResult(), examinerScoreSummary(), FixedEssayPanel(), _mistakeCategory(), normalizeCriterion() (+7 more)

### Community 40 - "SpeakingPage"
Cohesion: 0.19
Nodes (14): ClarityHeatmap(), formatBand(), getSpeakingBackend(), pickRecorderMime(), RealPronPanel(), SpeakingMinimalPairDrill(), SpeakingPage(), clearScore() (+6 more)

### Community 43 - "xie"
Cohesion: 0.01
Nodes (289): _0(), _1(), _2(), _3(), _4(), _5(), _6(), _7() (+281 more)

### Community 44 - "chart.umd.min.js"
Cohesion: 0.03
Nodes (96): Aa(), addControllers(), addElements(), addPlugins(), addScales(), Ai(), apply(), at() (+88 more)

### Community 45 - "rs"
Cohesion: 0.03
Nodes (73): ai(), ao(), bc(), bd(), bi(), cd(), ci(), co() (+65 more)

### Community 46 - "zs"
Cohesion: 0.06
Nodes (7): d(), Es(), L(), pa, Rs(), Si(), zs

### Community 47 - "de"
Cohesion: 0.09
Nodes (10): de(), dt(), ei(), fa(), ga(), gs, lt(), ti() (+2 more)

### Community 48 - "react-dom.production.min.js"
Cohesion: 0.04
Nodes (50): dl(), kh(), mh(), $a(), Ab(), ah(), bh(), ch() (+42 more)

### Community 49 - "I"
Cohesion: 0.06
Nodes (18): addBox(), afterDatasetsUpdate(), beforeUpdate(), Ce(), ea(), generateLabels(), getController(), I() (+10 more)

### Community 50 - "w"
Cohesion: 0.04
Nodes (70): a(), l(), R(), T(), ae(), ar(), Au(), be() (+62 more)

### Community 51 - "m"
Cohesion: 0.10
Nodes (45): E(), j(), Bme(), _e(), ee(), Fpe(), g(), hd() (+37 more)

### Community 52 - "os"
Cohesion: 0.05
Nodes (13): getPlugin(), ks(), labelColor(), labelPointStyle(), Ms(), os(), Ps(), _s() (+5 more)

### Community 53 - "b"
Cohesion: 0.10
Nodes (24): b(), cs(), due(), fs(), gu(), B(), C(), N() (+16 more)

### Community 54 - "n"
Cohesion: 0.08
Nodes (43): B(), bf(), Bg(), Cg(), cj(), $d(), Db(), Dc() (+35 more)

### Community 55 - "ae"
Cohesion: 0.12
Nodes (9): ae, color(), ee(), ie(), Le(), ne(), oe(), re() (+1 more)

### Community 56 - ".getParsed"
Cohesion: 0.07
Nodes (22): _calculateBarIndexPixels(), _calculateBarValuePixels(), determineDataLimits(), getLabelAndValue(), getLabelForValue(), getPixelForTick(), getPixelForValue(), _getRuler() (+14 more)

### Community 57 - "pronunciation.py"
Cohesion: 0.13
Nodes (11): _err_result(), _get_model(), _goodness_to_band(), is_available(), _is_gpu_lib_error(), _load_audio(), _missing_deps(), PronResult (+3 more)

### Community 58 - "O"
Cohesion: 0.07
Nodes (15): configure(), ct(), getBasePixel(), He(), Is(), kn(), label(), ln() (+7 more)

### Community 59 - "test_examiner.py"
Cohesion: 0.12
Nodes (16): aggregate_features(), extract_acoustic_features(), _finalize_score_and_band_gap(), next_turn(), score_transcript(), Transcript, _examiner_result(), test_aggregate_features() (+8 more)

### Community 60 - "transcriber.py"
Cohesion: 0.17
Nodes (4): clean_text(), _get_model(), _is_gpu_lib_error(), _run()

### Community 61 - "e"
Cohesion: 0.06
Nodes (36): A(), as(), be(), bs, constructor(), describe(), _e(), fi() (+28 more)

### Community 62 - "N"
Cohesion: 0.09
Nodes (14): afterDraw(), afterEvent(), afterUpdate(), An(), Ci(), Di(), Fn(), hn() (+6 more)

### Community 63 - "ia"
Cohesion: 0.11
Nodes (36): G(), cf(), Dg(), eb(), Eg(), Eh(), fi(), $h() (+28 more)

### Community 64 - "il"
Cohesion: 0.07
Nodes (66): ade(), Ah(), as(), aV(), bce(), c(), p(), u() (+58 more)

### Community 65 - "a"
Cohesion: 0.04
Nodes (92): x(), a(), n(), ac(), bA(), ble(), bo(), cc() (+84 more)

### Community 66 - "Agent Recovery Brief - IELTS Writing Lab"
Cohesion: 0.13
Nodes (14): 10. Cách trò chuyện giữa agents, 11. Quy tắc phân việc theo subsystem, 12. Build và verification tối thiểu, 13. Public release checklist, 14. Nếu bị mất trí nhớ hoàn toàn, đọc theo thứ tự này, 1. Việc phải làm ngay khi vào dự án, 2. Dự án là gì, 3. Folder nào là gì (+6 more)

### Community 67 - "auditBodyParagraphStructure"
Cohesion: 0.21
Nodes (12): getDueRevisits(), auditBand7RetestParagraph(), auditBodyParagraphStructure(), auditTask2ExampleStructure(), pickBand7DrillParagraph(), task2BodyHasFinalLink(), task2BodyStartsBadly(), task2ExampleHasFakeCitation() (+4 more)

### Community 68 - "03-vocab-utils.js"
Cohesion: 0.06
Nodes (49): Anti-hoarding vocab import (5-words/week ranking + resumable), Vocab lexis enrichment (synonyms/collocations/idioms) + import + drills, AWL_FORM_TO_HW, awlEntryToWordCardData(), COLLOC_DISTRACTOR_POOL, deriveByMorphology(), EN_GLOSS, FAMILY_GLOSS (+41 more)

### Community 69 - "oi"
Cohesion: 0.13
Nodes (25): Ea(), xc(), yc(), af(), Ck(), Gf(), hc(), jf() (+17 more)

### Community 70 - "jszip.min.js"
Cohesion: 0.25
Nodes (22): A(), c(), d(), i(), n(), f(), h(), j() (+14 more)

### Community 71 - "en"
Cohesion: 0.10
Nodes (15): add(), buildTicks(), diff(), en, endOf(), format(), formats(), _generate() (+7 more)

### Community 72 - "react.production.min.js"
Cohesion: 0.14
Nodes (17): B(), C(), D(), E(), fa(), M(), N(), na() (+9 more)

### Community 73 - "IELTS Writing Lab"
Cohesion: 0.07
Nodes (27): Local data folder (app-state.json), Speaking under-length nudge + bilingual EN/VI feedback, AI Providers, Basic browser mode, Choose a Running Mode, Cloud examiner, Custom base model, Data and Privacy (+19 more)

### Community 74 - "12-app.jsx"
Cohesion: 0.31
Nodes (10): Study Plans (F1 daily plan + F2 multi-horizon AI planner), App(), DiagnosticPlacementModal(), FailoverToast(), GeminiRetryToast(), NAV_ITEMS, OnboardingWizard(), PasteStatusToast() (+2 more)

### Community 75 - "SpeakingPartPracticeSession"
Cohesion: 0.26
Nodes (11): buildPartPracticeTurns(), startRecording(), stopRecording(), SpeakingPartPracticeSession(), fetchPartQuestions(), finalizePractice(), retryScore(), startPractice() (+3 more)

### Community 76 - "IELTS Writing Lab TODO_LIST"
Cohesion: 0.25
Nodes (7): Current Consensus Before Further Debate, Debate Questions For Claude/Codex, IELTS Writing Lab TODO_LIST, Implementation Guardrails, Internet Research Signals, Possible Synthesis To Debate, Stronger Breakthrough Candidates To Debate

### Community 77 - "examiner.py"
Cohesion: 0.08
Nodes (26): AcousticFeatures, BandGap, _call_llm(), Evidence, ExaminerResult, FeedbackEN, FeedbackVI, _float_or_none() (+18 more)

### Community 78 - "cr"
Cohesion: 0.18
Nodes (12): cr(), hr(), yR(), ee(), Jd(), Kd(), Ld(), Md() (+4 more)

### Community 79 - "IELTS Writing Coach"
Cohesion: 0.15
Nodes (12): Anti-patterns (the short list), ASSESS & COACH workflow (summary), IELTS Writing Coach, Mode selection, Output shapes, Parsing the prompt (five fields), Reference index (load on demand), Rule 1 — How ideas are supported (the fabrication rule) (+4 more)

### Community 80 - "11-task2.jsx"
Cohesion: 0.18
Nodes (18): Writing micro-drills + pre-submit checklists + AI Example compare loop, normalizeTask1ExampleCompare(), PracticePage(), PracticeWorkspace(), task1DrillChecks(), Task1EssayChecklist(), Task1ExampleComparePanel(), Task1MicroDrills() (+10 more)

### Community 81 - "08-theory.jsx"
Cohesion: 0.39
Nodes (6): DEFAULT_THEORY_Q, ESSAY_PARTS, Task2TheoryView(), TheoryPage(), TheoryPartPractice(), WritingTheoryView()

### Community 82 - "00-vn-exam-data.js"
Cohesion: 0.22
Nodes (9): getRootPatches(), getSubPatches(), getVocabPatchList(), VN_DEFAULT_PATCHES, VN_DIAGNOSTIC_TEST, VN_EXAM_ROADMAPS, VN_EXAM_STRUCTURES, VN_EXAM_TESTS (+1 more)

### Community 83 - "09-writing-aid-display.js"
Cohesion: 0.39
Nodes (11): enforceWritingEssayParagraphs(), prepareWritingAidForDisplay(), writingAidCleanText(), writingAidCountWords(), writingAidInline(), writingAidJoinParagraphs(), writingAidNormalizeList(), writingAidNormalizeStructure() (+3 more)

### Community 84 - "WordCard"
Cohesion: 0.27
Nodes (10): _ansEq(), FillBlanks(), Loading(), MasteryDots(), PBar(), posToClass(), posToShort(), QuizMode() (+2 more)

### Community 85 - "users.md"
Cohesion: 0.12
Nodes (15): Conversation.txt (Claude+Codex multi-agent coordination log), Memorised / template essay detector (memorisedRisk), First-run onboarding wizard + learner-path rescue, 1. Trạng thái "MỚI BẮT ĐẦU" (Mất gốc hoặc mới nhập môn), 1. Trạng thái "MỚI BẮT ĐẦU" (Mất gốc hoặc mới nhập môn), 2. Trạng thái "BIẾT SƠ SƠ" (Band 4.0 - 5.0), 2. Trạng thái "BIẾT SƠ SƠ" (Band 4.0 - 5.0), 3. Trạng thái "TRUNG BÌNH" (Band 5.5 - 6.5) (+7 more)

### Community 86 - "IELTS Speaking Backend (Phase 1)"
Cohesion: 0.25
Nodes (8): Endpoints, ffmpeg requirement, IELTS Speaking Backend (Phase 1), Local Ollama examiner (Windows, no cloud API key), Phase 2 (not in this build), Setup (bash / Linux / macOS), Setup (Windows / PowerShell), Whisper model sizes

### Community 87 - "Tween"
Cohesion: 0.27
Nodes (10): _assertThisInitialized(), gc(), qa(), Timeline(), Tween(), ua(), va(), w() (+2 more)

### Community 88 - "06-dashboard.jsx"
Cohesion: 0.28
Nodes (12): Vocab progress counted by distinct headword, AWLProgressBars(), DashboardLearnerPathRescue(), DashboardMistakeJournal(), DashboardNextStep(), DashboardPage(), DashboardStudyPlan(), getAWLFamilyForms() (+4 more)

### Community 89 - "b"
Cohesion: 0.21
Nodes (35): ac(), ci(), df(), ef(), ff(), hf(), Kh(), Lh() (+27 more)

### Community 90 - "sg"
Cohesion: 0.50
Nodes (4): bg(), mg(), sg(), vg()

### Community 91 - "main.py"
Cohesion: 0.09
Nodes (17): _assign_voices(), _get_tts(), model_answer(), _ModelAnswerIn, next_examiner_turn(), _NextTurnIn, _norm_speaker(), _parse_turns() (+9 more)

### Community 92 - "Ce"
Cohesion: 0.07
Nodes (44): Nj(), Wa(), Ag(), bc(), be(), Cc(), cd(), Ce() (+36 more)

### Community 93 - "Qf"
Cohesion: 0.21
Nodes (14): ag(), AM(), eg(), fN(), Jf(), ng(), pg(), pN() (+6 more)

### Community 94 - "na"
Cohesion: 0.40
Nodes (6): aa(), ad(), jle(), na(), ra(), ta()

### Community 95 - "handleReadingFetchSource"
Cohesion: 0.29
Nodes (13): assertPublicReadingUrl(), fetchTextCapped(), handleAIProxy(), handleListeningImport(), handleMarkItDown(), handleReadingBrowserUseSource(), handleReadingFetchSource(), isBlockedReadingHost() (+5 more)

### Community 97 - "ja"
Cohesion: 0.28
Nodes (9): Aa(), Animation(), ha(), ja(), Jc(), Lc(), Ra(), Sa() (+1 more)

### Community 99 - "ni"
Cohesion: 0.39
Nodes (8): aa(), ni(), of(), pf(), Sb(), Ue(), yh(), zf()

### Community 100 - "11-full-test.jsx"
Cohesion: 0.60
Nodes (4): Full-test local grading hidden-checklist parity, FullTestGradeSummary, FullTestMode(), FullTestTaskEditor

### Community 101 - "gj"
Cohesion: 0.50
Nodes (5): gj(), pc(), pj(), Wj(), qj()

### Community 102 - "_d"
Cohesion: 0.31
Nodes (9): be(), _d(), ia(), ie(), je(), ke(), le(), oe() (+1 more)

### Community 103 - "Troubleshooting"
Cohesion: 0.40
Nodes (5): Folder storage or document import is unavailable, Local AI will not start, Local AI works for grading but not generation, Speaking scoring is unavailable, Troubleshooting

### Community 104 - "imageToText"
Cohesion: 0.32
Nodes (8): _arrayBufferToBase64(), callMarkItDown(), extractFileText(), imageToText(), _isImageFile(), MarkItDownUploader(), _normalizeOcrHomoglyphs(), PasteImageTextarea()

### Community 105 - ".toString"
Cohesion: 0.12
Nodes (17): bm(), cg(), cM(), dM(), ip(), jm(), lg(), f() (+9 more)

### Community 107 - "x"
Cohesion: 0.10
Nodes (33): Aw(), bz(), Cu(), cW(), cz(), d(), Du(), Ez() (+25 more)

### Community 108 - "da"
Cohesion: 0.09
Nodes (12): ca(), da(), Gi(), ii(), m(), ma, parseArrayData(), parseObjectData() (+4 more)

### Community 109 - "ebe"
Cohesion: 0.50
Nodes (4): ebe(), jbe(), pq(), xbe()

### Community 110 - "ua"
Cohesion: 0.50
Nodes (4): fa(), la(), pa(), ua()

### Community 111 - "ModelAnswerLibrary"
Cohesion: 0.25
Nodes (4): _findRelatedModelAnswers(), ModelAnswerLibrary(), RelatedModelAnswers(), _renderBoldHighlights()

### Community 112 - "wg"
Cohesion: 0.25
Nodes (3): wg(), f(), y()

### Community 113 - "useSkillWorkTabs"
Cohesion: 0.33
Nodes (7): cloneWorkDraft(), makeWorkTabId(), normalizeWorkTabState(), useSkillWorkTabs(), workDraftHasMeaningfulData(), WorkTabBar(), workTabTitle()

### Community 114 - "ml"
Cohesion: 0.38
Nodes (7): fl(), gl(), hl(), ml(), Ole(), pl(), yl()

### Community 115 - "mb"
Cohesion: 0.25
Nodes (8): cb(), DB(), hB(), IB(), mb(), OB(), xB(), yb()

### Community 116 - "savedSignature"
Cohesion: 0.40
Nodes (6): isItemSaved(), makeSavedItem(), savedSignature(), _savedSigs(), toggleSavedItem(), updateSavedItem()

### Community 117 - "ModelAnswerPanel"
Cohesion: 0.25
Nodes (6): AI scoring realism (closer to a real examiner), Current consensus / next steps, Deferred follow-ups (from the Model Answer Library work), Hesitation & pauses, Speaking — TODO / backlog, ModelAnswerPanel()

### Community 118 - "11-translate-widget.jsx"
Cohesion: 0.38
Nodes (8): TranslateWidget(), _twClampOffset(), _twCurrentPassageText(), _twExamModeActive(), _twNearestEdge(), _twPosStyle(), _twSnapToEdge(), _twTimeAgo()

### Community 119 - "an"
Cohesion: 0.33
Nodes (6): an(), gN(), IN(), nn(), rn(), un()

### Community 121 - "NF"
Cohesion: 0.40
Nodes (5): BF(), DF(), IF(), NF(), OF()

### Community 122 - "fs"
Cohesion: 0.33
Nodes (3): fs(), sa(), xe()

### Community 123 - "11-settings.jsx"
Cohesion: 0.60
Nodes (4): Storage/import safety (backup validation + quota toast), LocalGraderCard(), SettingsPage(), SharedStorageBanner()

### Community 124 - "Listening real audio via Supertonic TTS (single + multi-voice dialogue)"
Cohesion: 0.50
Nodes (4): Listening real audio via Supertonic TTS (single + multi-voice dialogue), faster-whisper ASR (local STT), Speaking backend requirements.txt, Supertonic on-device TTS (optional)

### Community 125 - "Vf"
Cohesion: 0.50
Nodes (4): Gf(), ig(), Vf(), Wf()

### Community 126 - "09-writing-calibration.jsx"
Cohesion: 0.40
Nodes (8): _crudeXmlToText(), extractDocxText(), runMarkers(), walk(), loadJSZip(), _localName(), MarkingCalibrationPage(), _wAttr()

### Community 127 - "AK"
Cohesion: 0.67
Nodes (3): makeStorageBundle(), AK(), SK()

### Community 129 - "ly"
Cohesion: 0.67
Nodes (3): ly(), py(), uy()

### Community 130 - "sn"
Cohesion: 0.67
Nodes (3): sn(), a(), wN()

## Knowledge Gaps
- **34 isolated node(s):** `Local data folder (app-state.json)`, `Vendor + CDN fallback loader`, `tut.txt (run instructions)`, `Conversation.txt (Claude+Codex multi-agent coordination log)`, `Next Band Blocker (target-aware writing trainer)` (+29 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 670 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `h()` connect `w` to `babel.min.js`, `a`, `il`, `O`, `jszip.min.js`, `x`, `chart.umd.min.js`, `react-dom.production.min.js`, `m`, `b`, `ae`, `n`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **Are the 317 inferred relationships involving `xie()` (e.g. with `_0()` and `_1()`) actually correct?**
  _`xie()` has 317 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Local data folder (app-state.json)`, `Vendor + CDN fallback loader`, `tut.txt (run instructions)` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `babel.min.js` be split into smaller, more focused modules?**
  _Cohesion score 0.009417125498386178 - nodes in this community are weakly interconnected._
- **Why does `Study Plans (F1 daily plan + F2 multi-horizon AI planner)` connect `12-app.jsx` to `06-dashboard.jsx`, `04-state.js`, `02-api.js`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Are the 58 inferred relationships involving `a()` (e.g. with `babel.min.js` and `ad()`) actually correct?**
  _`a()` has 58 INFERRED edges - model-reasoned connections that need verification._
- **Should `04-state.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11363636363636363 - nodes in this community are weakly interconnected._