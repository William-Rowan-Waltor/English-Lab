const IELTS_WRITING_SOURCE_NOTE = "Aligned to public IELTS Writing band-descriptor concepts; not an official IELTS examiner score.";

function writingCriteria(taskType) {
  return taskType==="task2"
    ? [{k:"tr",n:"TR",full:"Task Response"},{k:"cc",n:"CC",full:"Coherence & Cohesion"},{k:"lr",n:"LR",full:"Lexical Resource"},{k:"gra",n:"GRA",full:"Grammatical Range & Accuracy"}]
    : [{k:"ta",n:"TA",full:"Task Achievement"},{k:"cc",n:"CC",full:"Coherence & Cohesion"},{k:"lr",n:"LR",full:"Lexical Resource"},{k:"gra",n:"GRA",full:"Grammatical Range & Accuracy"}];
}

function criterionBand(result, key) {
  if (!result) return null;
  const item = result[key] || (key==="tr" ? result.ta : null);
  return item?.band ?? null;
}

function normalizeCriterion(value) {
  const v = value && typeof value==="object" ? value : {};
  return {
    band: Number(v.band)||0,
    strengths: Array.isArray(v.strengths) ? v.strengths : [],
    weaknesses: Array.isArray(v.weaknesses) ? v.weaknesses : [],
    evidence: Array.isArray(v.evidence) ? v.evidence : [],
    whyNotHigher: v.whyNotHigher || v.why_not_higher || ""
  };
}

function roundWritingBand(n) {
  return Math.round((Number(n)||0)*2)/2;
}

function normalizeMistakeCorrections(items) {
  if (!Array.isArray(items)) return [];
  return items.map(x=>{
    if (typeof x==="string") return {original:"",fixed:"",issue:"Correction",explanation:x};
    return {
      original: String(x?.original || x?.before || x?.error || "").trim(),
      fixed: String(x?.fixed || x?.after || x?.correction || "").trim(),
      issue: String(x?.issue || x?.type || x?.category || "Correction").trim(),
      explanation: String(x?.explanation || x?.why || x?.comment || "").trim()
    };
  }).filter(x=>x.original || x.fixed || x.explanation);
}

function examinerScoreSummary(result, taskType) {
  const a = result?.examinerA?.overall ?? result?.examinerA?.band;
  const b = result?.examinerB?.overall ?? result?.examinerB?.band;
  const final = result?.overall;
  const nums = [a,b,final].filter(x=>Number.isFinite(Number(x))).map(Number);
  if (!nums.length) return null;
  const low = roundWritingBand(Math.min(...nums));
  const high = roundWritingBand(Math.max(...nums));
  const spread = high - low;
  return {
    low, high, spread,
    label: spread <= .5 ? "High confidence" : spread <= 1 ? "Moderate confidence" : "Low confidence",
    note: taskType==="task2" ? "Task 2 score is still weighted twice in full Writing." : "Task 1 contributes one third of the full Writing score."
  };
}

function defaultTaskAudit(taskType, wordCount) {
  if (taskType==="task2") {
    return [
      {label:"All parts answered",status:"review",note:"Check whether each part of the prompt is explicitly addressed."},
      {label:"Clear position",status:"review",note:"Position should remain stable from introduction to conclusion."},
      {label:"Ideas developed",status:"review",note:"Body paragraphs need explanation plus relevant examples."},
      {label:"Word count",status:wordCount>=250?"pass":"warning",note:wordCount>=250?"Meets the 250+ word target.":"Below the 250-word exam target."}
    ];
  }
  return [
    {label:"Overview present",status:"review",note:"Task 1 needs a clear overall summary of main trends/features."},
    {label:"Key features selected",status:"review",note:"Do not describe every number; choose the most important comparisons."},
    {label:"Data accuracy",status:"review",note:"Figures and units should match the visual exactly."},
    {label:"Word count",status:wordCount>=150?"pass":"warning",note:wordCount>=150?"Meets the 150+ word target.":"Below the 150-word exam target."}
  ];
}

// — Precise mistakes: categories + deterministic detector + model-mistake normaliser —
function writingAuthenticityRules(mode="assess", taskType="task2") {
  const taskRule = taskType==="task1"
    ? "Task 1: use only the supplied visual/data context. Do not invent hidden figures, sources, trends, or outside research."
    : "Task 2: support ideas with prompt-specific reasoning, plausible examples, hypotheticals, or personal experience. Do not invent precise studies, percentages, institutions, or citations.";
  const modeRule = mode==="example"
    ? "The sample answer is exam-realistic: a strong candidate response to learn from, not polished academic prose and not a memorised template."
    : mode==="rewrite"
      ? "Rewrite coaching must preserve the student's position, examples, and intended meaning; improve the scoring moves instead of replacing the answer with a generic model."
      : mode==="plan"
        ? "Planning support must be prompt-specific: help the learner build ideas and scoring moves, not reusable sentence templates."
        : "Assess like a conservative examiner: reward prompt-specific development and penalize off-topic, memorised, or template-driven content.";
  return `${modeRule}
${taskRule}
Authenticity rule: normal IELTS paragraphing and concise signposting are fine; generic essay-bank openings, padded conclusions, interchangeable examples, fake research, and over-rehearsed linking should lower the relevant task-response/achievement judgement.
Research-grounding rule: use general topic knowledge only backstage; turn it into concrete plausible scenarios/examples, never exam-body URLs, study names, or invented statistics.
Band calibration rule: do not inflate. If evidence is mixed, choose the lower plausible half-band and name the capping criterion.`;
}

function writingExampleQualityRules(taskType, targetBand=7) {
  const target = Number(targetBand) || 7;
  const ceiling = Math.min(9, Math.round((target + 0.5) * 2) / 2);
  const taskSpecific = taskType==="task1"
    ? "Use the supplied visual data only, select key features, and keep every body paragraph anchored by exact data points or comparisons from the prompt."
    : "Use one clear position and one focused idea per body paragraph. Body 1 and Body 2 must EACH contain at least one concrete plausible example, scenario, or personal/hypothetical case. Avoid fake statistics or named studies.";
  return `${writingAuthenticityRules("example", taskType)}
Target band: aim around Band ${target.toFixed(1)}-${ceiling.toFixed(1)}; do not overshoot into unrealistically advanced prose.
${taskSpecific}
Authenticity pass: remove generic openings, padded conclusions, rule-of-three filler, and mechanical connectors that do not add logic.
Useful phrases must be short adaptable chunks, not full sentences to memorise.`;
}

function writingCriterionFaultRules(taskType) {
  const first = taskType==="task2" ? "Task Response" : "Task Achievement";
  const taskSupport = taskType==="task2"
    ? "If either Task 2 body paragraph lacks a concrete example/scenario or only repeats an abstract claim, cap Task Response around 6.5 unless the explanation is otherwise very fully developed; lower it further if the answer is generic or off prompt."
    : "If Task 1 body paragraphs lack accurate data support/comparisons from the visual, cap Task Achievement around 6.5; lower it further for invented figures, missing overview, or weak key-feature selection.";
  return `Criterion fault-hunting rule: before assigning bands, actively look for scoring faults in all four criteria (${first}, CC, LR, GRA). Do not let fluent, natural prose hide weak task fulfilment, thin support, mechanical cohesion, basic/repeated lexis, collocation errors, or recurring grammar control problems.
For every criterion below 8.0, include at least one concrete weakness and whyNotHigher with evidence from the essay.
${taskSupport}
Overall score rule: the final overall must be the rounded average of the four criterion bands, not a generous holistic impression.`;
}

function task2ExampleParagraphs(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n+/)
    .map(p => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function task2ExampleSentences(text) {
  if (typeof writingAidSplitSentences === "function") return writingAidSplitSentences(text);
  return String(text || "").replace(/\n+/g, " ").match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g)?.map(s=>s.trim()).filter(Boolean) || [];
}

function task2SentenceHasExample(sentence) {
  const s = String(sentence || "").toLowerCase();
  return /\b(for example|for instance|a hypothetical scenario|a city like|a country like|a student who|a person who|a family|a parent|an employee|a worker|a school|a local council|a small business|a household|a company (?:that|which)|a friend of mine|in my experience|consider a|imagine a|suppose a|take the case of|such as a)\b/.test(s);
}

