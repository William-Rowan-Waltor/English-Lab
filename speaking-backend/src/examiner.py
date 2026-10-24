"""IELTS Speaking examiner — OpenAI-compatible LLM + acoustic feature extraction.

Works with any provider that speaks the OpenAI Chat Completions API: Groq,
OpenAI, Together, Anyscale, local llama.cpp/Ollama with the OpenAI bridge, etc.

Configure via env:
    EXAMINER_API_KEY   = <bearer key>
    EXAMINER_BASE_URL  = https://api.groq.com/openai/v1    (default)
    EXAMINER_MODEL     = llama-3.3-70b-versatile           (default)
"""
from __future__ import annotations

import json
import os
import re
import statistics
from dataclasses import dataclass, asdict
from typing import Any

import httpx
from pydantic import BaseModel, Field, field_validator, ValidationError

from .transcriber import Transcript

_FILLERS = re.compile(r"\b(uh|um|er|erm|hmm|uhm|like|you know)\b", re.IGNORECASE)
_CONNECTIVES = {
    "because", "however", "although", "therefore", "moreover", "furthermore",
    "whereas", "nevertheless", "consequently", "meanwhile", "firstly",
    "secondly", "finally", "in addition", "for instance", "on the other hand",
}
_COMPLEX_MARKERS = {"which", "who", "that", "if", "when", "while", "because",
                    "although", "though", "unless", "whereas"}
_COMMON = set("""the be to of and a in that have i it for not on with he as you do at this but his
by from they we say her she or an will my one all would there their what so up out if about who get
which go me when make can like time no just him know take people into year your good some could them
see other than then now look only come its over think also back after use two how our work first well
way even new want because any these give day most us is are was were has had said did get got going
really very much many more here new thing things something nothing everything someone people way
think know feel want need like love good great big small long high old right different""".split())


# ---------------------------------------------------------------------------
# Acoustic + lexical features
# ---------------------------------------------------------------------------
@dataclass
class AcousticFeatures:
    duration_sec: float
    speaking_time_sec: float
    word_count: int
    wpm: float
    pause_count: int
    long_pause_count: int
    mean_pause_sec: float
    max_pause_sec: float
    filler_count: int
    filler_per_100w: float
    type_token_ratio: float
    rare_word_ratio: float
    connective_count: int
    complex_clause_ratio: float
    self_correction_count: int

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def extract_acoustic_features(transcript: Transcript) -> AcousticFeatures:
    text = transcript.cleaned_text
    words_raw = re.findall(r"[a-zA-Z']+", text.lower())
    wc = len(words_raw)
    dur = transcript.duration_sec or 0.0

    pauses: list[float] = []
    wts = transcript.word_timestamps or []
    for i in range(1, len(wts)):
        gap = wts[i].get("start", 0) - wts[i - 1].get("end", 0)
        if gap > 0:
            pauses.append(gap)
    sig_pauses = [p for p in pauses if p > 0.3]
    long_pauses = [p for p in pauses if p > 1.0]

    # Speaking time = span actually covered by speech (excludes leading/trailing
    # silence and any Part-2 prep gap). WPM over the full clip understates rate
    # whenever the recording has quiet stretches — use the spoken span instead.
    if wts:
        speak = max(0.0, float(wts[-1].get("end", 0) or 0) - float(wts[0].get("start", 0) or 0))
    else:
        speak = dur
    if speak <= 0:
        speak = dur

    unique = set(words_raw)
    ttr = len(unique) / wc if wc else 0.0
    rare = [w for w in unique if w not in _COMMON and len(w) > 3]
    rare_ratio = len(rare) / len(unique) if unique else 0.0

    low = text.lower()
    conn = sum(1 for c in _CONNECTIVES if c in low)
    complex_ratio = (sum(1 for w in words_raw if w in _COMPLEX_MARKERS) / wc) if wc else 0.0
    self_corr = len(re.findall(r"\b(\w+)\s+\1\b", low))

    return AcousticFeatures(
        duration_sec=round(dur, 2),
        speaking_time_sec=round(speak, 2),
        word_count=wc,
        wpm=round(wc / (speak / 60), 1) if speak else 0.0,
        pause_count=len(sig_pauses),
        long_pause_count=len(long_pauses),
        mean_pause_sec=round(statistics.mean(sig_pauses), 3) if sig_pauses else 0.0,
        max_pause_sec=round(max(pauses), 3) if pauses else 0.0,
        filler_count=len(_FILLERS.findall(text)),
        filler_per_100w=round(len(_FILLERS.findall(text)) / wc * 100, 2) if wc else 0.0,
        type_token_ratio=round(ttr, 3),
        rare_word_ratio=round(rare_ratio, 3),
        connective_count=conn,
        complex_clause_ratio=round(complex_ratio, 3),
        self_correction_count=self_corr,
    )


# ---------------------------------------------------------------------------
# Pydantic output schema
# ---------------------------------------------------------------------------
class Scores(BaseModel):
    fluency_coherence: float
    lexical_resource: float
    grammatical_range_accuracy: float
    pronunciation: float
    overall_band: float

    @field_validator("*")
    @classmethod
    def band_range(cls, v: float) -> float:
        if not (0 <= v <= 9):
            raise ValueError(f"band {v} ngoài [0,9]")
        return round(float(v) * 2) / 2


class Evidence(BaseModel):
    fluency_coherence: list[str] = Field(default_factory=list)
    lexical_resource: list[str] = Field(default_factory=list)
    grammatical_range_accuracy: list[str] = Field(default_factory=list)
    pronunciation: list[str] = Field(default_factory=list)


class FeedbackVI(BaseModel):
    fluency_coherence: list[str]
    lexical_resource: list[str]
    grammatical_range_accuracy: list[str]
    pronunciation: list[str]


class FeedbackEN(BaseModel):
    """English mirror of the feedback — optional so older model output still validates."""
    fluency_coherence: list[str] = Field(default_factory=list)
    lexical_resource: list[str] = Field(default_factory=list)
    grammatical_range_accuracy: list[str] = Field(default_factory=list)
    pronunciation: list[str] = Field(default_factory=list)


class BandGap(BaseModel):
    """What is blocking the next half-band on the weakest criterion."""
    weakest_criterion: str = ""
    current_band: float = 0.0
    next_band: float = 0.0
    why_not_higher_vi: str = ""
    to_improve_vi: list[str] = Field(default_factory=list)
    why_not_higher_en: str = ""
    to_improve_en: list[str] = Field(default_factory=list)


