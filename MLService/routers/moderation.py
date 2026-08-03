"""
routers/moderation.py — Feature 2: Message Toxicity / Content Moderation
POST /ml/moderate-text

Uses Detoxify (pre-trained BERT) or VADER + keyword heuristic fallback.
Returns is_toxic bool + per-label scores.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict
# pyrefly: ignore [missing-import]
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

router = APIRouter()
_vader = SentimentIntensityAnalyzer()

TOXICITY_THRESHOLD = 0.75

_model = None
_has_detoxify = False

try:
    # pyrefly: ignore [missing-import]
    from detoxify import Detoxify
    _has_detoxify = True
except ImportError:
    _has_detoxify = False

TOXIC_KEYWORDS = {
    "hate", "kill", "die", "stupid", "idiot", "dumb", "ugly", "bitch",
    "bastard", "abuse", "threat", "loser", "trash", "shut up", "fuck", "shit"
}


def get_model():
    global _model
    if _has_detoxify and _model is None:
        try:
            print("[Moderation] Loading Detoxify model...")
            _model = Detoxify("original")
            print("[Moderation] Detoxify model loaded.")
        except Exception as e:
            print(f"[Moderation] Could not load Detoxify: {e}")
            _model = None
    return _model


class ModerationRequest(BaseModel):
    text: str
    userId: Optional[str] = None
    receiverId: Optional[str] = None


class ModerationResponse(BaseModel):
    is_toxic: bool
    max_score: float
    max_label: str
    scores: Dict[str, float]


def _fallback_moderate(text: str) -> ModerationResponse:
    """Keyword & VADER based toxicity fallback when Detoxify is unavailable."""
    lower = text.lower()
    found_toxic = [w for w in TOXIC_KEYWORDS if w in lower]
    vs = _vader.polarity_scores(text)

    # Calculate heuristic score
    neg = vs["neg"]
    keyword_boost = 0.4 if found_toxic else 0.0
    score = min(1.0, neg + keyword_boost)

    is_toxic = score >= 0.70 or (len(found_toxic) > 0 and neg > 0.3)

    scores = {
        "toxic": round(score, 4),
        "severe_toxic": round(score * 0.8 if is_toxic else 0.01, 4),
        "obscene": round(0.9 if any(w in lower for w in ["fuck", "bitch", "shit"]) else 0.02, 4),
        "threat": round(0.9 if any(w in lower for w in ["kill", "die", "threat"]) else 0.01, 4),
        "insult": round(0.8 if any(w in lower for w in ["stupid", "idiot", "loser", "dumb"]) else 0.02, 4),
        "identity_hate": round(0.01, 4),
    }

    max_label = max(scores, key=lambda k: scores[k])
    max_score = scores[max_label]

    return ModerationResponse(
        is_toxic=is_toxic,
        max_score=max_score,
        max_label=max_label,
        scores=scores,
    )


@router.post("/moderate-text", response_model=ModerationResponse)
def moderate_text(data: ModerationRequest):
    """
    Analyze text for toxicity.
    """
    text = data.text.strip()
    if not text:
        return ModerationResponse(
            is_toxic=False, max_score=0.0,
            max_label="none", scores={},
        )

    model = get_model()
    if model is not None:
        try:
            raw_scores: dict = model.predict(text)
            scores = {k: round(float(v), 4) for k, v in raw_scores.items()}
            max_label = max(scores, key=lambda k: scores[k])
            max_score = scores[max_label]
            is_toxic = max_score >= TOXICITY_THRESHOLD
            return ModerationResponse(
                is_toxic=is_toxic,
                max_score=max_score,
                max_label=max_label,
                scores=scores,
            )
        except Exception as e:
            print(f"[Moderation] Detoxify prediction error: {e}")

    return _fallback_moderate(text)