function task2ExampleHasFakeCitation(text) {
  const s = String(text || "");
  return /\b(?:study|survey|report|research|data)\b.{0,60}\b(?:19|20)\d{2}\b/i.test(s) ||
    /\b(?:Harvard|Oxford|Cambridge|OECD|UNESCO|World Bank)\b/i.test(s) ||
    /\bWHO\b/.test(s) || // case-sensitive: /i would also match the relative pronoun "who"
    /\b\d{2,3}\s*%\b/.test(s);
}

function task2BodyStartsBadly(sentence) {
  return /^(for example|for instance|as an example|a city like|one example|this example|as a result|therefore|furthermore|moreover|in addition|besides|another example)\b/i.test(String(sentence || "").trim());
}

function task2BodyHasFinalLink(sentence) {
  return /\b(this (?:shows|means|would|is why|makes|helps|protects|supports|suggests|demonstrates|proves|illustrates|indicates|highlights|reveals|confirms|underscores|reflects|ensures)|(?:which|that) (?:shows|means|makes|helps|explains|suggests|demonstrates|proves|illustrates|indicates)|therefore|as a result|in this way|for this reason|consequently|ultimately|thus|hence|in turn|in doing so|so\b)/i.test(String(sentence || ""));
}

// Single-paragraph structure check (topic sentence -> explanation -> concrete example -> final link).
// Shared by the AI Example audit (per body) and the Band-7 Drill (student's own paragraph).
function auditBodyParagraphStructure(bodyText, label="Body") {
  const sentences = task2ExampleSentences(bodyText);
  const first = sentences[0] || "";
  const exampleIndex = sentences.findIndex(task2SentenceHasExample);
  const final = sentences[sentences.length - 1] || "";
  const check = {label, sentenceCount:sentences.length, exampleIndex, issues:[]};
  if (sentences.length < 4) check.issues.push(`${label} needs topic sentence, explanation, concrete example, and final link.`);
  if (task2BodyStartsBadly(first)) check.issues.push(`${label} starts with an example/mechanical connector instead of a real topic sentence.`);
  if (exampleIndex < 0) check.issues.push(`${label} needs a concrete plausible example or scenario.`);
  else if (exampleIndex < 2) check.issues.push(`${label} needs explanation/support before the example.`);
  if (exampleIndex >= 0 && exampleIndex >= sentences.length - 1) {
    // Example is the last sentence: acceptable if that same sentence already links back (combined example+link close).
    if (!task2BodyHasFinalLink(sentences[exampleIndex])) check.issues.push(`${label} needs a final linking sentence after the example.`);
  }
  else if (exampleIndex >= 0 && !task2BodyHasFinalLink(final)) check.issues.push(`${label} final sentence should link the example back to the main argument/prompt.`);
  return {...check, ok:check.issues.length===0};
}

function auditTask2ExampleStructure(dataOrEssay) {
  const essay = typeof dataOrEssay === "string" ? dataOrEssay : (dataOrEssay?.essay || dataOrEssay?.answer || "");
  const paragraphs = task2ExampleParagraphs(essay);
  const issues = [];
  const bodyChecks = [];
  if (paragraphs.length < 4) issues.push("Task 2 example needs 4 clear paragraphs: introduction, Body 1, Body 2, conclusion.");
  if (task2ExampleHasFakeCitation(essay)) issues.push("Remove fake-looking citations, named studies, precise statistics, or institutional claims.");
  const bodies = paragraphs.length >= 4 ? [paragraphs[1], paragraphs[2]] : paragraphs.slice(1, 3);
  bodies.forEach((body, index) => {
    const check = auditBodyParagraphStructure(body, `Body ${index + 1}`);
    if (check.issues.length) issues.push(...check.issues);
    bodyChecks.push(check);
  });
  if (bodies.length < 2) issues.push("Task 2 example needs two body paragraphs.");
  return {ok:issues.length===0, issues, paragraphCount:paragraphs.length, bodyChecks};
}

async function ensureTask2ExampleQuality(config, promptContext, data, targetBand=7) {
  const prepared = typeof prepareWritingAidForDisplay === "function"
    ? prepareWritingAidForDisplay(data, "example", "task2")
    : data;
  const originalAudit = auditTask2ExampleStructure(prepared);
  if (originalAudit.ok) return {...prepared, exampleAudit:originalAudit};
  if (!config) throw new Error(`AI Example failed structure audit: ${originalAudit.issues.join("; ")}`);
  const sys = `You are an IELTS Writing Task 2 model-answer editor. Rewrite the sample so it passes a strict structure audit. Return ONLY valid JSON.`;
  const schema = typeof writingExampleSchemaJSON === "function"
    ? writingExampleSchemaJSON("task2")
    : `{"title":"short title","bandTarget":"Band ${targetBand}+","essay":"Task 2 model answer","wordCount":285,"bodyExamples":["Body 1 example","Body 2 example"],"whyItWorks":["specific reason"],"usefulPhrases":["short phrase"],"topicVocabulary":[]}`;
  const MAX_REWRITES = 2;
  let current = prepared;
  let audit = originalAudit;
  for (let attempt = 1; attempt <= MAX_REWRITES; attempt++) {
    const raw = await callAPI(config,[
      {role:"system",content:sys},
      {role:"user",content:`PROMPT CONTEXT:
${promptContext || "(missing)"}

FAILED AUDIT:
${audit.issues.map(x=>`- ${x}`).join("\n")}

BAD SAMPLE TO FIX:
${current?.essay || ""}

Rewrite requirements:
- Keep the student's target around Band ${Number(targetBand)||7}; do not overshoot into Band 8+ prose.
- Use exactly 4 clear paragraphs: Introduction, Body 1, Body 2, Conclusion.
- Body 1 and Body 2 must follow this order: topic sentence/main idea -> explanation/supporting idea -> concrete plausible example/scenario -> final sentence linking back to the prompt/position.
- Do NOT start a body paragraph with "For example", "For instance", "Furthermore", "Moreover", "As a result", or a named example.
- Use plausible unsourced examples/scenarios only. No fake studies, no precise statistics, no URLs, no named institutions as evidence.

Return JSON schema:
${schema}`}
    ],3000,0.15);
    const revisedRaw = normalizeWritingAidResult(safeJSON(raw), "example");
    const revised = typeof prepareWritingAidForDisplay === "function"
      ? prepareWritingAidForDisplay(revisedRaw, "example", "task2")
      : revisedRaw;
    const revisedAudit = auditTask2ExampleStructure(revised);
    current = revised;
    audit = revisedAudit;
    if (revisedAudit.ok) return {...revised, exampleAudit:revisedAudit, originalExampleAudit:originalAudit};
  }
  throw new Error(`AI Example failed structure audit after rewrite: ${audit.issues.join("; ")}`);
}

// — Band-7 Digital Twin drill: Self-Correct -> Replay -> Retest (Writing/Task 2 v1) —
// Deterministic paragraph picker: prefers a Task 2 body paragraph that actually fails the
// structure audit, biased toward the one matching the essay's cappingCriterion. Falls back to
// treating the whole essay as one unit if clean blank-line paragraphs cannot be detected.
function pickBand7DrillParagraph(entry) {
  const essay = entry?.essay || "";
  const paragraphs = task2ExampleParagraphs(essay);
  if (paragraphs.length < 4) {
    return {paragraph: essay, index: -1, label: "Your essay", audit: auditBodyParagraphStructure(essay, "Your essay"), source: "whole-essay"};
  }
  const criterion = entry?.gradeResult?.cappingCriterion?.criterion || "";
  const bodies = [
    {paragraph: paragraphs[1], index: 1, label: "Body 1"},
    {paragraph: paragraphs[2], index: 2, label: "Body 2"}
  ].map(b => ({...b, audit: auditBodyParagraphStructure(b.paragraph, b.label)}));
  const failing = bodies.filter(b => !b.audit.ok);
  if (failing.length) {
    // If cappingCriterion mentions development/support/evidence-style wording, prefer the failing
    // body with more issues (more concretely broken); otherwise just take the first failing body.
    return failing.sort((a, b) => b.audit.issues.length - a.audit.issues.length)[0];
  }
  // Both bodies structurally pass - still worth drilling if there's a capping criterion to react to.
  return bodies[0];
}

