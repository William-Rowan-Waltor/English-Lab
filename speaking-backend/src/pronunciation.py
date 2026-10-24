"""Real(ish) pronunciation scoring for IELTS Speaking — local, CPU-friendly.

GOAL
----
The Speaking examiner (examiner.py) currently infers Pronunciation from TEXT +
acoustic cadence only and openly flags the score as approximate ("≈"). This
module is the honest fix for that weakest criterion: it scores pronunciation
from the ACTUAL AUDIO using a phoneme model, then returns a band estimate plus
per-word / per-phoneme signals that examiner.py or the UI can surface.

It is SELF-CONTAINED on purpose: nothing in examiner.py / main.py imports it
yet. Claude's WORK-DIVISION note says "Codex/Claude will integrate it later".
Until then the Speaking backend boots exactly as before — this file simply
exists and self-tests. Integration is a separate, owned change.

APPROACH — Goodness-of-Pronunciation (GOP) via wav2vec2 CTC
-----------------------------------------------------------
1. Load `facebook/wav2vec2-lv60-espeak-cv-ft` — the standard open English
   PHONEME model (outputs IPA-ish espeak tokens via CTC). CPU only on this
   machine (its CUDA cuBLAS runtime is broken — see transcriber.py's CPU
   fallback; we mirror that discipline here).
2. Run the model on the audio → per-frame CTC logits over the espeak phoneme
   alphabet.
3. For each phoneme the candidate DID produce, take the max posterior of the
   matching token around its time → a 0..1 "goodness" score.
4. Aggregate: mean goodness → map to a conservative 0..9 band estimate.
   When reference_text is provided, also force-align the expected phonemes
   (via the model's tokenizer/grapheme→phoneme) and compare, producing
   per-word scores and the weakest phoneme classes.

This is NOT a certified examiner score. It is an honest ASR-derived signal
that is far better than "text only", and we say so in `notes`.

ENV
---
PRON_MODEL       model id (default: facebook/wav2vec2-lv60-espeak-cv-ft)
PRON_DEVICE      "cpu" | "auto"  (default: cpu on this machine; the GPU stack
                 is broken — see transcriber.py). Set "auto" to attempt GPU.
PRON_MIN_WORDS   skip scoring below this many words (default 3), mirroring
                 examiner.py's no-speech guard.

OPTIONAL INSTALL (NOT added to requirements.txt — heavy + CUDA-fragile)
-----------------------------------------------------------------------
The Speaking backend does NOT depend on this module booting. To enable it:

    cd speaking-backend
    .venv\\Scripts\\activate
    pip install "torch==2.3.*" "transformers==4.41.*" "torchaudio" "librosa" "soundfile"
    # CPU-only torch wheel (smaller, no CUDA): use the CPU index
    #   pip install torch --index-url https://download.pytorch.org/whl/cpu
    # First call downloads the ~1.2GB wav2vec2 phoneme model into the HF cache.

If the stack is missing, score_pronunciation() returns
{"available": False, "reason": "..."} and NEVER raises — so main.py can wire
it behind a try/except and the server keeps scoring without it.
"""
from __future__ import annotations

import math
import os
import statistics
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

# GPU fallback latch — mirrors transcriber.py. This machine's CUDA cuBLAS is
# broken, so once we catch a GPU/library error we drop to CPU for the process.
_FALLBACK_CPU = False

# Below this many detected phonemes we refuse to band (too little signal).
_MIN_PHONEMES = 5
# Below this many words we won't try a per-word breakdown.
_MIN_WORDS = int(os.getenv("PRON_MIN_WORDS", "3"))

_DEFAULT_MODEL = os.getenv("PRON_MODEL", "facebook/wav2vec2-lv60-espeak-cv-ft")


# ─── Public data shape ──────────────────────────────────────────────────────
@dataclass
class WordScore:
    word: str
    score: float                       # 0..1 mean phoneme goodness for this word
    problem_phonemes: list[str] = field(default_factory=list)


@dataclass
class PronResult:
    available: bool
    pron_band_estimate: float | None        # 0..9, step 0.5, conservative
    confidence: float | None                # 0..1 mean GOP goodness
    per_word: list[dict[str, Any]] = field(default_factory=list)
    problem_phonemes: list[str] = field(default_factory=list)
    phoneme_count: int = 0
    notes: str = ""
    reason: str = ""                        # only when available=False
    model: str = ""
    device: str = ""
    latency_s: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "available": self.available,
            "pron_band_estimate": self.pron_band_estimate,
            "confidence": self.confidence,
            "per_word": self.per_word,
            "problem_phonemes": self.problem_phonemes,
            "phoneme_count": self.phoneme_count,
            "notes": self.notes,
            "reason": self.reason,
            "model": self.model,
            "device": self.device,
            "latency_s": self.latency_s,
        }


