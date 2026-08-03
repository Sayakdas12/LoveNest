"""
routers/smart_reply.py — Feature 11: Smart Reply Suggestions
POST /ml/smart-reply

Generates 3 context-aware reply suggestions using Groq LLaMA.
Analyzes last 3 messages and creates tone-matched responses.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import json
from utils.groq_client import groq_chat

router = APIRouter()


class ConversationMessage(BaseModel):
    role: str       # "me" or "them"
    text: str


class SmartReplyRequest(BaseModel):
    conversation: List[ConversationMessage]
    myProfile: Optional[dict] = {}


class SmartReplyResponse(BaseModel):
    replies: List[str]


@router.post("/smart-reply", response_model=SmartReplyResponse)
def smart_reply(data: SmartReplyRequest):
    """
    Generate 3 short, context-aware reply suggestions based on conversation history.
    Tone matches the existing conversation style.
    """
    if not data.conversation:
        return SmartReplyResponse(replies=[
            "That's really interesting! Tell me more 😊",
            "Haha, I love that! What do you think about...?",
            "Wow, I didn't know that! How did you get into it? ✨",
        ])

    # Build conversation context (last 5 messages max)
    recent = data.conversation[-5:]
    conv_text = "\n".join(
        f"{'Me' if m.role == 'me' else 'Them'}: {m.text}"
        for m in recent
    )

    # Get the last message (the one to reply to)
    last_msg = recent[-1].text if recent else ""

    my_name = data.myProfile.get("firstName", "Me") if data.myProfile else "Me"
    my_skills = data.myProfile.get("Skills", []) if data.myProfile else []
    my_context = f"My name is {my_name}."
    if my_skills:
        my_context += f" My interests include: {', '.join(my_skills[:5])}."

    system_prompt = """You are a dating app messaging coach. Generate exactly 3 short, natural reply suggestions for a dating app conversation.

Rules:
- Each reply must be 1 sentence max (under 20 words)
- Match the tone of the conversation (casual, playful, warm)
- Include emojis naturally
- Be genuine and engaging, not generic
- Each reply should take the conversation in a slightly different direction
- Return ONLY a valid JSON array of 3 strings, nothing else

Example: ["That's so cool! Have you tried...? 😄", "I totally get that! I love... too ✨", "Haha same! What made you start? 🌟"]"""

    user_message = f"""{my_context}

Recent conversation:
{conv_text}

The last message I need to reply to: "{last_msg}"

Generate 3 different short reply options. Return ONLY a JSON array."""

    reply = groq_chat(
        messages=[{"role": "user", "content": user_message}],
        system_prompt=system_prompt,
        max_tokens=200,
    )

    replies = []
    if reply:
        try:
            start = reply.find("[")
            end = reply.rfind("]") + 1
            if start != -1 and end > start:
                replies = json.loads(reply[start:end])
        except Exception:
            pass

    if not replies or len(replies) < 1:
        replies = [
            "That's so interesting! Tell me more 😊",
            "Haha love that! What made you start? ✨",
            "Wow, I can totally relate! 🌟",
        ]

    return SmartReplyResponse(replies=replies[:3])
