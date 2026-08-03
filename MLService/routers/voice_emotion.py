"""
routers/voice_emotion.py — Feature 9: Voice Message Emotion Analysis
POST /ml/voice-emotion

Downloads audio from Cloudinary URL, extracts MFCC features with librosa,
classifies emotion using a simple rule-based approach.
Full SpeechBrain model in Phase 3+.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import tempfile
import os
import requests
import numpy as np

router = APIRouter()


class VoiceEmotionRequest(BaseModel):
    audio_url: str


class VoiceEmotionResponse(BaseModel):
    emotion: str             # "happy" | "sad" | "angry" | "neutral" | "anxious"
    confidence: float
    energy_level: str        # "low" | "medium" | "high"
    pitch_trend: str         # "rising" | "falling" | "stable"
    error: Optional[str] = None


def _download_audio(url: str) -> Optional[str]:
    """Download audio to a temp file. Returns path or None."""
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        suffix = ".mp3" if "mp3" in url else ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
            f.write(resp.content)
            return f.name
    except Exception as e:
        print(f"[VoiceEmotion] Download failed: {e}")
        return None


@router.post("/voice-emotion", response_model=VoiceEmotionResponse)
def voice_emotion(data: VoiceEmotionRequest):
    """
    Analyze emotional tone of a voice message using librosa audio features.
    Returns detected emotion and energy/pitch characteristics.
    """
    try:
        import librosa
    except ImportError:
        return VoiceEmotionResponse(
            emotion="neutral", confidence=0.5,
            energy_level="medium", pitch_trend="stable",
            error="librosa not installed",
        )

    audio_path = _download_audio(data.audio_url)
    if not audio_path:
        return VoiceEmotionResponse(
            emotion="neutral", confidence=0.5,
            energy_level="medium", pitch_trend="stable",
            error="Could not download audio",
        )

    try:
        y, sr = librosa.load(audio_path, sr=22050, duration=30)
        os.unlink(audio_path)  # Clean up temp file

        # ── Feature extraction ─────────────────────────────────────────────
        # RMS energy
        rms = float(np.mean(librosa.feature.rms(y=y)))
        # Zero crossing rate (higher = more tense/angry)
        zcr = float(np.mean(librosa.feature.zero_crossing_rate(y)))
        # Spectral centroid (brightness of sound)
        spec_centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
        # Pitch (F0)
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_vals = pitches[pitches > 0]
        mean_pitch = float(np.mean(pitch_vals)) if len(pitch_vals) > 0 else 0

        # Pitch trend (first half vs second half)
        half = len(y) // 2
        if half > 0:
            p1, _ = librosa.piptrack(y=y[:half], sr=sr)
            p2, _ = librosa.piptrack(y=y[half:], sr=sr)
            m1 = float(np.mean(p1[p1 > 0])) if len(p1[p1 > 0]) > 0 else 0
            m2 = float(np.mean(p2[p2 > 0])) if len(p2[p2 > 0]) > 0 else 0
            if m2 > m1 * 1.1:
                pitch_trend = "rising"
            elif m2 < m1 * 0.9:
                pitch_trend = "falling"
            else:
                pitch_trend = "stable"
        else:
            pitch_trend = "stable"

        # Energy level
        if rms > 0.1:
            energy_level = "high"
        elif rms > 0.04:
            energy_level = "medium"
        else:
            energy_level = "low"

        # ── Simple heuristic emotion classification ────────────────────────
        # High energy + high ZCR + rising pitch → happy/excited
        # High energy + high ZCR + falling pitch → angry
        # Low energy + falling pitch → sad
        # Very low ZCR + stable pitch → neutral
        # High ZCR + medium energy → anxious

        if rms > 0.08 and zcr > 0.15 and pitch_trend == "rising":
            emotion, confidence = "happy", 0.75
        elif rms > 0.08 and zcr > 0.18 and pitch_trend == "falling":
            emotion, confidence = "angry", 0.70
        elif rms < 0.04 and pitch_trend == "falling":
            emotion, confidence = "sad", 0.68
        elif zcr > 0.15 and energy_level == "medium":
            emotion, confidence = "anxious", 0.62
        else:
            emotion, confidence = "neutral", 0.80

        return VoiceEmotionResponse(
            emotion=emotion,
            confidence=round(confidence, 2),
            energy_level=energy_level,
            pitch_trend=pitch_trend,
        )

    except Exception as e:
        try:
            os.unlink(audio_path)
        except Exception:
            pass
        return VoiceEmotionResponse(
            emotion="neutral", confidence=0.5,
            energy_level="medium", pitch_trend="stable",
            error=str(e),
        )