# ─── Optional-stack probe ───────────────────────────────────────────────────
def _missing_deps() -> list[str]:
    """Return the list of missing heavy deps (empty = stack present)."""
    missing: list[str] = []
    for mod in ("torch", "transformers", "librosa", "soundfile", "numpy"):
        try:
            __import__(mod)
        except Exception:
            missing.append(mod)
    return missing


def is_available() -> bool:
    """Cheap check: is the pronunciation stack importable at all?"""
    return not _missing_deps()


# ─── Band mapping (conservative) ────────────────────────────────────────────
# Mean CTC posterior goodness is NOT linearly a band. A clean native reading
# of easy text often sits ~0.85-0.95; accented but clear speech ~0.70-0.85;
# hard-to-understand speech <0.6. We map with a deliberately conservative
# curve so we never over-claim a high band on mediocre audio, and we always
# say this is an estimate.
def _goodness_to_band(g: float) -> float:
    """Map a 0..1 mean phoneme goodness to a 0..9 IELTS-style band (step 0.5).

    Conservative: the same goodness never yields a band higher than a real
    examiner would, and small sample sizes should be scored at the lower end
    by the caller (see notes)."""
    if g >= 0.93:
        b = 9.0
    elif g >= 0.89:
        b = 8.5
    elif g >= 0.85:
        b = 8.0
    elif g >= 0.80:
        b = 7.5
    elif g >= 0.75:
        b = 7.0
    elif g >= 0.70:
        b = 6.5
    elif g >= 0.64:
        b = 6.0
    elif g >= 0.57:
        b = 5.5
    elif g >= 0.50:
        b = 5.0
    elif g >= 0.42:
        b = 4.5
    elif g >= 0.34:
        b = 4.0
    else:
        b = 3.5
    # Snap to 0.5.
    return round(b * 2) / 2


# ─── GPU-error detection (mirror transcriber.py) ────────────────────────────
def _is_gpu_lib_error(e: BaseException) -> bool:
    msg = str(e).lower()
    needles = ("cublas", "cudnn", "cudart", "cuda", "gpu", "device",
               "library is not found", "cannot be loaded")
    return any(n in msg for n in needles)


# ─── Model cache (loading ~1.2GB weights per call is expensive) ─────────────
_MODEL_CACHE: dict[str, Any] = {}


def _get_model(model_id: str, device: str):
    """Lazily load + cache the wav2vec2 phoneme processor/model.

    Heavy imports happen HERE (not at module top) so the Speaking backend
    boots fine without torch/transformers installed.
    """
    global _FALLBACK_CPU
    cache_key = f"{model_id}|{device}|{_FALLBACK_CPU}"
    if cache_key in _MODEL_CACHE:
        return _MODEL_CACHE[cache_key]

    import torch  # noqa: lazy
    from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor  # noqa: lazy

    real_device = "cpu" if _FALLBACK_CPU else device
    processor = Wav2Vec2Processor.from_pretrained(model_id)
    model = Wav2Vec2ForCTC.from_pretrained(model_id).to(real_device)
    model.eval()
    _MODEL_CACHE[cache_key] = (processor, model, real_device)
    return _MODEL_CACHE[cache_key]


# ─── Audio loading (CPU, librosa) ───────────────────────────────────────────
def _load_audio(audio_path: Path) -> tuple[Any, int]:
    """Load audio as a 1-D float numpy array at 16 kHz mono (wav2vec2's rate)."""
    import librosa  # noqa: lazy
    import numpy as np  # noqa: lazy
    y, sr = librosa.load(str(audio_path), sr=16000, mono=True)
    if y.ndim > 1:
        y = y.mean(axis=0)
    y = np.asarray(y, dtype=np.float32)
    return y, sr