// Zero-AI, zero-hallucination-risk question generated straight from the structural audit facts
// (per research: self-generation before reveal beats a cold "here's the answer" recast).
function band7SocraticQuestion(pick) {
  const issues = pick?.audit?.issues || [];
  const has = (needle) => issues.some(i => i.includes(needle));
  if (has("starts with an example")) return {question: "What is the ONE main idea of this paragraph? Rewrite the opening sentence to state it directly, without leading with an example.", basis: "opens with an example/connector instead of a topic sentence"};
  if (has("needs a concrete plausible example")) return {question: "Where is the concrete example or scenario in this paragraph? Add one now - a specific person, place, or situation, not a general claim.", basis: "no example detected"};
  if (has("needs explanation/support before the example")) return {question: "Before your example, add one sentence explaining WHY this happens or WHY it matters.", basis: "example arrives too early with no supporting explanation first"};
  if (has("final linking sentence") || has("final sentence should link")) return {question: "Add one final sentence that explicitly connects your example back to your main position.", basis: "no sentence links the example back to the argument"};
  if (pick?.audit && !pick.audit.ok) return {question: "This paragraph is under-developed. Rewrite it with a clear topic sentence, one explanation, one concrete example, and a final link back to your position.", basis: "short/under-structured paragraph"};
  const reason = pick?.cappingCriterionReason || "";
  return {question: reason ? `Your last grade said: "${reason}" Rewrite this paragraph to directly fix that.` : "Rewrite this paragraph to make its main idea, support, and example more concrete.", basis: "structurally passes; reacting to prior grade feedback"};
}

function band7ReplayRules(taskType) {
  return `${writingAuthenticityRules("rewrite", taskType)}
Hard gates for this reveal:
- Preserve the student's exact stance/main idea - do not replace it with a different opinion or a generic one.
- Every transformation must be tied to the exact original sentence(s) it replaces - no vague "improved version" claims.
- The rewritten paragraph must have: topic sentence -> explanation/support -> concrete example -> final sentence linking back to the position.
- If you add a new example/support that was not in the original, label it explicitly as an addition - never present it as if the student already had it.
- Do not overshoot into unnaturally advanced Band 8+ prose; stay a believable next-band step up.`;
}

async function generateBand7Replay(config, opts) {
  const {promptContext, paragraph, selfRewrite="", paragraphLabel="paragraph", targetBand=7, taskType="task2"} = opts || {};
  if (!config) throw new Error("AI config required for Band-7 Replay.");
  const sys = `You are an IELTS Writing coach producing a "Band-7 version of the student's own ${paragraphLabel}".
${band7ReplayRules(taskType)}
Return ONLY valid JSON: {"replayParagraph":"the rewritten paragraph, same stance/idea, 4-6 sentences","transformations":[{"original":"exact original sentence or phrase","revised":"what it becomes","why":"one short reason"}],"newAdditions":["any wording added that was not implied by the original, or empty array if none"]}`;
  const MAX_ATTEMPTS = 2;
  let lastAudit = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const raw = await callAPI(config, [
      {role: "system", content: sys},
      {role: "user", content: `PROMPT CONTEXT:
${promptContext || "(missing)"}

STUDENT'S ORIGINAL ${paragraphLabel.toUpperCase()}:
${paragraph}

STUDENT'S SELF-REWRITE BEFORE REVEAL:
${selfRewrite || "(not provided)"}
${lastAudit ? `\nYour last attempt failed the structure audit:\n${lastAudit.issues.map(x => `- ${x}`).join("\n")}\nFix these specific issues while still following all hard gates.` : ""}

Target band: aim around Band ${Number(targetBand) || 7}.
Use the self-rewrite as contrast: note improvements the learner attempted, but make the replay paragraph the clearest next-band version of the original idea.`}
    ], 1400, 0.2);
    const data = safeJSON(raw) || {};
    const replayParagraph = String(data.replayParagraph || "").trim();
    const audit = auditBodyParagraphStructure(replayParagraph, paragraphLabel);
    lastAudit = audit;
    if (audit.ok) {
      return {
        replayParagraph,
        transformations: Array.isArray(data.transformations) ? data.transformations : [],
        newAdditions: Array.isArray(data.newAdditions) ? data.newAdditions : [],
        audit
      };
    }
  }
  throw new Error(`Band-7 Replay failed structure audit after rewrite: ${lastAudit?.issues?.join("; ") || "unknown"}`);
}

const BAND7_RETEST_PROMPTS = [
  {
    type: "opinion",
    prompt: "Some people believe that cities should spend more money on public parks and green spaces, while others think this money should be used for housing and roads. To what extent do you agree or disagree?",
    keywords: ["cities", "parks", "green", "housing", "roads", "public"]
  },
  {
    type: "discussion",
    prompt: "Some people think schools should focus mainly on academic subjects, while others believe practical life skills are equally important. Discuss both views and give your own opinion.",
    keywords: ["schools", "academic", "subjects", "practical", "life", "skills"]
  },
  {
    type: "problem_solution",
    prompt: "Many young people spend less time doing physical activity than previous generations. What problems does this cause, and what solutions could help?",
    keywords: ["young", "physical", "activity", "problems", "solutions", "health"]
  },
  {
    type: "advantages",
    prompt: "More companies now allow employees to work from home for part of the week. Do the advantages of this trend outweigh the disadvantages?",
    keywords: ["companies", "employees", "home", "work", "advantages", "disadvantages"]
  },
  {
    type: "two_part",
    prompt: "In many countries, people are buying more products online than in local shops. Why is this happening, and is it a positive or negative development?",
    keywords: ["online", "shops", "products", "buying", "positive", "negative"]
  },
  {
    type: "posneg",
    prompt: "Artificial intelligence is increasingly used in education and workplaces. Is this a positive or negative development?",
    keywords: ["artificial", "intelligence", "education", "workplaces", "positive", "negative"]
  }
];

function _band7PromptIndex(seed) {
  const text = String(seed || "");
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h % BAND7_RETEST_PROMPTS.length;
}

function buildBand7RetestPrompt(entry) {
  const source = String(entry?.promptText || entry?.questionData?.prompt || "");
  const picked = BAND7_RETEST_PROMPTS[_band7PromptIndex(`${entry?.id || ""}:${source}`)];
  return {
    ...picked,
    instruction: "Write ONE fresh Task 2 body paragraph for this new prompt. Keep the full essay out of scope: topic sentence -> explanation/support -> concrete example -> final link back to the prompt."
  };
}

function auditBand7RetestParagraph(text, mission) {
  const structure = auditBodyParagraphStructure(text, "Retest");
  const lower = String(text || "").toLowerCase();
  const keywords = (mission?.retestPromptKeywords || []).filter(Boolean);
  const hits = keywords.filter(k => lower.includes(String(k).toLowerCase()));
  const minHits = keywords.length >= 4 ? 2 : (keywords.length ? 1 : 0);
  const issues = [...(structure.issues || [])];
  if (minHits && hits.length < minHits) {
    issues.push("needs clearer relevance to the retest prompt/topic");
  }
  return {
    ...structure,
    ok: issues.length === 0,
    issues,
    promptKeywordHits: hits
  };
}

// Mission metadata schema agreed with Codex in TODO_LIST.md Round 2 consensus.
function buildBand7Mission(entry, pick, dueInDays=3) {
  const weaknessKey = entry?.gradeResult?.cappingCriterion?.criterion
    ? String(entry.gradeResult.cappingCriterion.criterion).toLowerCase().replace(/\s+/g, "-")
    : "general";
  const retest = buildBand7RetestPrompt(entry);
  return {
    type: "band7-replay",
    skill: "writing",
    weaknessKey,
    sourceEssayId: entry?.id,
    sourceParagraphIndex: pick?.index ?? -1,
    retestPrompt: retest.prompt,
    retestPromptType: retest.type,
    retestPromptKeywords: retest.keywords,
    retestInstruction: retest.instruction,
    dueAt: Date.now() + Math.max(1, Number(dueInDays) || 3) * 86400000,
    passCondition: "body-has-topic-support-example-link-and-prompt-fit",
    status: "scheduled"
  };
}

function writingRewriteCoachRules(taskType) {
  return `${writingAuthenticityRules("rewrite", taskType)}
Compare the rewrite against the original feedback and the exact prompt. Judge whether the student's own idea became clearer, better supported, and easier to score.`;
}

