"""
routers/conversation.py — Feature 4: AI Conversation Starter Suggestions
POST /ml/conversation-starters

Generates 3 personalized icebreakers using Groq LLaMA based on both profiles.
"""
# pyrefly: ignore [missing-import]
from fastapi import APIRouter
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import Optional, List
import json
from utils.groq_client import groq_chat

router = APIRouter()


class UserProfile(BaseModel):
    firstName: Optional[str] = "Someone"
    About: Optional[str] = ""
    Skills: Optional[List[str]] = []
    age: Optional[int] = None
    gender: Optional[str] = None


class StarterRequest(BaseModel):
    myProfile: UserProfile
    theirProfile: UserProfile


class StarterResponse(BaseModel):
    starters: List[str]
    shared_interests: List[str]


def _find_shared(skills1: List[str], skills2: List[str]) -> List[str]:
    """Find common skills/interests (case-insensitive)."""
    s1 = {s.lower().strip() for s in (skills1 or [])}
    s2 = {s.lower().strip() for s in (skills2 or [])}
    return list(s1 & s2)


@router.post("/conversation-starters", response_model=StarterResponse)
def conversation_starters(data: StarterRequest):
    """
    Generate 3 personalized conversation starters based on both users' profiles.
    Uses Groq LLaMA with few-shot prompting.
    """
    me = data.myProfile
    them = data.theirProfile
    shared = _find_shared(me.Skills or [], them.Skills or [])

    starters = []
    try:
        my_info = f"Name: {me.firstName}, Age: {me.age or 'unknown'}, Interests: {', '.join(me.Skills or []) or 'none listed'}, Bio: {me.About or 'not set'}"
        their_info = f"Name: {them.firstName}, Age: {them.age or 'unknown'}, Interests: {', '.join(them.Skills or []) or 'none listed'}, Bio: {them.About or 'not set'}"
        shared_str = f"Shared interests: {', '.join(shared)}" if shared else "No obvious shared interests found — create something creative!"

        system_prompt = """You are a dating app conversation coach. Generate exactly 3 short, personalized, natural conversation starters for two people who just matched on a dating app.

Rules:
- Each starter must be 1-2 sentences max
- Be warm, genuine, and specific to their profiles
- Include relevant emojis
- Do NOT be cheesy or generic
- Do NOT start with "Hey" alone
- Reference specific interests, bio details, or ask a thoughtful question
- Return ONLY a valid JSON array of 3 strings, nothing else"""

        user_message = f"""Generate 3 conversation starters for this match:

MY PROFILE: {my_info}
THEIR PROFILE: {their_info}
{shared_str}

Return ONLY a JSON array of 3 strings."""

        reply = groq_chat(
            messages=[{"role": "user", "content": user_message}],
            system_prompt=system_prompt,
            max_tokens=256,
        )

        if reply:
            start = reply.find("[")
            end = reply.rfind("]") + 1
            if start != -1 and end > start:
                starters = json.loads(reply[start:end])
    except Exception as e:
        print(f"[ConversationStarters] Error: {e}")

    # Fallback starters if Groq fails or returns bad JSON
    if not starters or len(starters) < 1:
        them_name = them.firstName or "you"
        if shared:
            starters = [
                f"I saw we both love {shared[0]} — what got you into it? 😊",
                f"Fellow {shared[0]} enthusiast here! What's your favorite thing about it? ✨",
                f"We share a love for {shared[0]}! Would love to hear your story 🌟",
            ]
        else:
            starters = [
                f"Your profile caught my eye — I'd love to know more about you! 😊",
                f"What's been the highlight of your week so far? ✨",
                f"I love your taste in interests — what are you most passionate about? 🌟",
            ]

    return StarterResponse(
        starters=starters[:3],
        shared_interests=shared,
    )