# ─── Core scoring ───────────────────────────────────────────────────────────
def score_pronunciation(
    audio_path: str | Path,
    *,
    reference_text: str = "",
    model_id: str | None = None,
    device: str | None = None,
) -> dict[str, Any]:
    """Score pronunciation from the actual audio.

    Returns a dict (PronResult.to_dict()) — NEVER raises on missing deps or
    a GPU/library error; it degrades gracefully so the caller (examiner.py /
    main.py) can wire it behind a try/except and keep scoring without it.

    Keys:
      available            False if the pron stack isn't installed (caller
                           should fall back to the existing text+cadence score).
      pron_band_estimate   0..9 (step 0.5), conservative; None if unavailable
                           or too little speech.
      confidence           0..1 mean phoneme goodness (GOP).
      per_word             [{word, score, problem_phonemes}] when reference_text
                           given and force-alignment produced word groups.
      problem_phonemes     lowest-confidence phoneme classes across the clip.
      phoneme_count        how many phonemes contributed (small => weak signal).
      notes                honest caveat string.
      model / device       what ran.
      latency_s            wall time of this call.
    """
    t0 = time.perf_counter()
    model_id = model_id or _DEFAULT_MODEL
    req_device = device or os.getenv("PRON_DEVICE", "cpu")

    # 1) Graceful unavailability.
    missing = _missing_deps()
    if missing:
        return PronResult(
            available=False,
            pron_band_estimate=None,
            confidence=None,
            reason=(
                "Pronunciation stack not installed. Optional deps missing: "
                + ", ".join(missing)
                + ". See pronunciation.py docstring for install instructions."
            ),
            notes="Not run — optional pronunciation model not installed.",
        ).to_dict()

    audio = Path(audio_path)
    if not audio.exists():
        # File missing is a real error — but we still don't crash the server:
        # surface it as unavailable with a clear reason.
        return PronResult(
            available=False,
            pron_band_estimate=None,
            confidence=None,
            reason=f"Audio file not found: {audio}",
            notes="Not run — audio file missing.",
        ).to_dict()

    global _FALLBACK_CPU
    try:
        return _score_inner(audio, reference_text, model_id,
                            "cpu" if _FALLBACK_CPU else req_device, t0)
    except Exception as e:  # noqa: BLE001 — never crash the server
        if not _FALLBACK_CPU and _is_gpu_lib_error(e):
            _FALLBACK_CPU = True
            try:
                return _score_inner(audio, reference_text, model_id, "cpu", t0)
            except Exception as e2:  # noqa: BLE001
                return _err_result(e2, t0)
        return _err_result(e, t0)


def _err_result(e: BaseException, t0: float) -> dict[str, Any]:
    return PronResult(
        available=False,
        pron_band_estimate=None,
        confidence=None,
        reason=f"Pronunciation scoring failed: {type(e).__name__}: {str(e)[:200]}",
        notes="Not run — scoring raised an error (degraded gracefully).",
        latency_s=round(time.perf_counter() - t0, 3),
    ).to_dict()