function writingAssessmentSchemaAdditions(taskType) {
  const firstName = taskType==="task2" ? "Task Response" : "Task Achievement";
  return `"cappingCriterion":{"criterion":"${firstName}|Coherence & Cohesion|Lexical Resource|Grammatical Range & Accuracy","band":6.5,"reason":"why this criterion currently caps the essay"},"promptFit":{"summary":"how well the essay answers this exact prompt","covered":["prompt demand covered"],"missing":["prompt demand missing or weak"],"offTopic":["irrelevant or memorised content"],"scoreImpact":"how prompt fit affected ${firstName}"},"memorisedRisk":{"level":"low|medium|high","signals":["concrete sign this looks memorised/template, or empty if genuine"],"note":"one line on whether this reads as a genuine answer to THIS prompt"}`;
}

const MISTAKE_CATS = {
  logic:       {label:"Weak logic between ideas", color:"var(--rose)"},
  cohesion:    {label:"Cohesion / linking",       color:"var(--honey)"},
  evidence:    {label:"Weak evidence / example",  color:"var(--honey)"},
  explanation: {label:"Unclear explanation",      color:"var(--sky)"},
  vocabulary:  {label:"Low lexical sophistication",color:"var(--orchid)"},
  collocation: {label:"Unnatural collocation / misused word",color:"var(--orchid)"},
  repetition:  {label:"Repeated wording",         color:"var(--honey)"},
  grammar:     {label:"Grammar",                  color:"var(--rose)"},
  coherence:   {label:"Incoherent / hard to follow",color:"var(--rose)"}
};
const _MISTAKE_STOPWORDS = new Set("the a an and or but so to of in on at for with as is are was were be been being it its this that these those i you he she they we my your his her their our me him them us do does did have has had will would can could should may might must not no nor than then there here which who whom whose what when where why how all any some such only own same too very just more most much many few also into from out about over under again because however therefore thus moreover furthermore".split(/\s+/));
function _mistakeCategory(c) {
  c = String(c||"").toLowerCase().trim();
  if (MISTAKE_CATS[c]) return c;
  if (/cohes|link|connect|transition|signpost/.test(c)) return "cohesion";
  if (/logic|reason|argu|contradict/.test(c)) return "logic";
  if (/evidence|example|support|develop|elaborat/.test(c)) return "evidence";
  if (/explain|explanation|clarity|unclear|vague|ambigu/.test(c)) return "explanation";
  if (/colloc|word\s*pairing|unnatural|misused|wrong word|awkward phras/.test(c)) return "collocation";
  if (/vocab|lexical|word choice|sophistic|simplistic|basic word/.test(c)) return "vocabulary";
  if (/repeat|repetit|overus/.test(c)) return "repetition";
  if (/gramm|tense|article|agreement|punctuat|spelling/.test(c)) return "grammar";
  if (/coheren|flow|confus|hard to follow|disjoint/.test(c)) return "coherence";
  return "explanation";
}

