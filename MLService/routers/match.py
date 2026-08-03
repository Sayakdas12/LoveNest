"""
routers/match.py — Feature 1: Smart Match Scoring (Compatibility Engine)
POST /ml/match-score

Ranks feed candidates by compatibility with the current user.
Uses: Jaccard (Skills), Gaussian age curve, Sentence-BERT (About text).
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Any
import numpy as np
import math
from utils.embeddings import embed, cosine_similarity

router = APIRouter()


class UserProfile(BaseModel):
    _id: Optional[str] = None
    firstName: Optional[str] = None
    Skills: Optional[List[str]] = []
    age: Optional[int] = None
    About: Optional[str] = ""


class MatchScoreRequest(BaseModel):
    user: UserProfile
    candidates: List[Any]  # Full user objects from MongoDB


class MatchScoreResponse(BaseModel):
    ranked: List[Any]  # Same objects, sorted by matchScore (added field)


def jaccard_similarity(set1: List[str], set2: List[str]) -> float:
    """Jaccard similarity between two skill lists."""
    s1 = {s.lower().strip() for s in (set1 or [])}
    s2 = {s.lower().strip() for s in (set2 or [])}
    if not s1 and not s2:
        return 0.0
    union = s1 | s2
    intersection = s1 & s2
    return len(intersection) / len(union)


def age_compatibility(age1: Optional[int], age2: Optional[int]) -> float:
    """
    Gaussian age compatibility curve.
    Score = 1.0 if same age, approaches 0.0 as difference exceeds 10 years.
    """
    if not age1 or not age2:
        return 0.5  # Neutral if age unknown
    diff = abs(age1 - age2)
    # Gaussian: sigma = 7 years → at 10 years diff, score ≈ 0.44
    return math.exp(-(diff ** 2) / (2 * (7 ** 2)))


def compute_match_score(user: UserProfile, candidate: dict) -> int:
    """Compute 0-100 compatibility score between user and a candidate profile."""
    weights = {
        "skills": 0.35,
        "age":    0.20,
        "about":  0.45,
    }

    # Skills similarity (Jaccard)
    candidate_skills = candidate.get("Skills", []) or []
    skills_sim = jaccard_similarity(user.Skills or [], candidate_skills)

    # Age compatibility (Gaussian)
    age_sim = age_compatibility(user.age, candidate.get("age"))

    # About text similarity (Sentence-BERT)
    user_about = (user.About or "").strip()
    cand_about = (candidate.get("About") or "").strip()

    if user_about and cand_about:
        vec_user = embed(user_about)
        vec_cand = embed(cand_about)
        about_sim = cosine_similarity(vec_user, vec_cand)
        # Normalize from [-1,1] to [0,1]
        about_sim = (about_sim + 1) / 2
    else:
        about_sim = 0.3  # Neutral if no bio

    raw = (
        weights["skills"] * skills_sim +
        weights["age"]    * age_sim +
        weights["about"]  * about_sim
    )
    return round(raw * 100)


@router.post("/match-score", response_model=MatchScoreResponse)
def match_score(data: MatchScoreRequest):
    """
    Score and rank a list of feed candidates by compatibility with the current user.
    Each candidate gets a 'matchScore' field added (0-100).
    """
    scored = []
    for candidate in data.candidates:
        # candidate is a dict from MongoDB
        if isinstance(candidate, dict):
            score = compute_match_score(data.user, candidate)
            enriched = {**candidate, "matchScore": score}
            scored.append(enriched)

    # Sort by matchScore descending
    scored.sort(key=lambda c: c.get("matchScore", 0), reverse=True)

    return MatchScoreResponse(ranked=scored)