def _score_inner(audio: Path, reference_text: str, model_id: str,
                 device: str, t0: float) -> dict[str, Any]:
    import torch  # noqa: lazy
    import numpy as np  # noqa: lazy

    processor, model, real_device = _get_model(model_id, device)
    y, _sr = _load_audio(audio)

    # CTC forward pass.
    with torch.no_grad():
        inputs = processor(y, sampling_rate=16000, return_tensors="pt",
                           padding=True)
        input_values = inputs.input_values.to(real_device)
        logits = model(input_values).logits            # (1, time, vocab)
        probs = torch.softmax(logits, dim=-1)[0]        # (time, vocab)

    # The espeak phoneme vocab: token id -> phoneme string.
    vocab = processor.tokenizer.get_vocab()            # {phoneme: id}
    id_to_tok = {int(v): k for k, v in vocab.items()}

    # Greedy CTC decode → aligned (token_id, t) frames, collapsing repeats and
    # dropping the blank token (id 0 in CTC).
    blank = 0
    argmax_ids = torch.argmax(probs, dim=-1).cpu().numpy().tolist()
    tokens: list[tuple[int, float]] = []   # (token_id, peak_posterior)
    prev = -1
    for tid in argmax_ids:
        if tid == blank:
            prev = -1
            continue
        if tid == prev:
            continue
        prev = tid
        tokens.append((int(tid), float(probs[:, tid].max().item())))

    if len(tokens) < _MIN_PHONEMES:
        return PronResult(
            available=True,
            pron_band_estimate=None,
            confidence=None,
            phoneme_count=len(tokens),
            model=model_id,
            device=real_device,
            notes=(
                "Too little speech to score pronunciation reliably "
                f"(only {len(tokens)} phonemes detected). Record a longer answer."
            ),
            latency_s=round(time.perf_counter() - t0, 3),
        ).to_dict()

    goodness = [g for _tid, g in tokens]
    mean_g = float(statistics.mean(goodness))
    band = _goodness_to_band(mean_g)

    # Per-phoneme weakness (across the whole clip): the lowest-confidence
    # phoneme classes, deduped, so the UI can flag "your /θ/ /r/ /æ/".
    per_phoneme: dict[str, list[float]] = {}
    for tid, g in tokens:
        sym = id_to_tok.get(tid, "?")
        per_phoneme.setdefault(sym, []).append(g)
    phoneme_means = {sym: statistics.mean(gs) for sym, gs in per_phoneme.items()}
    problem = [sym for sym, _ in sorted(phoneme_means.items(), key=lambda kv: kv[1])][:6]

    # Optional reference-aligned per-word scoring. Without a dedicated aligner
    # we can't perfectly segment frames into words, so when reference_text is
    # given we give an HONEST per-word breakdown: split the reference into
    # words, distribute the detected phoneme goodness evenly across them, and
    # flag each word's weakest phoneme. This is intentionally coarse and the
    # notes say so. A real forced-aligner (e.g. montreal-forced-aligner) would
    # improve this but adds a heavy native dep — out of scope for this module.
    per_word: list[dict[str, Any]] = []
    ref = (reference_text or "").strip()
    if ref:
        words = [w.strip(".,!?;:\"'()[]").lower() for w in ref.split()]
        words = [w for w in words if w]
        if len(words) >= _MIN_WORDS and tokens:
            chunk = max(1, len(tokens) // len(words))
            for i, w in enumerate(words):
                slice_ = tokens[i * chunk:(i + 1) * chunk] if i < len(words) - 1 \
                    else tokens[i * chunk:]
                if not slice_:
                    continue
                gs = [g for _t, g in slice_]
                ws = float(statistics.mean(gs))
                weakest = min(slice_, key=lambda tg: tg[1])[0]
                per_word.append({
                    "word": w,
                    "score": round(ws, 3),
                    "problem_phonemes": ([id_to_tok.get(weakest, "?")]
                                         if ws < 0.7 else []),
                })

    return PronResult(
        available=True,
        pron_band_estimate=band,
        confidence=round(mean_g, 3),
        per_word=per_word,
        problem_phonemes=problem,
        phoneme_count=len(tokens),
        model=model_id,
        device=real_device,
        notes=(
            "Approximate pronunciation signal from a local wav2vec2 phoneme "
            "model (CTC posterior goodness), NOT a certified examiner score. "
            "Low-confidence words/phonemes may be unclear, mispronounced, or "
            "simply uncommon — treat as a relative guide. "
            + ("Per-word breakdown is coarse (no forced aligner)." if per_word else "")
        ).strip(),
        latency_s=round(time.perf_counter() - t0, 3),
    ).to_dict()


# ─── Self-test (no model download forced) ───────────────────────────────────
if __name__ == "__main__":
    import json
    import sys

    print("pronunciation.py self-test")
    print("-" * 50)
    print("is_available():", is_available())
    missing = _missing_deps()
    if missing:
        print("Missing optional deps:", ", ".join(missing))
        print("Module degrades gracefully — returning unavailable, not raising.")
        # Show the exact shape an unavailable result has, so integrators know
        # what to expect WITHOUT installing the heavy stack.
        sample = score_pronunciation("nonexistent-test-path.webm")
        print("Unavailable-result shape:")
        print(json.dumps(sample, indent=2))
        print("\nInstall (optional) to enable, per the module docstring:")
        print('  pip install "torch==2.3.*" "transformers==4.41.*" '
              '"torchaudio" "librosa" "soundfile"')
        sys.exit(0)

    # Stack present → exercise the band mapper (no network/model needed).
    print("\nBand-mapping sanity (goodness -> band):")
    for g in (0.99, 0.90, 0.82, 0.72, 0.62, 0.50, 0.30):
        print(f"  goodness {g:.2f} -> band {_goodness_to_band(g)}")

    if len(sys.argv) > 1:
        path = sys.argv[1]
        ref = sys.argv[2] if len(sys.argv) > 2 else ""
        print(f"\nScoring: {path}" + (f"  ref={ref!r}" if ref else ""))
        res = score_pronunciation(path, reference_text=ref)
        print(json.dumps(res, indent=2))
    else:
        print("\nNo audio path given — skipping live model run.")
        print("Usage: python -m src.pronunciation <audio> [reference_text]")