// Deterministic, AI-free checks: overused words, repeated sentence openers, run-on sentences.
function detectMechanicalIssues(essay) {
  const text = String(essay||"");
  const words = text.toLowerCase().match(/[a-z][a-z'-]*/g) || [];
  const total = words.length;
  const freq = {};
  for (const w of words) { if (w.length < 4 || _MISTAKE_STOPWORDS.has(w)) continue; freq[w] = (freq[w]||0)+1; }
  const threshold = total > 220 ? 5 : 4;
  const repeatedWords = Object.entries(freq).filter(([,c])=>c>=threshold).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([word,count])=>({word,count}));
  const sentences = text.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean);
  const openerCount = {};
  sentences.forEach(s=>{ const m=s.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?)/); if(m){ const k=m[1].toLowerCase(); openerCount[k]=(openerCount[k]||0)+1; } });
  const repeatedOpeners = Object.entries(openerCount).filter(([,c])=>c>=3).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([opener,count])=>({opener,count}));
  const longSentences = sentences.filter(s=>(s.match(/[a-z][a-z'-]*/gi)||[]).length>=45).slice(0,3).map(s=>s.length>90?s.slice(0,90)+"…":s);
  return { repeatedWords, repeatedOpeners, longSentences, wordCount: total };
}
function normalizeMistakes(raw, essay) {
  const arr = Array.isArray(raw) ? raw : [];
  const text = String(essay||"");
  const out = [];
  for (const m of arr) {
    if (!m) continue;
    const quote = String(m.quote||m.sentence||m.text||"").trim();
    if (!quote) continue;
    const ql = quote.toLowerCase();
    // Drop template/placeholder echoes (the model sometimes parrots the format example).
    if (quote.startsWith("<") || ql.includes("exact words") || ql.includes("copied from the essay") || ql.includes("words copied") || ql==="quote" || ql==="exact sentence") continue;
    let fix = String(m.fix||m.suggestion||m.comment||m.why||"").trim();
    if (fix.startsWith("<") || /^short fix$/i.test(fix)) fix = "";
    out.push({
      category: _mistakeCategory(m.category||m.tag||m.type),
      quote: quote.slice(0,220),
      fix: fix.slice(0,220),
      inEssay: text ? text.includes(quote.slice(0,40)) : false
    });
    if (out.length >= 10) break;
  }
  return out;
}

function normalizeWritingExaminerResult(raw, taskType, essay) {
  const result = raw?.final && typeof raw.final==="object" ? {...raw.final, ...raw, final:raw.final} : {...(raw||{})};
  const criteria = writingCriteria(taskType);
  criteria.forEach(({k})=>{
    const source = result[k] || (k==="tr" ? result.ta : null);
    result[k] = normalizeCriterion(source);
  });
  if (taskType==="task2") result.ta = result.tr;
  const criterionBands = criteria.map(c=>Number(result[c.k]?.band)||0).filter(b=>b>0);
  const criterionOverall = criterionBands.length ? roundWritingBand(criterionBands.reduce((sum,b)=>sum+b,0)/criterionBands.length) : 0;
  const modelOverall = Number(result.overall);
  result.overall = criterionOverall
    ? (Number.isFinite(modelOverall) && modelOverall > 0 ? roundWritingBand(Math.min(modelOverall, criterionOverall)) : criterionOverall)
    : roundWritingBand(modelOverall);
  if (!result.overallComment) result.overallComment = "Estimated band based on IELTS public descriptor concepts.";
  if (!result.topPriority) result.topPriority = "Improve the weakest criterion with a focused rewrite.";
  if (!result.topStrength) result.topStrength = "Review the criterion breakdown for the strongest feature.";
  if (!Array.isArray(result.annotations)) result.annotations = [];
  result.annotations = result.annotations.filter(a=>a && a.sentence && essay.includes(a.sentence));
  // Precise mistakes: model-reported list (preferred) → fall back to error/improve annotations.
  result.mistakes = normalizeMistakes(result.mistakes, essay);
  if (!result.mistakes.length) {
    result.mistakes = result.annotations
      .filter(a=>a.tag==="error"||a.tag==="improve")
      .slice(0,6)
      .map(a=>({category:a.tag==="error"?"grammar":"explanation", quote:String(a.sentence).slice(0,220), fix:String(a.comment||"").slice(0,220), inEssay:true}));
  }
  result.mechanicalIssues = detectMechanicalIssues(essay);
  result.fixedEssay = typeof result.fixedEssay==="string" ? enforceWritingEssayParagraphs(result.fixedEssay, taskType) : "";
  result.fixedEssayError = result.fixedEssayError || "";
  result.mistakeCorrections = normalizeMistakeCorrections(result.mistakeCorrections || result.corrections || result.fixedEssayCorrections);
  if (!Array.isArray(result.topicRelevantUnusedAWL)) result.topicRelevantUnusedAWL = [];
  if (!result.promptFit || typeof result.promptFit!=="object") result.promptFit = {};
  result.promptFit = {
    summary: result.promptFit.summary || "Prompt alignment was not returned by the examiner.",
    covered: Array.isArray(result.promptFit.covered) ? result.promptFit.covered : [],
    missing: Array.isArray(result.promptFit.missing) ? result.promptFit.missing : [],
    offTopic: Array.isArray(result.promptFit.offTopic) ? result.promptFit.offTopic : [],
    scoreImpact: result.promptFit.scoreImpact || ""
  };
  { const mr = result.memorisedRisk && typeof result.memorisedRisk==="object" ? result.memorisedRisk : {};
    const lvl = String(mr.level||"").toLowerCase();
    result.memorisedRisk = {
      level: (lvl==="high"||lvl==="medium"||lvl==="low") ? lvl : "low",
      signals: Array.isArray(mr.signals) ? mr.signals.filter(Boolean).slice(0,6) : [],
      note: mr.note || ""
    };
  }
  { const cap = result.cappingCriterion && typeof result.cappingCriterion==="object" ? result.cappingCriterion : {};
    const lowest = criteria.reduce((best,c)=>(Number(result[c.k]?.band)||10) < (Number(result[best.k]?.band)||10) ? c : best, criteria[0]);
    result.cappingCriterion = {
      criterion: String(cap.criterion || cap.name || lowest.full || "").trim(),
      band: Number(cap.band) || Number(result[lowest.k]?.band) || 0,
      reason: String(cap.reason || cap.note || result[lowest.k]?.whyNotHigher || result.topPriority || "").trim()
    };
  }
  if (!Array.isArray(result.taskAudit)) result.taskAudit = defaultTaskAudit(taskType, essay.trim().split(/\s+/).filter(Boolean).length);
  if (!result.band7GapDrill || typeof result.band7GapDrill!=="object") {
    result.band7GapDrill = {
      title:"Band 7 gap rewrite",
      targetCriterion:criteria.sort((a,b)=>(result[a.k]?.band||0)-(result[b.k]?.band||0))[0]?.full || "weakest criterion",
      instruction:"Rewrite the weakest paragraph once, focusing only on the criterion with the lowest band.",
      successCheck:"The rewritten version should be clearer, more specific, and easier to score at Band 7."
    };
  }
  result.confidence = result.confidence || examinerScoreSummary(result, taskType);
  result.sourceNote = result.sourceNote || IELTS_WRITING_SOURCE_NOTE;
  return result;
}

async function ensureWritingFixResult(config, taskType, promptContext, essay, result) {
  if (!config || !essay?.trim() || (result?.fixedEssay && result?.mistakeCorrections?.length)) return result;
  const kind = taskType==="task2" ? "Task 2 essay" : "Task 1 report";
  const argLevel = taskType==="task2"
    ? " Work at the ARGUMENT level, not just grammar: ensure a clear thesis/position, one focused topic sentence per body paragraph, developed support/examples, a brief concession where useful, and a conclusion that restates the position — but KEEP the student's own position and ideas (do not swap in a different opinion or a memorised model answer)."
    : " Keep it at the reporting level: clear overview of the main trends/features, accurate data support and comparisons; do not invent figures the student didn't use.";
  try {
    const raw = await callAPI(config,[
      {role:"system",content:`You are an IELTS writing correction coach. Create a corrected version of the student's ${kind} after grading. Preserve the student's intended meaning and position; fix grammar, word choice, cohesion, and unclear phrasing.${argLevel} Do not write a totally different essay. Return ONLY valid JSON.`},
      {role:"user",content:`PROMPT CONTEXT:
${promptContext}

EXAMINER RESULT SUMMARY:
Overall ${result?.overall || "unknown"}; top priority: ${result?.topPriority || "unknown"}.

STUDENT ESSAY:
${essay}

Return this JSON:
{"fixedEssay":"full corrected essay preserving the student's meaning, with \\n\\n between paragraphs (intro / body paragraphs / conclusion or overview)","mistakeCorrections":[{"original":"exact problematic phrase or sentence","fixed":"corrected version","issue":"grammar|vocabulary|cohesion|task response","explanation":"why this fix is better"}]}`}
    ],2200,0.1);
    const fix = safeJSON(raw);
    return normalizeWritingExaminerResult({...result,...fix},taskType,essay);
  } catch(e) {
    return normalizeWritingExaminerResult({...result,fixedEssayError:e.message},taskType,essay);
  }
}

function writingExaminerPromptAddendum(taskType) {
  const first = taskType==="task2" ? "tr" : "ta";
  const firstName = taskType==="task2" ? "Task Response" : "Task Achievement";
  const auditFocus = taskType==="task2"
    ? "all parts answered, position clarity, idea development, paragraph focus, word count"
    : "overview, key feature selection, accurate data support, comparisons, word count";
  const promptAnchor = taskType==="task2"
    ? "Task Response must be scored by comparing the essay with the exact question: answer type, all question parts, position, relevance, and idea development. Penalize generic memorised essays, missing parts, unclear position, or examples that do not support the prompt."
    : "Task Achievement must be scored by comparing the essay with the exact Task 1 prompt and visual context. Check overview, key feature selection, comparisons, data accuracy, units, and whether the essay invents or omits important information. If the student supplied only a text prompt without data, state that limitation clearly instead of guessing hidden figures.";
  return `Use public IELTS Writing band-descriptor concepts. Be conservative: if evidence is mixed, choose the lower plausible half-band.
Run TWO independent examiner passes internally:
- examinerA = strict examiner
- examinerB = standard examiner
Then produce final criterion scores.

For each criterion, include strengths, weaknesses, evidence from the essay, and whyNotHigher.
Lexical Resource rule: reward natural, accurate collocations — NOT rare words. Explicitly flag unnatural collocations and sophisticated/rare words used in the wrong context (e.g. "make a research", "do a mistake", "a plethora of problem"). Do NOT raise the LR band for ambitious vocabulary that is misused; misuse should lower it. Put each such error in mistakes[] with category "collocation".
${writingAuthenticityRules("assess", taskType)}
${writingCriterionFaultRules(taskType)}
Prompt-anchored scoring rule: ${promptAnchor}
Task audit focus: ${auditFocus}.
Fixed essay rule: include a corrected essay that preserves the student's meaning and indicates the most important mistakes. Separate paragraphs with \\n\\n (intro / body paragraphs / conclusion or overview). Do not replace the student's ideas with a memorised model answer.
Memorised/template detection: judge whether the essay looks pre-memorised or template-driven rather than a genuine response to THIS prompt — signals include generic essay-bank phrasing, an introduction/conclusion that ignores the exact question wording, padding sentences with no content, examples that fit any topic, and over-rehearsed linking. Report memorisedRisk.level = low|medium|high with concrete signals and a one-line note. High/medium memorised content should NOT be rewarded in Task Response.

Return ONLY valid JSON:
{"examinerA":{"overall":6.5,"${first}":6.5,"cc":6.5,"lr":6.5,"gra":6.5,"summary":"strict score rationale"},"examinerB":{"overall":7.0,"${first}":7.0,"cc":7.0,"lr":7.0,"gra":7.0,"summary":"standard score rationale"},"${first}":{"band":7.0,"strengths":["specific"],"weaknesses":["specific"],"evidence":["short quoted evidence"],"whyNotHigher":"why this is not a higher band for ${firstName}"},"cc":{"band":7.0,"strengths":[],"weaknesses":[],"evidence":[],"whyNotHigher":""},"lr":{"band":7.0,"strengths":[],"weaknesses":[],"evidence":[],"whyNotHigher":""},"gra":{"band":7.0,"strengths":[],"weaknesses":[],"evidence":[],"whyNotHigher":""},"overall":7.0,"overallComment":"2-3 sentence examiner-style assessment",${writingAssessmentSchemaAdditions(taskType)},"taskAudit":[{"label":"audit item","status":"pass|warning|fail","note":"specific evidence"}],"topPriority":"single highest-impact fix tied to cappingCriterion","topStrength":"strongest scoring feature","band7GapDrill":{"title":"short drill name","targetCriterion":"criterion name","instruction":"10-minute rewrite task","successCheck":"how the student knows it improved"},"personalizedDrill":{"title":"short drill name","instruction":"10-minute exercise","example":"short worked example under 30 words"},"fixedEssay":"full corrected essay preserving the student's meaning, with \\n\\n between paragraphs","mistakeCorrections":[{"original":"exact problematic phrase or sentence","fixed":"corrected version","issue":"grammar|vocabulary|cohesion|task response","explanation":"why this fix is better"}],"topicRelevantUnusedAWL":[{"word":"policy","reason":"fits the topic"}],"mistakes":[{"category":"logic|cohesion|evidence|explanation|vocabulary|collocation|repetition|grammar|coherence","quote":"EXACT words copied from the essay","fix":"short concrete fix"}],"annotations":[{"sentence":"EXACT sentence copied from essay","tag":"strong|improve|error","comment":"under 15 words"}]}`;
}

function normalizeTopicVocabulary(items) {
  if (!Array.isArray(items)) return [];
  return items.map(x=>{
    if (typeof x==="string") return {term:x,use:"",example:""};
    return {
      term: String(x?.term || x?.word || x?.phrase || "").trim(),
      use: String(x?.use || x?.meaning || x?.reason || x?.function || "").trim(),
      example: String(x?.example || x?.sentence || "").trim()
    };
  }).filter(x=>x.term);
}

function normalizeWritingAidResult(raw, kind) {
  const data = raw && typeof raw==="object" ? raw : {};
  if (kind==="example") {
    return {
      title: data.title || "AI sample answer",
      essay: data.essay || data.answer || "",
      bandTarget: data.bandTarget || data.targetBand || "",
      wordCount: Number(data.wordCount) || (data.essay ? String(data.essay).trim().split(/\s+/).filter(Boolean).length : 0),
      whyItWorks: Array.isArray(data.whyItWorks) ? data.whyItWorks : [],
      usefulPhrases: Array.isArray(data.usefulPhrases) ? data.usefulPhrases : [],
      bodyExamples: Array.isArray(data.bodyExamples) ? data.bodyExamples.map(x=>String(x||"").trim()).filter(Boolean).slice(0,2) : [],
      topicVocabulary: normalizeTopicVocabulary(data.topicVocabulary || data.highScoreTerms || data.topicTerms),
      statements: normalizeWritingExampleStatements(data.statements || data.reasoning || data.thinking)
    };
  }
  return {
    title: data.title || "Opinions & Structures",
    recommendedApproach: data.recommendedApproach || data.recommended_approach || "",
    possibleOpinions: Array.isArray(data.possibleOpinions) ? data.possibleOpinions : [],
    overviewOptions: Array.isArray(data.overviewOptions) ? data.overviewOptions : [],
    mainIdeas: Array.isArray(data.mainIdeas) ? data.mainIdeas : [],
    recommendedStructure: Array.isArray(data.recommendedStructure) ? data.recommendedStructure : [],
    mustMention: Array.isArray(data.mustMention) ? data.mustMention : [],
    avoid: Array.isArray(data.avoid) ? data.avoid : [],
    languageMoves: Array.isArray(data.languageMoves) ? data.languageMoves : [],
    topicVocabulary: normalizeTopicVocabulary(data.topicVocabulary || data.highScoreTerms || data.topicTerms)
  };
}

function formatWritingAidPlan(data, taskType) {
  if (!data) return "";
  const lines = [];
  lines.push(`${taskType==="task2" ? "Task 2" : "Task 1"} plan: ${data.title || "Opinions & Structures"}`);
  if (data.recommendedApproach) lines.push(`\nApproach: ${data.recommendedApproach}`);
  if (data.overviewOptions?.length) lines.push(`\nOverview options:\n${data.overviewOptions.map((x,i)=>`${i+1}. ${x}`).join("\n")}`);
  if (data.possibleOpinions?.length) {
    lines.push("\nPossible opinions:");
    data.possibleOpinions.forEach((op,i)=>{
      const stance = typeof op==="string" ? op : (op.stance || op.position || `Option ${i+1}`);
      const thesis = typeof op==="string" ? "" : (op.thesis || "");
      lines.push(`${i+1}. ${stance}${thesis ? ` - Thesis: ${thesis}` : ""}`);
    });
  }
  if (data.mainIdeas?.length) lines.push(`\nMain ideas:\n${data.mainIdeas.map((x,i)=>`${i+1}. ${typeof x==="string" ? x : (x.idea || x.point || JSON.stringify(x))}`).join("\n")}`);
  if (data.recommendedStructure?.length) {
    lines.push("\nStructure:");
    data.recommendedStructure.forEach((p,i)=>{
      const name = p.paragraph || p.name || `Paragraph ${i+1}`;
      const focus = p.focus || p.keyPoint || p.content || "";
      lines.push(`${name}: ${focus}`);
    });
  }
  if (data.mustMention?.length) lines.push(`\nMust mention:\n${data.mustMention.map(x=>`- ${x}`).join("\n")}`);
  if (data.languageMoves?.length) lines.push(`\nUseful language moves:\n${data.languageMoves.map(x=>`- ${x}`).join("\n")}`);
  if (data.topicVocabulary?.length) lines.push(`\nHigh-score topic vocabulary:\n${data.topicVocabulary.map(x=>`- ${x.term}${x.use ? `: ${x.use}` : ""}${x.example ? ` (e.g. ${x.example})` : ""}`).join("\n")}`);
  if (data.avoid?.length) lines.push(`\nAvoid:\n${data.avoid.map(x=>`- ${x}`).join("\n")}`);
  return lines.join("\n");
}

function mergeTopicVocabulary(...sources) {
  const seen = new Set();
  const out = [];
  sources.flat().filter(Boolean).forEach(item=>{
    const v = typeof item==="string" ? {term:item,use:"",example:""} : item;
    const term = String(v.term || v.word || v.phrase || "").trim();
    if (!term) return;
    const key = term.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      term,
      use: String(v.use || v.meaning || v.reason || v.function || "").trim(),
      example: String(v.example || v.sentence || "").trim()
    });
  });
  return out;
}

function WritingTopicVocabularyPanel({items}) {
  const vocab = mergeTopicVocabulary(items || []);
  if (!vocab.length) return null;
  return <div className="card" style={{background:"var(--surface2)",marginTop:12,borderTop:"2px solid var(--orchid)"}}>
    <div className="card-h"><div className="cdot" style={{background:"var(--orchid)"}}/>High-score Topic Vocabulary</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:8}}>
      {vocab.map((v,i)=><div key={i} style={{background:"var(--surface)",border:"1px solid var(--border)",borderLeft:"2px solid var(--orchid)",borderRadius:8,padding:"9px 10px"}}>
        <div style={{fontFamily:"'Geist Mono',monospace",fontSize:11,color:"var(--orchid)",fontWeight:700,marginBottom:3}}>{v.term}</div>
        {v.use&&<div style={{fontSize:11.5,color:"var(--ink2)",lineHeight:1.45}}>{v.use}</div>}
        {v.example&&<div style={{fontSize:11,color:"var(--ink3)",lineHeight:1.45,marginTop:4,fontStyle:"italic"}}>{v.example}</div>}
      </div>)}
    </div>
  </div>;
}

