"""
routers/fake_detection.py — Feature 8: Fake/Bot Profile Detection
POST /ml/detect-fake

Multi-signal heuristic scoring to detect suspicious/fake profiles.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from utils.image_utils import download_image, count_faces

router = APIRouter()

DEFAULT_PHOTO = "https://bbdu.ac.in/wp-content/uploads/2021/11/dummy-image1.jpg"
GENERIC_BIOS = {"hi", "hello", "hey", "test", "none", "n/a", "na", ".", "-", "..."}


class FakeDetectionUser(BaseModel):
    _id: Optional[str] = None
    photoUrl: Optional[str] = None
    About: Optional[str] = ""
    age: Optional[int] = None
    createdAt: Optional[str] = None
    Skills: Optional[List[str]] = []


class FakeDetectionRequest(BaseModel):
    user: FakeDetectionUser
    requestCount: Optional[int] = 0       # how many requests sent
    messageCount: Optional[int] = 0       # total messages sent
    accountAgeHours: Optional[float] = 0  # hours since account creation


class FakeDetectionResponse(BaseModel):
    is_suspicious: bool
    confidence: float       # 0.0 – 1.0
    risk_level: str         # "low" | "medium" | "high"
    reasons: List[str]
    score: int              # 0 = clean, 100 = definitely fake


@router.post("/detect-fake", response_model=FakeDetectionResponse)
def detect_fake(data: FakeDetectionRequest):
    """
    Run heuristic fake profile detection.
    Returns confidence score and reasons.
    """
    user = data.user
    reasons = []
    penalty = 0

    # ── 1. Profile photo check ────────────────────────────────────────────────
    photo_url = user.photoUrl or ""
    has_default_photo = not photo_url or DEFAULT_PHOTO in photo_url or "ui-avatars.com" in photo_url
    if has_default_photo:
        penalty += 20
        reasons.append("No custom profile photo (using default avatar)")
    else:
        # Download and check face count
        try:
            img = download_image(photo_url)
            if img is not None:
                face_count = count_faces(img)
                if face_count == 0:
                    penalty += 35
                    reasons.append("No face detected in profile photo")
                elif face_count >= 3:
                    penalty += 10
                    reasons.append(f"Group photo detected ({face_count} faces)")
        except Exception:
            pass  # Skip if image download fails

    # ── 2. Bio / About check ──────────────────────────────────────────────────
    about = (user.About or "").strip()
    if len(about) < 5:
        penalty += 20
        reasons.append("Bio is empty or too short (< 5 characters)")
    elif about.lower() in GENERIC_BIOS:
        penalty += 20
        reasons.append("Generic one-word bio detected")
    elif len(about) < 15:
        penalty += 10
        reasons.append("Bio is very generic/short")

    # ── 3. Age check ──────────────────────────────────────────────────────────
    if not user.age:
        penalty += 5
        reasons.append("Age not set")

    # ── 4. Skills check ───────────────────────────────────────────────────────
    skill_count = len(user.Skills or [])
    if skill_count == 0:
        penalty += 5
        reasons.append("No skills/interests listed")

    # ── 5. Behavioral velocity check ─────────────────────────────────────────
    # New account sending many requests = suspicious
    if data.accountAgeHours < 24 and data.requestCount > 20:
        penalty += 30
        reasons.append(f"New account ({data.accountAgeHours:.1f}h old) sent {data.requestCount} requests — unusual velocity")

    if data.accountAgeHours < 1 and data.requestCount > 5:
        penalty += 20
        reasons.append("Very new account with suspicious request activity")

    # ── 6. Zero messaging ─────────────────────────────────────────────────────
    if data.messageCount == 0 and data.requestCount > 10:
        penalty += 10
        reasons.append("Sent many requests but zero messages — possible swipe bot")

    # Normalize score to 0-100
    raw_score = min(penalty, 100)
    confidence = round(raw_score / 100, 2)

    if confidence >= 0.75:
        risk_level = "high"
    elif confidence >= 0.40:
        risk_level = "medium"
    else:
        risk_level = "low"

    return FakeDetectionResponse(
        is_suspicious=confidence >= 0.50,
        confidence=confidence,
        risk_level=risk_level,
        reasons=reasons,
        score=raw_score,
    )
