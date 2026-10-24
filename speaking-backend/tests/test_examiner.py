"""Deterministic regression tests for examiner.py — NO LLM / no network.

Covers the pure, examiner-band-critical helpers so a future edit can't silently
break them: acoustic feature extraction (WPM over the spoken span, pause/filler
counting), session-level aggregation, the Scores band rounding/range guard, and
the no-LLM guard paths of the adaptive follow-up.

Run (no pytest needed):
    cd speaking-backend && ./.venv/Scripts/python.exe tests/test_examiner.py
Or, if pytest is installed:
    cd speaking-backend && ./.venv/Scripts/python.exe -m pytest tests/test_examiner.py
"""
from __future__ import annotations

import os
import sys

# Make `src` importable whether run via pytest or directly.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src import examiner as examiner_module  # noqa: E402
from src.examiner import (  # noqa: E402
    ExaminerResult, Scores, _finalize_score_and_band_gap,
    _grade_with_consistency, _median_examiner_result,
    aggregate_features, extract_acoustic_features, next_turn, score_session,
    score_transcript,
)
from src.transcriber import Transcript  # noqa: E402


def test_extract_acoustic_features():
    # 8 words; "um" + "like" are both in the filler list; one 0.5s gap = one pause.
    wts = [
        {"w": "I", "start": 0.0, "end": 0.2},
        {"w": "um", "start": 0.3, "end": 0.5},
        {"w": "really", "start": 0.6, "end": 1.0},
        {"w": "like", "start": 1.1, "end": 1.4},
        {"w": "coffee", "start": 1.5, "end": 2.0},
        {"w": "because", "start": 2.5, "end": 3.0},   # 0.5s gap before this
        {"w": "it", "start": 3.1, "end": 3.3},
        {"w": "helps", "start": 3.4, "end": 3.8},
    ]
    tr = Transcript(
        raw_text="I um really like coffee because it helps.",
        cleaned_text="I um really like coffee because it helps.",
        asr_model="test", word_timestamps=wts, duration_sec=4.5,
    )
    f = extract_acoustic_features(tr)
    assert f.word_count == 8, f.word_count
    assert f.filler_count == 2, f.filler_count            # "um" + "like"
    assert f.pause_count == 1, f.pause_count              # only the 0.5s gap > 0.3
    assert f.long_pause_count == 0, f.long_pause_count    # none > 1.0
    assert abs(f.max_pause_sec - 0.5) < 1e-6, f.max_pause_sec
    # WPM uses the SPOKEN span (3.8s), not the 4.5s clip duration.
    assert abs(f.speaking_time_sec - 3.8) < 0.05, f.speaking_time_sec
    assert 120.0 <= f.wpm <= 132.0, f.wpm                 # 8 / (3.8/60) ≈ 126.3


def test_aggregate_features():
    feats = [
        {"word_count": 20, "speaking_time_sec": 10, "filler_count": 1, "pause_count": 2,
         "long_pause_count": 0, "max_pause_sec": 0.8, "type_token_ratio": 0.8,
         "rare_word_ratio": 0.4, "connective_count": 1, "complex_clause_ratio": 0.1,
         "self_correction_count": 0, "mean_pause_sec": 0.4, "duration_sec": 11},
        {"word_count": 30, "speaking_time_sec": 20, "filler_count": 3, "pause_count": 4,
         "long_pause_count": 1, "max_pause_sec": 1.5, "type_token_ratio": 0.7,
         "rare_word_ratio": 0.5, "connective_count": 3, "complex_clause_ratio": 0.2,
         "self_correction_count": 1, "mean_pause_sec": 0.6, "duration_sec": 22},
    ]
    a = aggregate_features(feats)
    assert a["word_count"] == 50, a["word_count"]
    assert a["filler_count"] == 4, a["filler_count"]
    assert a["pause_count"] == 6, a["pause_count"]
    assert a["long_pause_count"] == 1, a["long_pause_count"]
    assert a["connective_count"] == 4, a["connective_count"]
    assert a["turns_scored"] == 2, a["turns_scored"]
    assert abs(a["wpm"] - 100.0) < 0.1, a["wpm"]               # 50 / (30/60)
    assert abs(a["filler_per_100w"] - 8.0) < 0.1, a["filler_per_100w"]  # 4/50*100
    assert abs(a["max_pause_sec"] - 1.5) < 1e-6, a["max_pause_sec"]
    assert aggregate_features([]) == {}
    assert aggregate_features(None) == {}


def test_scores_rounding_and_range():
    s = Scores(fluency_coherence=6.7, lexical_resource=7.0,
               grammatical_range_accuracy=6.2, pronunciation=7.4, overall_band=6.8)
    assert s.fluency_coherence == 6.5, s.fluency_coherence            # 6.7 -> 6.5
    assert s.grammatical_range_accuracy == 6.0, s.grammatical_range_accuracy  # 6.2 -> 6.0
    assert s.pronunciation == 7.5, s.pronunciation                   # 7.4 -> 7.5
    raised = False
    try:
        Scores(fluency_coherence=10, lexical_resource=7,
               grammatical_range_accuracy=7, pronunciation=7, overall_band=7)
    except Exception:
        raised = True
    assert raised, "band 10 must be rejected (out of [0,9])"