function WritingAidPanel({kind,data,taskType,onUseEssay,onUsePlan}) {
  if (!data) return null;
  const isExample = kind==="example";
  const accent = isExample ? "var(--orchid)" : "var(--sky)";
  return <div className="card" style={{background:"var(--surface2)",marginTop:12,borderTop:`2px solid ${accent}`}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:10}}>
      <div className="card-h" style={{margin:0}}><div className="cdot" style={{background:accent}}/>{isExample ? "AI Example" : "Opinions & Structures"}</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {isExample && data.essay && onUseEssay && <button className="btn bg bsm" onClick={()=>onUseEssay(data.essay)}>Use as essay</button>}
        {!isExample && onUsePlan && <button className="btn bg bsm" onClick={()=>onUsePlan(formatWritingAidPlan(data,taskType))}>Use as plan</button>}
      </div>
    </div>
    <div style={{fontFamily:"'Fraunces',serif",fontSize:16,color:"var(--ink)",marginBottom:8}}>{data.title}</div>
    {isExample ? <>
      <div style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",marginBottom:10}}>{data.bandTarget ? `Target: ${data.bandTarget} - ` : ""}{data.wordCount || 0} words{data.statements?.length ? " · tap a sentence to see the AI's thinking" : ""}</div>
      {data.statements?.length
        ? <WritingExampleReasoning essay={data.essay} statements={data.statements} accent={accent}/>
        : <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderLeft:`2px solid ${accent}`,borderRadius:8,padding:"12px 14px"}}>
            <WritingParagraphs text={data.essay} style={{fontSize:13,color:"var(--ink)",lineHeight:1.75,fontFamily:"'Fraunces',serif",fontWeight:300}}/>
          </div>}
      {data.whyItWorks?.length>0&&<div style={{marginTop:10,fontSize:12,color:"var(--ink2)",lineHeight:1.6}}><strong>Why it works:</strong> {data.whyItWorks.join("; ")}</div>}
      {data.usefulPhrases?.length>0&&<div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>{data.usefulPhrases.map((p,i)=><span key={i} className="chip cs">{p}</span>)}</div>}
    </> : <>
      {data.recommendedApproach&&<div className="alert ai" style={{marginBottom:10}}>{data.recommendedApproach}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
        {data.possibleOpinions?.length>0&&<div><div className="sl">Possible opinions</div>{data.possibleOpinions.map((op,i)=><div key={i} style={{fontSize:12,color:"var(--ink2)",lineHeight:1.55,marginBottom:6}}>{typeof op==="string" ? op : <><strong>{op.stance || op.position || `Option ${i+1}`}:</strong> {op.thesis || op.useWhen || ""}</>}</div>)}</div>}
        {data.overviewOptions?.length>0&&<div><div className="sl">Overview options</div>{data.overviewOptions.map((x,i)=><div key={i} style={{fontSize:12,color:"var(--ink2)",lineHeight:1.55,marginBottom:6}}>{x}</div>)}</div>}
        {data.mainIdeas?.length>0&&<div><div className="sl">Main ideas</div>{data.mainIdeas.map((x,i)=><div key={i} style={{fontSize:12,color:"var(--ink2)",lineHeight:1.55,marginBottom:6}}>{typeof x==="string" ? x : (x.idea || x.point || JSON.stringify(x))}</div>)}</div>}
        {data.recommendedStructure?.length>0&&<div><div className="sl">Structure</div>{data.recommendedStructure.map((p,i)=><div key={i} style={{fontSize:12,color:"var(--ink2)",lineHeight:1.55,marginBottom:6}}><strong>{p.paragraph || p.name || `Paragraph ${i+1}`}:</strong> {p.focus || p.keyPoint || p.content || ""}</div>)}</div>}
      </div>
      {data.mustMention?.length>0&&<div style={{marginTop:10}}><div className="sl">Must mention</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{data.mustMention.map((x,i)=><span key={i} className="chip ch">{x}</span>)}</div></div>}
      {data.avoid?.length>0&&<div style={{marginTop:10,fontSize:12,color:"var(--honey)",lineHeight:1.6}}><strong>Avoid:</strong> {data.avoid.join("; ")}</div>}
      {data.languageMoves?.length>0&&<div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>{data.languageMoves.map((p,i)=><span key={i} className="chip cs">{p}</span>)}</div>}
    </>}
  </div>;
}

