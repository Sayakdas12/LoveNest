"""
routers/call_debrief.py — Feature 12: Post-Call Coaching & Debrief
POST /ml/call-debrief

Generates personalized coaching tip + encouragement after a call ends.
Uses Groq LLaMA with call context.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import json
from utils.groq_client import groq_chat

router = APIRouter()


class CallDebriefRequest(BaseModel):
    callDuration: int           # seconds
    callType: str               # "audio" | "video"
    callerProfile: Optional[dict] = {}
    receiverProfile: Optional[dict] = {}
    priorMessageCount: Optional[int] = 0
    callOutcome: Optional[str] = "completed"  # "completed" | "missed" | "rejected"


class CallDebriefResponse(BaseModel):
    coaching_tip: str
    encouragement: str
    next_step: str


@router.post("/call-debrief", response_model=CallDebriefResponse)
def call_debrief(data: CallDebriefRequest):
    """
    Generate personalized post-call coaching based on call duration and profiles.
    """
    duration_min = data.callDuration // 60
    duration_sec = data.callDuration % 60
    duration_str = f"{duration_min}m {duration_sec}s" if duration_min > 0 else f"{duration_sec}s"

    caller_name = (data.callerProfile or {}).get("firstName", "User")
    receiver_name = (data.receiverProfile or {}).get("firstName", "your match")
    call_type = data.callType
    prior_msgs = data.priorMessageCount

    system_prompt = """You are a warm, encouraging dating coach. After a call between two people who matched on a dating app, provide brief personalized coaching.

Return ONLY valid JSON with exactly these 3 keys:
{
  "coaching_tip": "One specific, actionable tip for next interaction (max 25 words)",
  "encouragement": "One sentence of genuine encouragement (max 20 words)", 
  "next_step": "One concrete next step to take (max 20 words)"
}"""

    context = f"""Call context:
- Caller: {caller_name}
- Match: {receiver_name}  
- Call type: {call_type}
- Duration: {duration_str}
- Messages before this call: {prior_msgs}
- Outcome: {data.callOutcome}

Generate coaching JSON:"""

    reply = groq_chat(
        messages=[{"role": "user", "content": context}],
        system_prompt=system_prompt,
        max_tokens=200,
    )

    # Parse JSON
    if reply:
        try:
            start = reply.find("{")
            end = reply.rfind("}") + 1
            if start != -1 and end > start:
                parsed = json.loads(reply[start:end])
                return CallDebriefResponse(
                    coaching_tip=parsed.get("coaching_tip", ""),
                    encouragement=parsed.get("encouragement", ""),
                    next_step=parsed.get("next_step", ""),
                )
        except Exception:
            pass

    # Fallback responses based on duration
    if data.callDuration < 60:
        return CallDebriefResponse(
            coaching_tip=f"Short calls can feel awkward at first — try asking {receiver_name} about their weekend plans next time! 😊",
            encouragement="Every first call takes courage — you did great taking that step! 💪",
            next_step=f"Send {receiver_name} a message to keep the momentum going! 📩",
        )
    elif data.callDuration < 300:
        return CallDebriefResponse(
            coaching_tip=f"Great {duration_str} call! Next time, share a personal story — it deepens the connection 💬",
            encouragement=f"A {duration_str} call shows real interest — you're doing amazing! ✨",
            next_step="Follow up with a message referencing something from your call! 🌟",
        )
    else:
        return CallDebriefResponse(
            coaching_tip="Such a long, great call! Now's the perfect time to plan your first meetup 📅",
            encouragement=f"A {duration_str} call — you two clearly have amazing chemistry! 🥰",
            next_step="Suggest a coffee date or video hangout — strike while the iron's hot! ☕",
        )