def _examiner_result(scores: tuple[float, float, float, float], label: str) -> ExaminerResult:
    fluency, lexical, grammar, pronunciation = scores
    return ExaminerResult.model_validate({
        "scores": {
            "fluency_coherence": fluency,
            "lexical_resource": lexical,
            "grammatical_range_accuracy": grammar,
            "pronunciation": pronunciation,
            "overall_band": 6.0,
        },
        "evidence": {},
        "feedback_vi": {
            "fluency_coherence": [label], "lexical_resource": [label],
            "grammatical_range_accuracy": [label], "pronunciation": [label],
        },
        "next_steps_vi": [label],
    })


def test_median_examiner_result_keeps_representative_feedback():
    first = _examiner_result((5.5, 6.0, 7.0, 7.0), "first")
    middle = _examiner_result((6.0, 6.5, 6.5, 6.5), "middle")
    last = _examiner_result((6.5, 6.0, 6.0, 6.0), "last")
    result = _median_examiner_result([first, middle, last])
    assert result.scores.fluency_coherence == 6.0
    assert result.scores.lexical_resource == 6.0
    assert result.scores.grammatical_range_accuracy == 6.5
    assert result.scores.pronunciation == 6.5
    assert result.next_steps_vi == ["middle"]


def test_finalize_score_and_band_gap_recomputes_weakest():
    result = _examiner_result((7.0, 6.5, 5.5, 7.5), "finalize")
    result.scores.overall_band = 9.0
    result.band_gap.weakest_criterion = "Fluency & Coherence"

    _finalize_score_and_band_gap(result)

    assert result.scores.overall_band == 6.5
    assert result.band_gap.weakest_criterion == "Grammatical Range & Accuracy"
    assert result.band_gap.current_band == 5.5
    assert result.band_gap.next_band == 6.0


def test_careful_grading_falls_back_to_completed_passes():
    first = _examiner_result((6.0, 7.0, 6.0, 7.0), "first")
    last = _examiner_result((7.0, 6.0, 7.0, 6.0), "last")
    outcomes = iter([first, RuntimeError("provider timeout"), last])
    old_grade_once = examiner_module._grade_once

    def fake_grade_once(**_kwargs):
        outcome = next(outcomes)
        if isinstance(outcome, Exception):
            raise outcome
        return outcome

    examiner_module._grade_once = fake_grade_once
    try:
        result, pass_count = _grade_with_consistency(
            base_url="http://example.invalid", api_key="test", model="test",
            system="system", user="user", careful_grade=True,
        )
    finally:
        examiner_module._grade_once = old_grade_once

    assert pass_count == 2
    assert result.scores.fluency_coherence == 6.0
    assert result.scores.lexical_resource == 6.0
    assert result.scores.grammatical_range_accuracy == 6.0
    assert result.scores.pronunciation == 6.0
    assert result.next_steps_vi == ["first"]


def test_no_speech_paths_keep_careful_metadata_without_llm():
    old_key = os.environ.get("EXAMINER_API_KEY")
    os.environ["EXAMINER_API_KEY"] = "test-key"
    try:
        tr = Transcript(raw_text="", cleaned_text="", asr_model="test",
                        word_timestamps=[], duration_sec=2.0)
        single = score_transcript("Do you like coffee?", tr, careful_grade=True)
        assert single["no_speech"] is True
        assert single["grading_mode"] == "standard"
        assert single["grading_passes"] == 0
        assert single["careful_grade_requested"] is True

        session = score_session(
            [{"part": "part1", "question": "Do you like coffee?", "transcript": ""}],
            careful_grade=True,
        )
        assert session["no_speech"] is True
        assert session["grading_mode"] == "standard"
        assert session["grading_passes"] == 0
        assert session["careful_grade_requested"] is True
    finally:
        if old_key is None:
            os.environ.pop("EXAMINER_API_KEY", None)
        else:
            os.environ["EXAMINER_API_KEY"] = old_key


def test_score_session_keeps_careful_metadata_and_caps_short_part2():
    old_key = os.environ.get("EXAMINER_API_KEY")
    old_grade = examiner_module._grade_with_consistency
    os.environ["EXAMINER_API_KEY"] = "test-key"

    def fake_grade_with_consistency(**_kwargs):
        return _examiner_result((8.0, 7.0, 7.0, 7.0), "session"), 3

    examiner_module._grade_with_consistency = fake_grade_with_consistency
    try:
        short_part2 = " ".join(["answer"] * 50)
        session = score_session(
            [{"part": "part2", "question": "Describe a useful object.", "transcript": short_part2}],
            scope="part2",
            careful_grade=True,
        )
        assert session["grading_mode"] == "careful"
        assert session["grading_passes"] == 3
        assert session["careful_grade_requested"] is True
        assert session["fluency_score"] == 6.0, session["fluency_score"]
        assert session["overall_band"] == 7.0, session["overall_band"]
        assert "Part 2" in session["examiner_feedback"]["next_steps_en"][0]
    finally:
        examiner_module._grade_with_consistency = old_grade
        if old_key is None:
            os.environ.pop("EXAMINER_API_KEY", None)
        else:
            os.environ["EXAMINER_API_KEY"] = old_key


def test_next_turn_no_llm_guards():
    # Part 2 is a monologue — never a follow-up (no LLM call).
    assert next_turn("part2", "Describe a book",
                     "I read a fascinating long book about history last year.")["move_on"] is True
    # Too-short answer — move on (no LLM call).
    assert next_turn("part1", "Do you like coffee?", "Yes.")["move_on"] is True
    # Empty answer — move on.
    r = next_turn("part3", "Why do cities feel busier?", "")
    assert r["move_on"] is True and r["follow_up"] == ""


def _main() -> int:
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    failed = 0
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f"FAIL {t.__name__}: {type(e).__name__}: {e}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(_main())