function writingGenerationQualityRules(taskType) {
  if (taskType==="task2") {
    return `Make the Task 2 question realistic for IELTS Academic: answerable in 40 minutes, not overly broad, and with a clear question type.
Include hidden assessment fields: requirements, planningHints, commonTrap, expectedPositionOptions, and band7MustDo.
Choose a prompt that rewards prompt-specific reasoning and plausible examples, not memorised essays or fake research citations.
Avoid copyrighted or official IELTS/Cambridge wording. Generate an original IELTS-style question.`;
  }
  return `Make the Task 1 data realistic for IELTS Academic: clear main trend, one secondary trend, one exception or contrast, and enough data for comparisons.
Include hidden assessment fields: keyFeatures, expectedOverview, mustMention, commonTrap, and band7MustDo.
Use realistic but original data/source labels; do not imply the figures are copied from an official real dataset.
Avoid copyrighted or official IELTS/Cambridge wording. Generate original IELTS-style data.`;
}

function FixedEssayPanel({result}) {
  if (!result?.fixedEssay && !result?.mistakeCorrections?.length && !result?.fixedEssayError) return null;
  return <div className="card">
    <div className="card-h"><div className="cdot" style={{background:"var(--orchid)"}}/>Fixed Essay</div>
    {result.fixedEssay
      ? <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderLeft:"2px solid var(--orchid)",borderRadius:8,padding:"12px 14px"}}>
          <WritingParagraphs text={result.fixedEssay} style={{fontSize:13,color:"var(--ink)",lineHeight:1.75,fontFamily:"'Fraunces',serif",fontWeight:300}}/>
        </div>
      : <div className="alert aw" style={{marginBottom:0}}>Could not generate a fixed essay: {result.fixedEssayError}</div>}
    {result.mistakeCorrections?.length>0&&<div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
      {result.mistakeCorrections.map((m,i)=><div key={i} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 11px"}}>
        <div style={{fontFamily:"'Geist Mono',monospace",fontSize:9,letterSpacing:".09em",textTransform:"uppercase",color:"var(--orchid)",marginBottom:6}}>{m.issue || "Correction"}</div>
        {(m.original||m.fixed)&&<div style={{fontSize:12,color:"var(--ink2)",lineHeight:1.6,marginBottom:6}}>
          {m.original&&<><span style={{color:"var(--rose)",textDecoration:"line-through"}}>{m.original}</span>{m.fixed&&<span style={{color:"var(--ink3)"}}> → </span>}</>}
          {m.fixed&&<span style={{color:"var(--leaf)"}}>{m.fixed}</span>}
        </div>}
        {m.explanation&&<div style={{fontSize:11.5,color:"var(--ink3)",lineHeight:1.5}}>{m.explanation}</div>}
      </div>)}
    </div>}
  </div>;
}