class ExaminerResult(BaseModel):
    scores: Scores
    evidence: Evidence
    feedback_vi: FeedbackVI
    next_steps_vi: list[str]
    feedback_en: FeedbackEN = Field(default_factory=FeedbackEN)
    next_steps_en: list[str] = Field(default_factory=list)
    band_gap: BandGap = Field(default_factory=BandGap)


# ---------------------------------------------------------------------------
# Prompt — schema embedded so JSON mode produces the right shape every time
# ---------------------------------------------------------------------------
_BAND_CALIBRATION = """\
CALIBRATION ANCHORS AND ADJACENT-BAND BOUNDARIES:
- Band 5 anchor: the candidate can usually keep speaking, but relies on slow delivery, repetition,
  self-correction, basic vocabulary, limited paraphrase, and simple grammar. Complex attempts often
  break down or force reformulation; pronunciation is intelligible only with some listener effort.
- Band 6 anchor: the candidate is willing to speak at length and meaning is generally clear, but
  coherence, lexical choice, complex grammar, and pronunciation control are inconsistent. Errors
  rarely block communication, yet they are frequent enough to keep the score below Band 7.
- Band 7 anchor: the candidate can produce longer turns with little strain, flexible discourse
  markers, developed ideas with reasons/examples/contrast/detail, natural topic vocabulary and
  paraphrase, frequent error-free sentences, and pronunciation features that are mostly controlled.
  Hesitation or errors may occur but do not damage coherence.
- Band 8 anchor: the candidate is fluent and relevant across the sample, with precise and flexible
  vocabulary, mostly error-free grammar, non-systematic slips only, and speech that is easy to
  follow. Band 8 requires sustained natural control, not isolated advanced words or memorised phrases.
- Conservative placement: when evidence sits between two adjacent bands, choose the LOWER band unless
  the transcript clearly demonstrates the higher band throughout that criterion. In band_gap, name
  the missing evidence that prevented the higher score.
"""

EXAMINER_SYSTEM = """You are a certified IELTS Speaking examiner (British Council / IDP). \
Apply the OFFICIAL PUBLIC BAND DESCRIPTORS. Score 4 criteria, each band 0-9 step 0.5.

FLUENCY & COHERENCE — B7: speaks at length without noticeable effort; some language-related \
hesitation; range of connectives/discourse markers with some flexibility. B6: willing to speak \
at length but may lose coherence (repetition, self-correction, hesitation). Reward answers that \
develop ideas naturally by adding reasons, examples, contrasts, or details and finish the idea clearly.

LEXICAL RESOURCE — B7: flexible, natural and appropriate vocabulary on varied topics; effective \
paraphrase and accurate collocations. B6: enough vocabulary to discuss at length, meaning clear \
despite occasional inappropriacies; generally paraphrases. Do NOT score LR by counting advanced, \
rare, or idiomatic words. A fluent, natural answer using mostly common words accurately can score \
as high as, or higher than, a stilted answer stuffed with advanced words. Penalise forced big words, \
recited idioms, and memorised academic phrases when they sound unnatural or are used inaccurately.

GRAMMATICAL RANGE & ACCURACY — B7: range of complex structures with some flexibility; frequently \
error-free sentences. B6: mix of simple/complex with limited flexibility; frequent errors in \
complex structures but rarely impede communication.

PRONUNCIATION — B7: all positive Band 6 features + some Band 8. B6: range of features with mixed \
control; generally understood; mispronunciation reduces clarity at times.

{_BAND_CALIBRATION}

PROTOCOL:
1. Per criterion, cite 2-3 evidence quotes from the transcript.
2. Use the ACOUSTIC FEATURES JSON to inform F&C (wpm, pauses, fillers) and partly P. Treat \
rare_word_ratio as a rough diversity flag only; never reward high rare_word_ratio or advanced-word \
count by itself for Lexical Resource.
3. In feedback, prioritise Fluency & Coherence and natural answer development when the answer is \
short or list-like: encourage because/reason, example, contrast, and extra detail rather than \
"use bigger words".
4. overall_band = arithmetic mean of 4 sub-scores, rounded to nearest 0.5 (Cambridge).
5. Feedback in BOTH Vietnamese (feedback_vi/next_steps_vi) AND English (feedback_en/next_steps_en), \
2-3 actionable bullets per criterion. The English must mirror the same points as the Vietnamese.
6. Watch Vietnamese-L1 errors: dropped articles, missing 3rd-person -s and past -ed, \
omitted final consonants, no word stress, overuse of 'very'.
7. Identify the SINGLE weakest criterion. In band_gap, explain in BOTH Vietnamese \
(why_not_higher_vi/to_improve_vi) and English (why_not_higher_en/to_improve_en) exactly what is \
blocking the next half-band and give 2 concrete, practisable actions tied to THIS answer.
8. PART AWARENESS: the user message states which part this is and its length expectation. If the \
answer is too short for that part, say so explicitly and treat Fluency & Coherence as limited \
(you cannot demonstrate "speaks at length" on a very short answer).
Note: pronunciation is inferred from text + acoustics only (no phoneme audio) — be conservative \
and say so in pronunciation feedback.

You MUST return ONLY a single JSON object matching this exact schema (no markdown, no commentary):
{
  "scores": {
    "fluency_coherence":            <number 0-9>,
    "lexical_resource":             <number 0-9>,
    "grammatical_range_accuracy":   <number 0-9>,
    "pronunciation":                <number 0-9>,
    "overall_band":                 <number 0-9>
  },
  "evidence": {
    "fluency_coherence":            ["<short quote>", ...],
    "lexical_resource":             ["<short quote>", ...],
    "grammatical_range_accuracy":   ["<short quote>", ...],
    "pronunciation":                ["<short quote>", ...]
  },
  "feedback_vi": {
    "fluency_coherence":            ["<câu nhận xét tiếng Việt>", ...],
    "lexical_resource":             ["<câu nhận xét tiếng Việt>", ...],
    "grammatical_range_accuracy":   ["<câu nhận xét tiếng Việt>", ...],
    "pronunciation":                ["<câu nhận xét tiếng Việt>", ...]
  },
  "next_steps_vi": ["<bước hành động 1>", "<bước 2>", ...],
  "band_gap": {
    "weakest_criterion":  "<one of: Fluency & Coherence | Lexical Resource | Grammatical Range & Accuracy | Pronunciation>",
    "current_band":       <number>,
    "next_band":          <number = current_band + 0.5>,
    "why_not_higher_vi":  "<tiếng Việt: vì sao tiêu chí này chưa đạt band kế tiếp>",
    "to_improve_vi":      ["<hành động cụ thể 1>", "<hành động cụ thể 2>"]
  }
}"""
EXAMINER_SYSTEM = EXAMINER_SYSTEM.replace("{_BAND_CALIBRATION}", _BAND_CALIBRATION)


