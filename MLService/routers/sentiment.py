"""
routers/sentiment.py — Feature 7: Chat Sentiment Analysis (Relationship Health)
POST /ml/chat-sentiment  [Premium feature]

Analyzes last 50 messages of a conversation using VADER.
Returns mood (positive/neutral/negative), trend, and per-party scores.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

router = APIRouter()
_analyzer = SentimentIntensityAnalyzer()

# Emoji sentiment boosts
POSITIVE_EMOJIS = {"❤️", "💕", "💗", "😊", "😄", "🥰", "😍", "💪", "✨", "🔥", "💯", "🌟"}
NEGATIVE_EMOJIS = {"😢", "😡", "💔", "😤", "😒", "🙄", "😑"}


class ChatMessage(BaseModel):
    text: str
    senderId: str  # "me" or "them"


class SentimentRequest(BaseModel):
    messages: List[ChatMessage]


class SentimentResponse(BaseModel):
    mood: str        # "positive" | "neutral" | "negative"
    trend: str       # "improving" | "stable" | "declining"
    score: float     # -1.0 to 1.0 (overall compound)
    my_score: float
    their_score: float
    emoji_boost: float
    message_count: int


def _classify_mood(score: float) -> str:
    if score >= 0.15:
        return "positive"
    if score <= -0.10:
        return "negative"
    return "neutral"


def _emoji_boost(text: str) -> float:
    boost = 0.0
    for ch in text:
        if ch in POSITIVE_EMOJIS:
            boost += 0.05
        elif ch in NEGATIVE_EMOJIS:
            boost -= 0.05
    return round(max(-0.3, min(0.3, boost)), 3)


@router.post("/chat-sentiment", response_model=SentimentResponse)
def chat_sentiment(data: SentimentRequest):
    """
    Analyze sentiment of a conversation.
    Returns overall mood, trend (recent vs earlier), and per-party scores.
    """
    messages = data.messages
    if not messages:
        return SentimentResponse(
            mood="neutral", trend="stable", score=0.0,
            my_score=0.0, their_score=0.0, emoji_boost=0.0,
            message_count=0,
        )

    my_scores = []
    their_scores = []
    all_scores = []
    total_emoji_boost = 0.0

    for msg in messages:
        text = msg.text.strip()
        if not text:
            continue
        vs = _analyzer.polarity_scores(text)
        compound = vs["compound"]
        boost = _emoji_boost(text)
        total_emoji_boost += boost
        adjusted = max(-1.0, min(1.0, compound + boost))

        all_scores.append(adjusted)
        if msg.senderId == "me":
            my_scores.append(adjusted)
        else:
            their_scores.append(adjusted)

    if not all_scores:
        return SentimentResponse(
            mood="neutral", trend="stable", score=0.0,
            my_score=0.0, their_score=0.0, emoji_boost=0.0,
            message_count=len(messages),
        )

    overall = sum(all_scores) / len(all_scores)
    my_avg = sum(my_scores) / len(my_scores) if my_scores else 0.0
    their_avg = sum(their_scores) / len(their_scores) if their_scores else 0.0

    # Trend: compare last 10 messages vs earlier
    if len(all_scores) >= 10:
        recent = sum(all_scores[-10:]) / 10
        earlier = sum(all_scores[:-10]) / max(len(all_scores) - 10, 1)
        diff = recent - earlier
        if diff > 0.1:
            trend = "improving"
        elif diff < -0.1:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "stable"

    return SentimentResponse(
        mood=_classify_mood(overall),
        trend=trend,
        score=round(overall, 3),
        my_score=round(my_avg, 3),
        their_score=round(their_avg, 3),
        emoji_boost=round(total_emoji_boost, 3),
        message_count=len(messages),
    )