function PreciseMistakesPanel({result}) {
  const mistakes = Array.isArray(result?.mistakes) ? result.mistakes : [];
  const mech = result?.mechanicalIssues || {};
  const repeatedWords = mech.repeatedWords || [];
  const repeatedOpeners = mech.repeatedOpeners || [];
  const longSentences = mech.longSentences || [];
  if (!mistakes.length && !repeatedWords.length && !repeatedOpeners.length && !longSentences.length) return null;
  const groups = {};
  mistakes.forEach(m=>{ (groups[m.category] = groups[m.category] || []).push(m); });
  const orderedCats = Object.keys(MISTAKE_CATS).filter(c=>groups[c]);
  return <div className="card">
    <div className="card-h"><div className="cdot" style={{background:"var(--rose)"}}/>Precise Mistakes</div>
    <div style={{fontSize:11,color:"var(--ink3)",marginBottom:10,lineHeight:1.5}}>Specific issues tied to the exact text, grouped by type. Repetition checks are computed directly from your essay.</div>
    {orderedCats.map(cat=>{
      const meta = MISTAKE_CATS[cat];
      return <div key={cat} style={{marginBottom:11}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
          <span style={{width:8,height:8,borderRadius:2,background:meta.color,flexShrink:0}}/>
          <span style={{fontSize:12,color:"var(--ink)",fontWeight:600}}>{meta.label}</span>
          <span style={{fontSize:10,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace"}}>{groups[cat].length}</span>
        </div>
        {groups[cat].map((m,i)=><div key={i} style={{borderLeft:`2px solid ${meta.color}`,background:"var(--surface2)",borderRadius:"0 7px 7px 0",padding:"7px 10px",marginBottom:6}}>
          {m.quote&&<div style={{fontSize:12,color:"var(--ink2)",fontStyle:"italic",lineHeight:1.5,marginBottom:m.fix?4:0}}>"{m.quote}"{m.inEssay===false&&<span style={{fontStyle:"normal",fontSize:9.5,color:"var(--ink3)",marginLeft:5}}>(paraphrased)</span>}</div>}
          {m.fix&&<div style={{fontSize:11.5,color:"var(--leaf)",lineHeight:1.5}}>→ {m.fix}</div>}
        </div>)}
      </div>;
    })}
    {repeatedWords.length>0&&<div style={{marginTop:6,marginBottom:9}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><span style={{width:8,height:8,borderRadius:2,background:MISTAKE_CATS.repetition.color,flexShrink:0}}/><span style={{fontSize:12,color:"var(--ink)",fontWeight:600}}>Overused words</span></div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{repeatedWords.map((w,i)=><span key={i} className="chip ch" title="Vary this with synonyms">{w.word} ×{w.count}</span>)}</div>
    </div>}
    {repeatedOpeners.length>0&&<div style={{fontSize:11.5,color:"var(--ink2)",lineHeight:1.55,marginBottom:longSentences.length?8:0}}>
      <strong style={{color:"var(--honey)"}}>Repetitive sentence openers:</strong> {repeatedOpeners.map(o=>`"${o.opener}…" ×${o.count}`).join(", ")} — vary how sentences begin.
    </div>}
    {longSentences.length>0&&<div style={{fontSize:11.5,color:"var(--ink2)",lineHeight:1.55}}>
      <strong style={{color:"var(--sky)"}}>Possible run-on sentences ({longSentences.length}):</strong> {longSentences.map((s,i)=><span key={i} style={{display:"block",color:"var(--ink3)",fontStyle:"italic",marginTop:3}}>"{s}"</span>)}
    </div>}
  </div>;
}

function WritingExaminerPanels({result,taskType}) {
  if (!result) return null;
  const confidence = result.confidence || examinerScoreSummary(result, taskType);
  const criteria = writingCriteria(taskType);
  return <div className="fu">
    <div className="cols-2">
      {result.localGraded && !Number.isFinite(Number(result.examinerA?.overall))
        ? <div className="card">
          <div className="card-h"><div className="cdot"/>Examiner Double Marking</div>
          <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.6,marginBottom:6}}>Single marking by the local fine-tuned model — independent A/B double-marking is <strong style={{color:"var(--ink)"}}>not available</strong> on the local grader.</div>
          <div style={{fontSize:11.5,color:"var(--ink3)",lineHeight:1.55}}>For a confidence range from two independent passes, grade this essay with a cloud provider in Settings.</div>
        </div>
      : confidence&&<div className="card">
        <div className="card-h"><div className="cdot"/>Examiner Double Marking</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          <div><div className="sl">Examiner A</div><div className="sv" style={{color:bandColor(result.examinerA?.overall)}}>{result.examinerA?.overall?.toFixed?.(1)||"-"}</div></div>
          <div><div className="sl">Examiner B</div><div className="sv" style={{color:bandColor(result.examinerB?.overall)}}>{result.examinerB?.overall?.toFixed?.(1)||"-"}</div></div>
          <div><div className="sl">{confidence.label}</div><div className="sv" style={{color:confidence.spread<=.5?"var(--leaf)":confidence.spread<=1?"var(--honey)":"var(--rose)"}}>{confidence.low.toFixed(1)}-{confidence.high.toFixed(1)}</div></div>
        </div>
        <div style={{fontSize:11.5,color:"var(--ink3)",lineHeight:1.55}}>{confidence.note}</div>
      </div>}
      {(()=>{ const nextBand = Math.min(9, roundWritingBand((Number(result.overall)||6.5)+0.5));
        return <div className="card">
        <div className="card-h"><div className="cdot"/>Next Band Blocker → {nextBand.toFixed(1)}</div>
        {(result.cappingCriterion?.criterion || result.topPriority) && <div style={{marginBottom:9,padding:"7px 10px",background:"var(--surface2)",border:"1px solid var(--border)",borderLeft:"2px solid var(--orchid)",borderRadius:8}}>
          {result.cappingCriterion?.criterion && <div style={{fontSize:11.5,color:"var(--ink2)",lineHeight:1.5}}><strong style={{color:"var(--orchid)"}}>Capped by:</strong> {result.cappingCriterion.criterion}{result.cappingCriterion.band>0?` · Band ${result.cappingCriterion.band.toFixed(1)}`:""}{result.cappingCriterion.reason?` — ${result.cappingCriterion.reason}`:""}</div>}
          {result.topPriority && <div style={{fontSize:11.5,color:"var(--ink3)",lineHeight:1.5,marginTop:result.cappingCriterion?.criterion?3:0}}><strong style={{color:"var(--ink2)"}}>Top priority:</strong> {result.topPriority}</div>}
        </div>}
        <div style={{fontFamily:"'Fraunces',serif",fontSize:16,color:"var(--ink)",marginBottom:5}}>{result.band7GapDrill?.title || "Focused rewrite"}</div>
        <div style={{fontSize:12,color:"var(--ink3)",lineHeight:1.55,marginBottom:7}}><strong style={{color:"var(--orchid)"}}>Target:</strong> {result.band7GapDrill?.targetCriterion || "weakest criterion"} <span style={{color:"var(--ink3)"}}>· to reach Band {nextBand.toFixed(1)}</span></div>
        <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.6}}>{result.band7GapDrill?.instruction}</div>
        {result.band7GapDrill?.successCheck&&<div style={{fontSize:11.5,color:"var(--leaf)",lineHeight:1.55,marginTop:8}}>Success check: {result.band7GapDrill.successCheck}</div>}
      </div>; })()}
    </div>
    {result.taskAudit?.length>0&&<div className="card">
      <div className="card-h"><div className="cdot"/>Task Response Audit</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
        {result.taskAudit.map((item,i)=>{
          const color = item.status==="pass" ? "var(--leaf)" : item.status==="fail" ? "var(--rose)" : "var(--honey)";
          return <div key={i} style={{background:"var(--surface2)",border:"1px solid var(--border)",borderLeft:`2px solid ${color}`,borderRadius:8,padding:"9px 10px"}}>
            <div style={{fontFamily:"'Geist Mono',monospace",fontSize:10,color,letterSpacing:".06em",textTransform:"uppercase",marginBottom:4}}>{item.status || "review"}</div>
            <div style={{fontSize:12.5,color:"var(--ink)",lineHeight:1.45,marginBottom:4}}>{item.label}</div>
            <div style={{fontSize:11.2,color:"var(--ink3)",lineHeight:1.45}}>{item.note}</div>
          </div>;
        })}
      </div>
    </div>}
    {result.promptFit&&<div className="card">
      <div className="card-h"><div className="cdot" style={{background:"var(--sky)"}}/>Prompt Fit</div>
      <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.6,marginBottom:10}}>{result.promptFit.summary}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
        <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 10px"}}><div className="sl">Covered</div><div style={{fontSize:11.5,color:"var(--ink3)",lineHeight:1.5}}>{result.promptFit.covered?.length ? result.promptFit.covered.join("; ") : "-"}</div></div>
        <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 10px"}}><div className="sl">Missing / Weak</div><div style={{fontSize:11.5,color:"var(--ink3)",lineHeight:1.5}}>{result.promptFit.missing?.length ? result.promptFit.missing.join("; ") : "-"}</div></div>
        <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 10px"}}><div className="sl">Score impact</div><div style={{fontSize:11.5,color:"var(--ink3)",lineHeight:1.5}}>{result.promptFit.scoreImpact || "-"}</div></div>
      </div>
      {result.promptFit.offTopic?.length>0&&<div style={{fontSize:11.5,color:"var(--rose)",lineHeight:1.5,marginTop:9}}>Off-topic or generic content: {result.promptFit.offTopic.join("; ")}</div>}
      {result.memorisedRisk && result.memorisedRisk.level!=="low" && (()=>{ const hi=result.memorisedRisk.level==="high"; const c=hi?"var(--rose)":"var(--honey)";
        return <div style={{marginTop:10,padding:"9px 11px",background:"var(--surface2)",border:`1px solid ${c}`,borderRadius:8}}>
          <div style={{fontFamily:"'Geist Mono',monospace",fontSize:9.5,letterSpacing:".08em",textTransform:"uppercase",color:c,marginBottom:4}}>⚠ Memorised / template risk: {result.memorisedRisk.level}</div>
          {result.memorisedRisk.note&&<div style={{fontSize:11.5,color:"var(--ink2)",lineHeight:1.5,marginBottom:result.memorisedRisk.signals.length?4:0}}>{result.memorisedRisk.note}</div>}
          {result.memorisedRisk.signals.length>0&&<div style={{fontSize:11.2,color:"var(--ink3)",lineHeight:1.5}}>Signals: {result.memorisedRisk.signals.join("; ")}</div>}
        </div>; })()}
    </div>}
    <FixedEssayPanel result={result}/>
    <PreciseMistakesPanel result={result}/>
    <div className="card">
      <div className="card-h"><div className="cdot"/>Why Not Higher?</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:8}}>
        {criteria.map(c=><div key={c.k} style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 10px"}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:5}}>
            <strong style={{fontSize:12,color:"var(--ink)"}}>{c.full}</strong>
            <span style={{fontFamily:"'Geist Mono',monospace",fontSize:11,color:bandColor(criterionBand(result,c.k))}}>{criterionBand(result,c.k)?.toFixed?.(1)||criterionBand(result,c.k)||"-"}</span>
          </div>
          <div style={{fontSize:11.2,color:"var(--ink3)",lineHeight:1.5}}>{result[c.k]?.whyNotHigher || "No higher-band blocker returned."}</div>
        </div>)}
      </div>
    </div>
  </div>;
}