EXAMINER_USER_TMPL = """PART: {part_label}
LENGTH EXPECTATION FOR THIS PART: {part_expectation}

QUESTION:
{question}

CANDIDATE TRANSCRIPT:
{transcript}

ACOUSTIC FEATURES (JSON):
{features}

Return the JSON object only."""


# Part-aware length expectations + soft minimums. IELTS Speaking:
#   Part 1 = short personal Q&A; Part 2 = 1-2 min long turn; Part 3 = developed discussion.
_PART_META = {
    "part1": {
        "label": "Part 1 (short personal questions)",
        "expectation": "2-4 full sentences per answer is healthy; one-word answers cannot be scored well.",
        "min_words": 15,
    },
    "part2": {
        "label": "Part 2 (long turn — speak 1 to 2 minutes)",
        "expectation": "A proper long turn is roughly 150-220 words spoken over 90-120 seconds.",
        "min_words": 90,
    },
    "part3": {
        "label": "Part 3 (discussion — develop and justify ideas)",
        "expectation": "Each answer should be a developed 3-5 sentence response with reasons/examples.",
        "min_words": 30,
    },
}


def _length_nudge(part: str, feats: AcousticFeatures) -> dict[str, Any] | None:
    """If the answer is under the part-aware minimum, return a bilingual nudge plus a
    Fluency&Coherence cap (you cannot show 'speaks at length' on a too-short answer)."""
    return _length_nudge_for_word_count(part, feats.word_count)


def _length_nudge_for_word_count(part: str, wc: int) -> dict[str, Any] | None:
    """Same cap logic as _length_nudge, but usable for session-level transcripts."""
    meta = _PART_META.get(part, _PART_META["part1"])
    min_words = meta["min_words"]
    if wc >= min_words:
        return None
    if part == "part2":
        nudge_vi = (f"Câu trả lời Part 2 mới có {wc} từ — quá ngắn cho một lượt nói dài 1-2 phút. "
                    "Hãy khai triển đủ các gạch đầu dòng trên thẻ và nói liên tục khoảng 90-120 giây.")
        nudge_en = (f"Your Part 2 long turn was only {wc} words — too short for a 1-2 minute turn. "
                    "Cover every bullet on the cue card and keep talking for about 90-120 seconds.")
        cap = 6.0 if wc < 80 else 6.5
    elif part == "part3":
        nudge_vi = (f"Câu trả lời Part 3 chỉ có {wc} từ — hãy phát triển ý: nêu lý do, ví dụ, và mở rộng quan điểm.")
        nudge_en = (f"Your Part 3 answer was only {wc} words — develop it with reasons, examples and a wider view.")
        cap = 6.5
    else:
        nudge_vi = (f"Câu trả lời chỉ có {wc} từ — trả lời thành 2-4 câu đầy đủ thay vì một vài từ.")
        nudge_en = (f"Your answer was only {wc} words — give a full 2-4 sentence answer instead of a few words.")
        cap = 6.5
    return {"nudge_vi": nudge_vi, "nudge_en": nudge_en, "fluency_cap": cap}


def _session_length_nudges(scope: str, clean_turns: list[dict[str, str]],
                           total_words: int) -> list[dict[str, Any]]:
    """Deterministic under-development checks for holistic session scoring."""
    if scope in _PART_META:
        n = _length_nudge_for_word_count(scope, total_words)
        return [n] if n else []

    by_part: dict[str, int] = {"part1": 0, "part2": 0, "part3": 0}
    for t in clean_turns:
        part = t.get("part") if t.get("part") in by_part else None
        if not part:
            continue
        by_part[part] += len(re.findall(r"[a-zA-Z']+", t.get("transcript") or ""))

    nudges: list[dict[str, Any]] = []
    for part in ("part1", "part2", "part3"):
        wc = by_part[part]
        if wc <= 0:
            continue
        n = _length_nudge_for_word_count(part, wc)
        if n:
            nudges.append(n)
    return nudges


