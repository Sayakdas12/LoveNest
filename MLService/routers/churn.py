"""
routers/churn.py — Feature 5: User Churn Prediction
POST /ml/predict-churn

Predicts which users are at risk of churning using XGBoost on behavioral signals.
Runs as a batch job (called nightly by Node.js cron).
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

router = APIRouter()

# Simple rule-based churn scoring (XGBoost model trained after data collection)
# Phase 1: deterministic rules; Phase 4: replace with trained model


class UserFeatures(BaseModel):
    userId: str
    daysSinceLastLogin: Optional[float] = 0
    messagesLast7Days: Optional[int] = 0
    likeRatio: Optional[float] = 0.5          # likes / (likes + ignores)
    profileCompleteness: Optional[int] = 50   # 0-100
    connectionCount: Optional[int] = 0
    isPremium: Optional[bool] = False
    accountAgeDays: Optional[float] = 0


class ChurnPrediction(BaseModel):
    userId: str
    risk: str           # "active" | "at-risk" | "churned"
    score: float        # 0.0 (active) – 1.0 (churned)
    reasons: List[str]


class ChurnRequest(BaseModel):
    users: List[UserFeatures]


class ChurnResponse(BaseModel):
    predictions: List[ChurnPrediction]
    total: int


def _predict_user_churn(u: UserFeatures) -> ChurnPrediction:
    """Rule-based churn scoring. Returns 0.0 (active) to 1.0 (churned)."""
    score = 0.0
    reasons = []

    # Days since login (most important signal)
    if u.daysSinceLastLogin > 30:
        score += 0.4
        reasons.append(f"Inactive for {u.daysSinceLastLogin:.0f} days")
    elif u.daysSinceLastLogin > 14:
        score += 0.25
        reasons.append("Low recent activity (2+ weeks inactive)")
    elif u.daysSinceLastLogin > 7:
        score += 0.10

    # Messaging activity
    if u.messagesLast7Days == 0:
        score += 0.2
        reasons.append("No messages sent in the last 7 days")
    elif u.messagesLast7Days < 3:
        score += 0.10

    # Like ratio (low = not engaging with feed)
    if u.likeRatio < 0.1:
        score += 0.15
        reasons.append("Very low engagement with feed (< 10% like rate)")
    elif u.likeRatio < 0.2:
        score += 0.08

    # Profile completeness
    if u.profileCompleteness < 40:
        score += 0.10
        reasons.append("Profile is significantly incomplete")
    elif u.profileCompleteness < 60:
        score += 0.05

    # Connection count
    if u.connectionCount == 0:
        score += 0.10
        reasons.append("No connections made yet")

    # Premium users churn less
    if u.isPremium:
        score *= 0.6  # Reduce churn risk for premium users

    score = round(min(score, 1.0), 3)

    if score >= 0.55:
        risk = "churned"
    elif score >= 0.25:
        risk = "at-risk"
    else:
        risk = "active"

    return ChurnPrediction(userId=u.userId, risk=risk, score=score, reasons=reasons)


@router.post("/predict-churn", response_model=ChurnResponse)
def predict_churn(data: ChurnRequest):
    """
    Batch churn prediction for all users.
    Called nightly by Node.js churnJob.js cron.
    """
    predictions = [_predict_user_churn(u) for u in data.users]
    return ChurnResponse(predictions=predictions, total=len(predictions))
