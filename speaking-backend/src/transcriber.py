"""Local ASR via faster-whisper.

Stripped-down version of the original transcriber.py — Phase 1 only needs
local Whisper. Cloud providers (Groq, Deepgram, WhisperX) can be added later
without changing the call sites in main.py.
"""
from __future__ import annotations

import os
import re
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any

_MODEL_CACHE: dict[str, Any] = {}
# Once GPU/CUDA proves unusable (e.g. missing cublas/cudnn DLLs) we stick to CPU
# for the rest of the process instead of retrying the slow, failing GPU path.
_FALLBACK_CPU = False

_FILLERS = re.compile(r"\b(uh|um|er|erm|hmm|uhm)\b", re.IGNORECASE)
_MULTISPACE = re.compile(r"\s+")


def _is_gpu_lib_error(exc: Exception) -> bool:
    """True for the 'CUDA/cuBLAS/cuDNN library not found' class of errors raised by
    ctranslate2/faster-whisper when device=auto picks a GPU whose runtime libs are
    not installed — the case that makes every recording fail with a 500."""
    s = str(exc).lower()
    return any(k in s for k in (
        "cublas", "cudnn", "cudart", "cuda", "gpu", "libcublas", "no cuda",
    ))


@dataclass
class Transcript:
    raw_text: str
    cleaned_text: str
    asr_model: str
    language: str = "en"
    word_timestamps: list[dict[str, Any]] = field(default_factory=list)
    duration_sec: float | None = None
    latency_s: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def clean_text(raw: str, strip_fillers: bool = False) -> str:
    t = raw.strip()
    if strip_fillers:
        t = _FILLERS.sub("", t)
    t = _MULTISPACE.sub(" ", t).strip()
    if t and t[-1] not in ".!?":
        t += "."
    return t


def _get_model(model_name: str, device: str, compute: str):
    """Cache the WhisperModel — loading large weights every call is expensive."""
    cache_key = f"{model_name}|{device}|{compute}"
    if cache_key not in _MODEL_CACHE:
        from faster_whisper import WhisperModel
        _MODEL_CACHE[cache_key] = WhisperModel(model_name, device=device, compute_type=compute)
    return _MODEL_CACHE[cache_key]


def transcribe(
    audio_path: str | Path,
    *,
    model_name: str | None = None,
    device: str | None = None,
    compute: str | None = None,
    need_word_ts: bool = True,
) -> Transcript:
    audio = Path(audio_path)
    if not audio.exists():
        raise FileNotFoundError(audio)

    global _FALLBACK_CPU
    model_name = model_name or os.getenv("WHISPER_MODEL", "base.en")
    req_device = device or os.getenv("WHISPER_DEVICE", "auto")
    req_compute = compute or os.getenv("WHISPER_COMPUTE", "int8")

    def _run(dev: str, comp: str) -> Transcript:
        t0 = time.perf_counter()
        wm = _get_model(model_name, dev, comp)
        segments, info = wm.transcribe(
            str(audio),
            beam_size=5,
            language="en",
            word_timestamps=need_word_ts,
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 300},
        )
        parts: list[str] = []
        words: list[dict[str, Any]] = []
        # Iterate INSIDE the try — faster-whisper is lazy, so GPU/library errors
        # surface here (during decoding), not at model construction.
        for seg in segments:
            parts.append(seg.text)
            if need_word_ts and getattr(seg, "words", None):
                for w in seg.words:
                    words.append({
                        "w": (w.word or "").strip(),
                        "start": round(float(w.start or 0.0), 3),
                        "end": round(float(w.end or 0.0), 3),
                        # ASR confidence 0-1 — a low value flags a word that came through
                        # unclearly (possible mispronunciation). Approximate, not a pron score.
                        "p": round(float(getattr(w, "probability", 0.0) or 0.0), 3),
                    })
        raw = "".join(parts).strip()
        return Transcript(
            raw_text=raw,
            cleaned_text=clean_text(raw),
            asr_model=f"faster-whisper-{model_name}-{dev}",
            language=getattr(info, "language", "en"),
            word_timestamps=words,
            duration_sec=round(float(getattr(info, "duration", 0.0) or 0.0), 2),
            latency_s=round(time.perf_counter() - t0, 3),
        )

    device = "cpu" if _FALLBACK_CPU else req_device
    compute = "int8" if (_FALLBACK_CPU and req_compute not in ("int8", "float32", "int8_float32")) else req_compute
    try:
        return _run(device, compute)
    except (RuntimeError, OSError) as e:
        # GPU runtime libs missing (e.g. cublas64_12.dll) → fall back to CPU once,
        # then stay on CPU so recordings stop failing with a 500 / "Failed to fetch".
        if device != "cpu" and _is_gpu_lib_error(e):
            _FALLBACK_CPU = True
            return _run("cpu", "int8")
        raise