def _float_or_none(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _word_clarity_with_timing(words: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    """Keep the old clarity heatmap contract and add word timing for pause UI."""
    out: list[dict[str, Any]] = []
    prev_end: float | None = None
    for x in words or []:
        if not isinstance(x, dict):
            continue
        w = str(x.get("w") or "").strip()
        if not w:
            continue

        p = _float_or_none(x.get("p"))
        start = _float_or_none(x.get("start"))
        end = _float_or_none(x.get("end"))
        item: dict[str, Any] = {"w": w, "p": round(p, 3) if p is not None else 1.0}

        if start is not None:
            item["start"] = round(start, 3)
        if end is not None:
            item["end"] = round(end, 3)
        if prev_end is not None and start is not None:
            item["gap"] = round(max(0.0, start - prev_end), 3)

        if end is not None:
            prev_end = end
        elif start is not None:
            prev_end = start
        out.append(item)
    return out


# ---------------------------------------------------------------------------
# LLM call (OpenAI-compatible chat completions)
# ---------------------------------------------------------------------------
def _call_llm(*, base_url: str, api_key: str, model: str,
              system: str, user: str, force_json: bool = True,
              timeout: float = 90.0) -> str:
    payload: dict[str, Any] = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.0,
        "max_tokens": 2048,
    }
    if force_json:
        payload["response_format"] = {"type": "json_object"}

    url = base_url.rstrip("/") + "/chat/completions"
    with httpx.Client(timeout=timeout) as client:
        resp = client.post(
            url,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload,
        )
    if resp.status_code != 200:
        raise RuntimeError(f"LLM HTTP {resp.status_code}: {resp.text[:400]}")
    data = resp.json()
    try:
        msg = data["choices"][0]["message"]
    except (KeyError, IndexError) as e:
        raise RuntimeError(f"LLM unexpected response shape: {data}") from e
    # Reasoning models (e.g. gpt-oss) may leave content empty and put text in reasoning fields.
    content = msg.get("content")
    if not content:
        content = msg.get("reasoning_content") or msg.get("reasoning")
    if not content:
        raise RuntimeError(f"LLM returned empty content: {data}")
    return content


def _parse_examiner_json(raw: str) -> ExaminerResult:
    # Strip code fences if the model added them despite JSON mode.
    s = raw.strip()
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?\s*", "", s)
        s = re.sub(r"\s*```$", "", s)
    return ExaminerResult.model_validate_json(s)


_SCORE_FIELDS = (
    "fluency_coherence",
    "lexical_resource",
    "grammatical_range_accuracy",
    "pronunciation",
)
_CAREFUL_GRADE_PASSES = 3


def _grade_once(*, base_url: str, api_key: str, model: str, system: str,
                user: str, timeout: float = 90.0) -> ExaminerResult:
    """Run one schema-validated examiner pass, with one JSON repair attempt."""
    raw = _call_llm(base_url=base_url, api_key=api_key, model=model,
                    system=system, user=user, force_json=True, timeout=timeout)
    try:
        return _parse_examiner_json(raw)
    except (ValidationError, json.JSONDecodeError) as e:
        repair_user = (
            "Your previous response did not match the required schema. "
            f"Validator error: {str(e)[:300]}\n\nPrevious response was:\n" + raw[:2000] +
            "\n\nReturn ONLY a corrected JSON object matching the schema in the system message."
        )
        raw2 = _call_llm(base_url=base_url, api_key=api_key, model=model,
                         system=system, user=repair_user, force_json=True, timeout=timeout)
        try:
            return _parse_examiner_json(raw2)
        except (ValidationError, json.JSONDecodeError) as e2:
            raise RuntimeError(f"Examiner JSON failed twice: {e2}\nRaw: {raw2[:400]}") from e2


def _median_examiner_result(results: list[ExaminerResult]) -> ExaminerResult:
    """Keep feedback from the closest full pass while using conservative medians.

    A criterion-by-criterion median stabilises stochastic examiner calls. Feedback,
    however, must come from one real evaluation instead of being stitched together
    from three incompatible answers. With two usable calls after a transient error,
    choose the lower middle band, matching the examiner's conservative policy.
    """
    if not results:
        raise ValueError("at least one examiner result is required")

    medians = {
        field: sorted(getattr(result.scores, field) for result in results)[(len(results) - 1) // 2]
        for field in _SCORE_FIELDS
    }
    representative = min(
        results,
        key=lambda result: sum(
            (getattr(result.scores, field) - medians[field]) ** 2 for field in _SCORE_FIELDS
        ),
    ).model_copy(deep=True)
    for field, value in medians.items():
        setattr(representative.scores, field, value)
    return representative


def _grade_with_consistency(*, base_url: str, api_key: str, model: str,
                            system: str, user: str, careful_grade: bool,
                            timeout: float = 90.0) -> tuple[ExaminerResult, int]:
    """Return a normal grade, or the median of three independent grade attempts.

    The first valid grade remains mandatory. Extra careful-grade attempts are best
    effort so a later provider timeout never discards a useful finished evaluation.
    """
    results = [_grade_once(base_url=base_url, api_key=api_key, model=model,
                           system=system, user=user, timeout=timeout)]
    if not careful_grade:
        return results[0], 1

    for _ in range(_CAREFUL_GRADE_PASSES - 1):
        try:
            results.append(_grade_once(base_url=base_url, api_key=api_key, model=model,
                                       system=system, user=user, timeout=timeout))
        except Exception:  # A completed first grade is more useful than a failed retry.
            continue
    return _median_examiner_result(results), len(results)


def _finalize_score_and_band_gap(result: ExaminerResult) -> None:
    """Recompute arithmetic and anchor the gap to the actual weakest score."""
    s = result.scores
    s.overall_band = round(statistics.mean([
        s.fluency_coherence, s.lexical_resource,
        s.grammatical_range_accuracy, s.pronunciation,
    ]) * 2) / 2
    crit_map = [
        ("Fluency & Coherence", s.fluency_coherence),
        ("Lexical Resource", s.lexical_resource),
        ("Grammatical Range & Accuracy", s.grammatical_range_accuracy),
        ("Pronunciation", s.pronunciation),
    ]
    weak_label, weak_band = min(crit_map, key=lambda kv: kv[1])
    result.band_gap.weakest_criterion = weak_label
    result.band_gap.current_band = weak_band
    result.band_gap.next_band = min(9.0, weak_band + 0.5)


# ---------------------------------------------------------------------------
# Service entry point
# ---------------------------------------------------------------------------
def _no_speech_result(transcript: Transcript, feats: AcousticFeatures, model: str,
                      careful_grade: bool = False) -> dict[str, Any]:
    """Returned when the recording has essentially no speech — we do NOT ask the
    LLM to invent a band for silence. UI shows a friendly retry message."""
    empty = lambda: {"fluency_coherence": [], "lexical_resource": [],
                     "grammatical_range_accuracy": [], "pronunciation": []}
    return {
        "no_speech": True,
        "user_transcript": transcript.cleaned_text or "",
        "fluency_score": None,
        "lexical_score": None,
        "grammar_score": None,
        "pronunciation_score": None,
        "overall_band": None,
        "examiner_feedback": {
            "evidence": empty(),
            "feedback_vi": empty(),
            "next_steps_vi": [
                "Mình gần như không nghe thấy giọng nói trong bản ghi này.",
                "Kiểm tra micro, nói to và rõ hơn, rồi thu lại nhé.",
            ],
            "feedback_en": empty(),
            "next_steps_en": [
                "I could barely hear any speech in this recording.",
                "Check your microphone, speak louder and clearer, then record again.",
            ],
            "acoustic_features": feats.to_dict(),
            "band_gap": BandGap().model_dump(),
        },
        "examiner_model": model,
        "grading_mode": "standard",
        "grading_passes": 0,
        "careful_grade_requested": careful_grade,
        "duration_sec": transcript.duration_sec,
    }


# ---------------------------------------------------------------------------
# Adaptive examiner follow-up (Part 1 occasional, Part 3 probing)
# ---------------------------------------------------------------------------
# A real examiner reacts to the candidate's answer with a natural follow-up
# rather than only reading fixed questions. This returns ONE short follow-up
# (or a move-on signal) under strict interlocutor discipline.
FOLLOWUP_SYSTEM = """You are a certified IELTS Speaking examiner conducting the live test. Given the \
current part, the question you just asked, and the candidate's answer, decide whether to ask ONE short, \
natural FOLLOW-UP question before moving on.

RULES:
- You are ONLY the interlocutor. NEVER coach, correct, praise, evaluate, or give any feedback or opinion. \
Never explain anything. Never use the candidate's name. Do not start with "Great", "Good", etc.
- A follow-up must be ONE concise spoken question (about 8-20 words) that arises naturally from what the \
candidate actually said.
- PART 1: only OCCASIONALLY add a brief 'why / how / can you give an example' follow-up; if the answer \
already covers it, move on.
- PART 3: this is a discussion — probe and extend the candidate's reasoning (ask them to justify, compare, \
consider an opposing view, or give an example). A follow-up is usually appropriate UNLESS the answer was \
already fully developed and justified.
- PART 2: NEVER add a follow-up here — return move_on.
- If the answer is empty, off-topic, very short, or already thoroughly developed, return move_on.

Return ONLY this JSON object (no markdown): {"move_on": <true|false>, "follow_up": "<the question, or empty string>"}"""

FOLLOWUP_USER_TMPL = """PART: {part}
QUESTION YOU ASKED: {question}
CANDIDATE'S ANSWER: {answer}

RECENT CONTEXT (earlier turns this test):
{context}

Decide now. Return the JSON object only."""


def next_turn(part: str, question: str, answer: str,
              context_turns: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    """Decide the examiner's next move after an answer. Returns
    {"move_on": bool, "follow_up": str}. Never raises for ordinary cases —
    on any error it safely returns move_on so the fixed script continues."""
    part = part if part in ("part1", "part2", "part3") else "part1"
    ans = (answer or "").strip()
    # Part 2 is a monologue; trivially short answers aren't worth probing.
    if part == "part2" or len(re.findall(r"[a-zA-Z']+", ans)) < 4:
        return {"move_on": True, "follow_up": ""}

    api_key = os.getenv("EXAMINER_API_KEY")
    if not api_key:
        return {"move_on": True, "follow_up": ""}
    base_url = os.getenv("EXAMINER_BASE_URL", "https://api.groq.com/openai/v1")
    model = os.getenv("EXAMINER_MODEL", "llama-3.3-70b-versatile")

    ctx_lines: list[str] = []
    for t in (context_turns or [])[-4:]:
        q = str(t.get("question") or "").strip()
        a = str(t.get("answer") or t.get("transcript") or "").strip()
        if q or a:
            ctx_lines.append(f"Q: {q}\nA: {a}")
    user = FOLLOWUP_USER_TMPL.format(
        part=part, question=(question or "").strip(), answer=ans,
        context="\n\n".join(ctx_lines) or "(none)",
    )
    try:
        raw = _call_llm(base_url=base_url, api_key=api_key, model=model,
                        system=FOLLOWUP_SYSTEM, user=user, force_json=True, timeout=45.0)
        s = raw.strip()
        if s.startswith("```"):
            s = re.sub(r"^```(?:json)?\s*", "", s)
            s = re.sub(r"\s*```$", "", s)
        data = json.loads(s)
    except Exception:  # noqa: BLE001 — never let a follow-up failure break the interview
        return {"move_on": True, "follow_up": ""}

    fu = str(data.get("follow_up") or "").strip().strip('"')
    move = bool(data.get("move_on")) or not fu
    return {"move_on": move, "follow_up": "" if move else fu}


# ---------------------------------------------------------------------------
# Holistic WHOLE-SESSION scoring (Part 1 + 2 + 3 in one examiner pass)
# ---------------------------------------------------------------------------
# A real examiner awards ONE band per criterion for the entire interview, not a
# per-answer average. This scores the full transcript once, with the masterclass
# "Dos/Don'ts" rubric + the Band 7->8 error-density line baked in.
_SESSION_PREAMBLE = """You are a certified IELTS Speaking examiner (British Council / IDP). You have just \
conducted a COMPLETE Speaking interview (Part 1 short questions, Part 2 long turn, Part 3 discussion) \
and must now award ONE holistic band per criterion for the WHOLE performance, applying the OFFICIAL \
PUBLIC BAND DESCRIPTORS. Do NOT score the parts separately or average them — judge the candidate's \
sustained performance across the entire test, weighting Part 2 and Part 3 most heavily for range.

Score 4 criteria, each band 0-9 in 0.5 steps:

{_BAND_CALIBRATION}

FLUENCY & COHERENCE — reward speaking at length with natural flow, clear signposting/discourse markers, \
and developed ideas: reasons, examples, contrasts, extra detail, and clear completion of the thought. \
Content-related hesitation while thinking about ideas is less serious than language-searching pauses. \
Do NOT reward memorised chunks, constant self-correction, repeating the same points, unnaturally \
inserted or over-used linking words, or very short/list-like answers. Natural pauses are fine.

LEXICAL RESOURCE — reward natural, appropriate, flexible topic vocabulary, accurate collocations, \
and effective paraphrase when a word is unknown. Do NOT use rare_word_ratio, advanced-word count, \
or idiom count as a shortcut for a higher LR band. A fluent, natural answer using common words \
accurately can score as high as, or higher than, a stilted answer stuffed with advanced vocabulary. \
Penalise repeated words when they limit meaning, but also penalise forced complex words, wrong or \
inappropriate idioms, and recited 'academic word list' vocabulary.

GRAMMATICAL RANGE & ACCURACY — reward a range of complex structures, a variety of appropriate \
structures, and correct tenses. Apply the Band 7->8 line precisely: Band 7 = FREQUENTLY produces \
error-free sentences but still makes some errors; Band 8 = the MAJORITY of sentences are error-free, \
any errors are NOT basic or systematic, and the candidate shows full control of structures and tenses. \
Penalise basic or systematic errors.

PRONUNCIATION — reward connected speech, word and sentence stress, and expressive intonation; do NOT \
reward over-clear, robotic chunking. You only have the transcript + aggregated acoustic metrics (no \
phoneme audio), so be CONSERVATIVE and say so in the pronunciation feedback.

VIETNAMESE-L1 WATCH: dropped articles, missing 3rd-person -s and past -ed, omitted final consonants, \
weak word stress, overuse of 'very'.

PROTOCOL:
1. Cite 2-3 short evidence quotes per criterion, drawn from anywhere in the interview.
2. Use the AGGREGATED ACOUSTIC FEATURES JSON (wpm, pauses, fillers) to inform Fluency & Coherence and \
partly Pronunciation. Treat rare_word_ratio as a rough diversity flag only; never reward a high \
rare_word_ratio or advanced-word count by itself for Lexical Resource.
3. When the performance is under-developed, give fluency/development advice first: add a reason, \
example, contrast, or extra detail; do not tell the learner simply to use bigger words.
4. overall_band = arithmetic mean of the 4 sub-scores, rounded to the nearest 0.5.
5. Give feedback in BOTH Vietnamese (feedback_vi/next_steps_vi) AND English (feedback_en/next_steps_en) \
— 2-3 actionable bullets per criterion; the English must mirror the Vietnamese.
6. Identify the SINGLE weakest criterion and, in band_gap, explain in BOTH languages \
(why_not_higher_vi/to_improve_vi AND why_not_higher_en/to_improve_en) exactly what is blocking the next \
half-band, with 2 concrete actions tied to THIS performance.

"""
_SESSION_PREAMBLE = _SESSION_PREAMBLE.replace("{_BAND_CALIBRATION}", _BAND_CALIBRATION)
# Reuse the exact JSON schema block from the per-turn prompt so both graders emit
# an identical shape (the parser/repair path is shared).
_EXAMINER_SCHEMA_BLOCK = EXAMINER_SYSTEM[EXAMINER_SYSTEM.index("You MUST return ONLY"):]
_SESSION_CRITERIA_BLOCK = _SESSION_PREAMBLE[_SESSION_PREAMBLE.index("Score 4 criteria"):]
EXAMINER_SESSION_SYSTEM = _SESSION_PREAMBLE + _EXAMINER_SCHEMA_BLOCK

# When the user drills ONE part (not a full test), prepend an honest caveat so the
# examiner scores only what that part can show and says so in the feedback.
_SCOPE_NOTE = {
    "part1": "IMPORTANT: This is a PART 1 PRACTICE DRILL, not a full test — you are scoring ONLY a set of "
             "Part 1 short-question answers. Judge what this sample shows; you cannot fully assess 'speaks at "
             "length' (that needs Part 2), so be fair and state in the feedback that this band reflects a "
             "Part-1-only sample.",
    "part2": "IMPORTANT: This is a PART 2 PRACTICE DRILL, not a full test — you are scoring ONLY the Part 2 long "
             "turn (plus any rounding-off). Judge the sustained long-turn performance and state in the feedback "
             "that this band reflects a Part-2-only sample.",
    "part3": "IMPORTANT: This is a PART 3 PRACTICE DRILL, not a full test — you are scoring ONLY the Part 3 "
             "discussion answers. Judge the depth/justification of the ideas and state in the feedback that this "
             "band reflects a Part-3-only sample.",
}

_SCOPE_USER_LABEL = {
    "part1": "IELTS SPEAKING PART 1 PRACTICE DRILL TRANSCRIPT",
    "part2": "IELTS SPEAKING PART 2 LONG-TURN PRACTICE DRILL TRANSCRIPT",
    "part3": "IELTS SPEAKING PART 3 DISCUSSION PRACTICE DRILL TRANSCRIPT",
}

_SCOPE_USER_INSTRUCTION = {
    "part1": (
        "Award ONE part-level band estimate for this Part 1 practice drill only. "
        "Do not treat it as a complete IELTS Speaking test score. Return the JSON object only."
    ),
    "part2": (
        "Award ONE part-level band estimate for this Part 2 long-turn practice drill only. "
        "Do not treat it as a complete IELTS Speaking test score. Return the JSON object only."
    ),
    "part3": (
        "Award ONE part-level band estimate for this Part 3 discussion practice drill only. "
        "Do not treat it as a complete IELTS Speaking test score. Return the JSON object only."
    ),
}


def _session_system_for_scope(scope: str) -> str:
    if scope == "full":
        return EXAMINER_SESSION_SYSTEM
    return _SCOPE_NOTE[scope] + "\n\n" + _SESSION_CRITERIA_BLOCK + _EXAMINER_SCHEMA_BLOCK

SESSION_USER_TMPL = """FULL IELTS SPEAKING INTERVIEW TRANSCRIPT (all parts, in order):
{interview}

AGGREGATED ACOUSTIC FEATURES (JSON — summed/averaged across the candidate's answers):
{features}

Award ONE holistic band per criterion for the whole performance. Return the JSON object only."""


def _session_user_prompt(scope: str, interview: str, features: dict[str, Any]) -> str:
    features_json = json.dumps(features, ensure_ascii=False)
    if scope == "full":
        return SESSION_USER_TMPL.format(interview=interview, features=features_json)
    return f"""{_SCOPE_USER_LABEL[scope]}:
{interview}

AGGREGATED ACOUSTIC FEATURES (JSON - summed/averaged across the candidate's answers in this drill):
{features_json}

{_SCOPE_USER_INSTRUCTION[scope]}"""

_SESSION_LABELS = {"part1": "PART 1", "part2": "PART 2 (long turn)", "part3": "PART 3"}


def aggregate_features(feats_list: list[dict[str, Any]] | None) -> dict[str, Any]:
    """Combine per-turn acoustic feature dicts into one session-level snapshot.
    Counts are summed; rates (wpm, filler/100w) are recomputed from the totals;
    ratios (TTR, complexity) are averaged as a rough guide (they are not additive)."""
    feats = [f for f in (feats_list or []) if isinstance(f, dict)]
    if not feats:
        return {}
    def _sum(k: str) -> float:
        return sum(float(f.get(k) or 0) for f in feats)
    def _mean(k: str) -> float:
        vals = [float(f.get(k)) for f in feats if f.get(k) is not None]
        return round(statistics.mean(vals), 3) if vals else 0.0
    total_words = _sum("word_count")
    speak = _sum("speaking_time_sec")
    fillers = _sum("filler_count")
    return {
        "duration_sec": round(_sum("duration_sec"), 2),
        "speaking_time_sec": round(speak, 2),
        "word_count": int(total_words),
        "wpm": round(total_words / (speak / 60), 1) if speak else 0.0,
        "pause_count": int(_sum("pause_count")),
        "long_pause_count": int(_sum("long_pause_count")),
        "mean_pause_sec": _mean("mean_pause_sec"),
        "max_pause_sec": round(max((float(f.get("max_pause_sec") or 0) for f in feats), default=0.0), 3),
        "filler_count": int(fillers),
        "filler_per_100w": round(fillers / total_words * 100, 2) if total_words else 0.0,
        "type_token_ratio": _mean("type_token_ratio"),
        "rare_word_ratio": _mean("rare_word_ratio"),
        "connective_count": int(_sum("connective_count")),
        "complex_clause_ratio": _mean("complex_clause_ratio"),
        "self_correction_count": int(_sum("self_correction_count")),
        "turns_scored": len(feats),
    }


def _no_speech_session(combined: str, agg: dict[str, Any], model: str, scope: str = "full",
                       careful_grade: bool = False) -> dict[str, Any]:
    empty = lambda: {"fluency_coherence": [], "lexical_resource": [],
                     "grammatical_range_accuracy": [], "pronunciation": []}
    return {
        "session": True, "no_speech": True,
        "user_transcript": combined,
        "fluency_score": None, "lexical_score": None, "grammar_score": None,
        "pronunciation_score": None, "overall_band": None,
        "examiner_feedback": {
            "evidence": empty(), "feedback_vi": empty(), "feedback_en": empty(),
            "next_steps_vi": ["Mình gần như không nghe thấy giọng nói trong bài thi này.",
                              "Kiểm tra micro, nói to và rõ hơn, rồi thu lại nhé."],
            "next_steps_en": ["I could barely hear any speech in this interview.",
                              "Check your microphone, speak louder and clearer, then try again."],
            "acoustic_features": agg, "band_gap": BandGap().model_dump(),
        },
        "examiner_model": model,
        "scope": scope,
        "grading_mode": "standard",
        "grading_passes": 0,
        "careful_grade_requested": careful_grade,
    }


def score_session(turns: list[dict[str, Any]], agg_features: dict[str, Any] | None = None,
                  scope: str = "full", careful_grade: bool = False) -> dict[str, Any]:
    """Score a whole mock interview (or a single-part drill) in one holistic pass.
    `turns` = [{part, question, transcript}, ...]; `scope` = full|part1|part2|part3
    (a non-full scope makes the examiner score only that part and say so)."""
    scope = scope if scope in ("part1", "part2", "part3") else "full"
    system = _session_system_for_scope(scope)
    api_key = os.getenv("EXAMINER_API_KEY")
    if not api_key:
        raise RuntimeError(
            "EXAMINER_API_KEY missing — set it in speaking-backend/.env "
            "(Groq, OpenAI, or any OpenAI-compatible provider)."
        )
    base_url = os.getenv("EXAMINER_BASE_URL", "https://api.groq.com/openai/v1")
    model = os.getenv("EXAMINER_MODEL", "llama-3.3-70b-versatile")

    clean_turns: list[dict[str, str]] = []
    lines: list[str] = []
    total_words = 0
    for t in (turns or []):
        part = (str(t.get("part") or "").strip() or "part?")
        q = str(t.get("question") or t.get("question_text") or "").strip()
        a = str(t.get("transcript") or t.get("user_transcript") or "").strip()
        if a:
            total_words += len(re.findall(r"[a-zA-Z']+", a))
        label = _SESSION_LABELS.get(part, part.upper())
        lines.append(f"[{label}] EXAMINER: {q}\n[{label}] CANDIDATE: {a or '(no answer)'}")
        clean_turns.append({"part": part, "question": q, "transcript": a})

    combined = "\n\n".join(lines)
    agg = agg_features or {}
    if total_words < 10:
        return _no_speech_session(combined, agg, model, scope=scope, careful_grade=careful_grade)

    user = _session_user_prompt(scope, combined, agg)
    result, grading_passes = _grade_with_consistency(
        base_url=base_url, api_key=api_key, model=model, system=system, user=user,
        careful_grade=careful_grade, timeout=120.0,
    )
    s = result.scores
    nudges = _session_length_nudges(scope, clean_turns, total_words)
    if nudges:
        cap = min(float(n["fluency_cap"]) for n in nudges)
        if s.fluency_coherence > cap:
            s.fluency_coherence = cap
        result.next_steps_vi = [n["nudge_vi"] for n in nudges] + result.next_steps_vi
        result.next_steps_en = [n["nudge_en"] for n in nudges] + (result.next_steps_en or [])
    # Never trust LLM arithmetic — recompute the overall.
    _finalize_score_and_band_gap(result)

    return {
        "session": True,
        "user_transcript": "\n\n".join(
            f"[{t['part']}] {t['transcript']}" for t in clean_turns if t["transcript"]),
        "fluency_score": s.fluency_coherence,
        "lexical_score": s.lexical_resource,
        "grammar_score": s.grammatical_range_accuracy,
        "pronunciation_score": s.pronunciation,
        "overall_band": s.overall_band,
        "examiner_feedback": {
            "evidence": result.evidence.model_dump(),
            "feedback_vi": result.feedback_vi.model_dump(),
            "next_steps_vi": result.next_steps_vi,
            "feedback_en": result.feedback_en.model_dump(),
            "next_steps_en": result.next_steps_en,
            "acoustic_features": agg,
            "band_gap": result.band_gap.model_dump(),
        },
        "examiner_model": model,
        "scope": scope,
        "grading_mode": "careful" if careful_grade and grading_passes > 1 else "standard",
        "grading_passes": grading_passes,
        "careful_grade_requested": careful_grade,
    }


# ---------------------------------------------------------------------------
# Band-7 model answer + collocations (learn-by-contrast → Lexical Resource)
# ---------------------------------------------------------------------------
MODEL_ANSWER_SYSTEM = """You are an expert IELTS Speaking coach. Write a natural, realistic, well-developed Band 7-8 \
MODEL ANSWER to the given Speaking question, then translate it to Vietnamese, then list the key \
collocations.

RULES:
- Sound like a real candidate speaking, NOT a written essay: natural, first-person, relatable.
- If the candidate's own answer is given, keep THEIR idea/angle but develop it naturally with a reason, \
example, contrast, or extra detail; improve accuracy and coherence without making it sound scripted. \
Never copy their grammar errors.
- Weave in 4-6 useful, natural COLLOCATIONS / topic phrases where they genuinely fit. Do not stuff the \
answer with advanced words, rare idioms, or forced 'academic word list' language.
- Wrap each of those key phrases in **double asterisks** in BOTH the English answer AND the Vietnamese \
translation (mark the matching Vietnamese phrase).
- Length by part: Part 1 = 3-4 sentences; Part 2 = a 180-220 word long turn; Part 3 = 4-6 developed \
sentences with a reason/example.
- The Vietnamese translation must mirror the English meaning.

Return ONLY this JSON object (no markdown fences):
{
  "answer_en":    "<model answer with key phrases in **bold**>",
  "answer_vi":    "<Vietnamese translation, same phrases in **bold**>",
  "collocations": [ {"phrase": "<English collocation>", "meaning_vi": "<short Vietnamese gloss>"} ]
}"""

MODEL_ANSWER_USER_TMPL = """PART: {part_label}
QUESTION: {question}
{candidate}

Write the Band 7-8 model answer now. Return the JSON object only."""


class _ModelAnswer(BaseModel):
    answer_en: str = ""
    answer_vi: str = ""
    collocations: list[dict] = Field(default_factory=list)


def _strip_fences(s: str) -> str:
    s = s.strip()
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?\s*", "", s)
        s = re.sub(r"\s*```$", "", s)
    return s


def generate_model_answer(question: str, part: str = "part1", transcript: str = "") -> dict[str, Any]:
    """One LLM call → a Band 7-8 model answer (key phrases in **bold**) + Vietnamese
    translation + a collocations list, in the bilingual highlighted style of the
    user's reference bank. Tied to the candidate's own answer when provided."""
    api_key = os.getenv("EXAMINER_API_KEY")
    if not api_key:
        raise RuntimeError("EXAMINER_API_KEY missing — set it in speaking-backend/.env.")
    base_url = os.getenv("EXAMINER_BASE_URL", "https://api.groq.com/openai/v1")
    model = os.getenv("EXAMINER_MODEL", "llama-3.3-70b-versatile")
    part = part if part in _PART_META else "part1"
    cand = (transcript or "").strip()
    cand_line = (f"CANDIDATE'S OWN ANSWER (keep their idea, elevate it):\n{cand}"
                 if cand else "No candidate answer given — write a strong generic model answer.")
    user = MODEL_ANSWER_USER_TMPL.format(
        part_label=_PART_META[part]["label"], question=(question or "").strip(), candidate=cand_line)

    raw = _call_llm(base_url=base_url, api_key=api_key, model=model,
                    system=MODEL_ANSWER_SYSTEM, user=user, force_json=True, timeout=90.0)
    try:
        ma = _ModelAnswer.model_validate_json(_strip_fences(raw))
    except (ValidationError, json.JSONDecodeError):
        raw2 = _call_llm(base_url=base_url, api_key=api_key, model=model,
                         system=MODEL_ANSWER_SYSTEM,
                         user="Return ONLY valid JSON matching the schema. Your previous reply:\n" + raw[:1500],
                         force_json=True, timeout=90.0)
        ma = _ModelAnswer.model_validate_json(_strip_fences(raw2))

    cols: list[dict[str, str]] = []
    seen: set[str] = set()
    for c in ma.collocations:
        if not isinstance(c, dict):
            continue
        p = str(c.get("phrase") or "").replace("**", "").strip()
        key = p.lower()
        if p and key not in seen:
            seen.add(key)
            cols.append({"phrase": p, "meaning_vi": str(c.get("meaning_vi") or "").strip()})
    return {"answer_en": ma.answer_en, "answer_vi": ma.answer_vi,
            "collocations": cols, "examiner_model": model}


def score_transcript(question: str, transcript: Transcript, part: str = "part1",
                     careful_grade: bool = False) -> dict[str, Any]:
    api_key = os.getenv("EXAMINER_API_KEY")
    if not api_key:
        raise RuntimeError(
            "EXAMINER_API_KEY missing — set it in speaking-backend/.env "
            "(Groq, OpenAI, or any OpenAI-compatible provider)."
        )
    base_url = os.getenv("EXAMINER_BASE_URL", "https://api.groq.com/openai/v1")
    model = os.getenv("EXAMINER_MODEL", "llama-3.3-70b-versatile")

    feats = extract_acoustic_features(transcript)

    # Silence / no-speech guard — scoring an empty answer yields garbage bands.
    if feats.word_count < 3:
        return _no_speech_result(transcript, feats, model, careful_grade=careful_grade)

    part = part if part in _PART_META else "part1"
    meta = _PART_META[part]
    user = EXAMINER_USER_TMPL.format(
        part_label=meta["label"],
        part_expectation=meta["expectation"],
        question=question,
        transcript=transcript.cleaned_text or "(no speech detected)",
        features=json.dumps(feats.to_dict(), ensure_ascii=False),
    )

    result, grading_passes = _grade_with_consistency(
        base_url=base_url, api_key=api_key, model=model,
        system=EXAMINER_SYSTEM, user=user, careful_grade=careful_grade,
    )
    s = result.scores

    # Part-aware under-length handling: cap Fluency & Coherence (can't show "speaks at
    # length" on a too-short answer) and surface a bilingual "say more" nudge.
    nudge = _length_nudge(part, feats)
    if nudge:
        if s.fluency_coherence > nudge["fluency_cap"]:
            s.fluency_coherence = nudge["fluency_cap"]
        result.next_steps_vi = [nudge["nudge_vi"], *result.next_steps_vi]
        result.next_steps_en = [nudge["nudge_en"], *(result.next_steps_en or [])]

    # Recompute overall and anchor band_gap after any deterministic caps.
    _finalize_score_and_band_gap(result)

    return {
        "user_transcript": transcript.cleaned_text,
        "fluency_score": s.fluency_coherence,
        "lexical_score": s.lexical_resource,
        "grammar_score": s.grammatical_range_accuracy,
        "pronunciation_score": s.pronunciation,
        "overall_band": s.overall_band,
        "examiner_feedback": {
            "evidence": result.evidence.model_dump(),
            "feedback_vi": result.feedback_vi.model_dump(),
            "next_steps_vi": result.next_steps_vi,
            "feedback_en": result.feedback_en.model_dump(),
            "next_steps_en": result.next_steps_en,
            "acoustic_features": feats.to_dict(),
            "band_gap": result.band_gap.model_dump(),
        },
        "examiner_model": model,
        "grading_mode": "careful" if careful_grade and grading_passes > 1 else "standard",
        "grading_passes": grading_passes,
        "careful_grade_requested": careful_grade,
        "duration_sec": transcript.duration_sec,
        # Per-word ASR confidence plus timing for clarity and pause/hesitation UI.
        "word_clarity": _word_clarity_with_timing(transcript.word_timestamps),
    }
