"""
routers/profile.py — Feature 6: Smart Profile Completion Advisor
POST /ml/profile-score

Analyzes user profile completeness + About text quality using VADER.
Returns a 0-100 score, grade, breakdown, and actionable tips.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

router = APIRouter()
_analyzer = SentimentIntensityAnalyzer()

DEFAULT_PHOTO = "https://bbdu.ac.in/wp-content/uploads/2021/11/dummy-image1.jpg"


class ProfileInput(BaseModel):
    photoUrl: Optional[str] = None
    About: Optional[str] = ""
    age: Optional[int] = None
    gender: Optional[str] = None
    Skills: Optional[List[str]] = []
    isPremium: Optional[bool] = False


class BreakdownItem(BaseModel):
    score: int
    max: int
    note: str = ""


class ProfileScoreResponse(BaseModel):
    score: int
    grade: str
    breakdown: dict
    tips: List[str]


def _grade(score: int) -> str:
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 70: return "B"
    if score >= 60: return "C"
    if score >= 50: return "D"
    return "F"


@router.post("/profile-score", response_model=ProfileScoreResponse)
def profile_score(data: ProfileInput):
    """
    Score a user's profile completeness and About text quality.
    Returns score 0-100, grade, per-field breakdown, and improvement tips.
    """
    tips = []
    breakdown = {}
    total = 0

    # ── 1. Photo (max 20 pts) ─────────────────────────────────────────────────
    has_real_photo = bool(
        data.photoUrl
        and data.photoUrl.strip()
        and DEFAULT_PHOTO not in data.photoUrl
        and "ui-avatars.com" not in data.photoUrl
    )
    photo_score = 20 if has_real_photo else 0
    breakdown["photo"] = {"score": photo_score, "max": 20,
                          "note": "Photo uploaded ✅" if has_real_photo else "No profile photo"}
    if not has_real_photo:
        tips.append("📸 Upload a clear, solo photo — profiles with photos get 3× more matches!")
    total += photo_score

    # ── 2. About / Bio (max 20 pts) ───────────────────────────────────────────
    about_text = (data.About or "").strip()
    about_len = len(about_text)
    if about_len >= 80:
        about_score = 20
        about_note = "Great bio length ✅"
    elif about_len >= 50:
        about_score = 14
        about_note = "Bio is decent but could be longer"
        tips.append("✍️ Expand your bio to 80+ characters — share what makes you unique!")
    elif about_len >= 20:
        about_score = 8
        about_note = "Bio is too short"
        tips.append("✍️ Your bio is very short — add a few sentences about your passions!")
    else:
        about_score = 0
        about_note = "No bio written"
        tips.append("✍️ Write a bio! Even 2–3 sentences greatly increases your match rate.")
    breakdown["about"] = {"score": about_score, "max": 20, "note": about_note}
    total += about_score

    # ── 3. Bio Sentiment / Warmth (max 10 pts) ────────────────────────────────
    sentiment_score_raw = 0
    sentiment_note = "No bio to analyze"
    if about_len >= 20:
        vs = _analyzer.polarity_scores(about_text)
        compound = vs["compound"]  # -1 to +1
        if compound >= 0.4:
            sentiment_score_raw = 10
            sentiment_note = "Bio has a warm, positive tone ✅"
        elif compound >= 0.1:
            sentiment_score_raw = 7
            sentiment_note = "Bio tone is neutral-positive"
            tips.append("💬 Your bio could feel warmer — try adding what excites you about life!")
        elif compound >= -0.1:
            sentiment_score_raw = 4
            sentiment_note = "Bio has a neutral tone"
            tips.append("💬 Add some enthusiasm to your bio — positivity is attractive!")
        else:
            sentiment_score_raw = 0
            sentiment_note = "Bio has a negative tone"
            tips.append("💬 Your bio sounds a bit negative — try reframing it positively!")
    breakdown["bio_warmth"] = {"score": sentiment_score_raw, "max": 10, "note": sentiment_note}
    total += sentiment_score_raw

    # ── 4. Age (max 15 pts) ───────────────────────────────────────────────────
    age_score = 15 if data.age and data.age >= 18 else 0
    breakdown["age"] = {"score": age_score, "max": 15,
                        "note": "Age set ✅" if age_score else "Age not set"}
    if not age_score:
        tips.append("🎂 Set your age — it helps you appear in age-filtered searches!")
    total += age_score

    # ── 5. Skills (max 15 pts) ────────────────────────────────────────────────
    skill_count = len(data.Skills or [])
    if skill_count >= 5:
        skills_score = 15
        skills_note = f"{skill_count} skills listed ✅"
    elif skill_count >= 3:
        skills_score = 10
        skills_note = f"Only {skill_count} skills — add more!"
        tips.append(f"🎯 Add {5 - skill_count} more skills to appear in more searches!")
    elif skill_count >= 1:
        skills_score = 5
        skills_note = f"Only {skill_count} skill(s) — add more!"
        tips.append("🎯 Add at least 5 skills — it helps find people with shared interests!")
    else:
        skills_score = 0
        skills_note = "No skills listed"
        tips.append("🎯 Add your interests/skills — it's the easiest way to get more matches!")
    breakdown["skills"] = {"score": skills_score, "max": 15, "note": skills_note}
    total += skills_score

    # ── 6. Gender (max 10 pts) ────────────────────────────────────────────────
    gender_score = 10 if data.gender and data.gender.strip() else 0
    breakdown["gender"] = {"score": gender_score, "max": 10,
                           "note": "Gender set ✅" if gender_score else "Gender not set"}
    if not gender_score:
        tips.append("🏷️ Set your gender so potential matches can filter properly!")
    total += gender_score

    # ── 7. Premium (bonus 10 pts) ─────────────────────────────────────────────
    premium_score = 10 if data.isPremium else 0
    breakdown["premium"] = {"score": premium_score, "max": 10,
                            "note": "Premium member 💎" if premium_score else "Free account"}
    if not premium_score:
        tips.append("💎 Upgrade to Premium to boost your profile visibility and unlock exclusive features!")
    total += premium_score

    # If no tips, give a positive message
    if not tips:
        tips.append("🌟 Your profile is excellent! You're maximizing your match potential.")

    return ProfileScoreResponse(
        score=min(total, 100),
        grade=_grade(min(total, 100)),
        breakdown=breakdown,
        tips=tips,
    )
