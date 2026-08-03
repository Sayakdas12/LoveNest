import os
import subprocess
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    match,
    moderation,
    photo,
    conversation,
    churn,
    profile,
    sentiment,
    fake_detection,
    voice_emotion,
    compatibility,
    smart_reply,
    call_debrief,
)


def print_fancy_banner():
    if sys.platform == "win32":
        subprocess.run("", shell=True)

    CYAN = "\033[96m"
    MAGENTA = "\033[95m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    WHITE = "\033[97m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

    banner = f"""
{MAGENTA}{BOLD}  ___               _  _ ___ ___ _____   __  __ _    ___   ___ _____   _____ ___ ___ {RESET}
{CYAN}{BOLD} | _ \\_  _ _ _  _  | \\| | __/ __|_   _| |  \\/  | |  / __| | __| _ \\ \\ / / __|_ _| __|{RESET}
{BLUE}{BOLD} |  _/ || | '_| || | .` | _\\__ \\ | |   | |\\/| | |__\\__ \\ | _||   /\\ V / (__ | || _| {RESET}
{MAGENTA}{BOLD} |_|  \\_,_|_|  \\_, |_|\\_|___|___/ |_|   |_|  |_|____|___/ |___|_|_\\ \\_/ \\___|___|___|{RESET}
{DIM}               |__/                                                                  {RESET}

 {WHITE}{BOLD}LoveNest Machine Learning Service v1.0.0{RESET}
 ─────────────────────────────────────────────────────────────────────────────
  {GREEN}➜{RESET}  {BOLD}Local Server:{RESET}      {CYAN}http://127.0.0.1:8000{RESET}
  {GREEN}➜{RESET}  {BOLD}Health Check:{RESET}      {CYAN}http://127.0.0.1:8000/health{RESET}
  {GREEN}➜{RESET}  {BOLD}Swagger API Docs:{RESET}  {CYAN}http://127.0.0.1:8000/docs{RESET}
  {GREEN}➜{RESET}  {BOLD}ReDoc Spec:{RESET}        {CYAN}http://127.0.0.1:8000/redoc{RESET}

 {BOLD}Registered Microservice Endpoints (12):{RESET}
  {GREEN}✔{RESET}  {BOLD}Match Scoring{RESET}          {DIM}[POST /ml/match-score]{RESET}
  {GREEN}✔{RESET}  {BOLD}Content Moderation{RESET}     {DIM}[POST /ml/moderate-text]{RESET}
  {GREEN}✔{RESET}  {BOLD}Photo Quality{RESET}          {DIM}[POST /ml/analyze-photo]{RESET}
  {GREEN}✔{RESET}  {BOLD}Conversation Starters{RESET}  {DIM}[POST /ml/conversation-starters]{RESET}
  {GREEN}✔{RESET}  {BOLD}Churn Prediction{RESET}       {DIM}[POST /ml/predict-churn]{RESET}
  {GREEN}✔{RESET}  {BOLD}Profile Advisor{RESET}        {DIM}[POST /ml/profile-score]{RESET}
  {GREEN}✔{RESET}  {BOLD}Chat Sentiment{RESET}         {DIM}[POST /ml/chat-sentiment]{RESET}
  {GREEN}✔{RESET}  {BOLD}Fake Detection{RESET}         {DIM}[POST /ml/detect-fake]{RESET}
  {GREEN}✔{RESET}  {BOLD}Voice Emotion{RESET}          {DIM}[POST /ml/voice-emotion]{RESET}
  {GREEN}✔{RESET}  {BOLD}Compatibility DNA{RESET}      {DIM}[POST /ml/compatibility-report]{RESET}
  {GREEN}✔{RESET}  {BOLD}Smart Reply{RESET}            {DIM}[POST /ml/smart-reply]{RESET}
  {GREEN}✔{RESET}  {BOLD}Call Debrief{RESET}           {DIM}[POST /ml/call-debrief]{RESET}
 ─────────────────────────────────────────────────────────────────────────────
 {YELLOW}{BOLD}⚡ READY TO PROCESS REQUESTS FROM NODE.JS BACKEND{RESET}
"""
    print(banner)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print_fancy_banner()
    yield


app = FastAPI(
    title="LoveNest ML Service",
    description="Internal Python ML microservice for LoveNest dating app",
    version="1.0.0",
    lifespan=lifespan,
)

# Only allow calls from Node.js backend (localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ── Register all feature routers ──────────────────────────────────────────────
app.include_router(match.router,          prefix="/ml", tags=["Match Scoring"])
app.include_router(moderation.router,     prefix="/ml", tags=["Content Moderation"])
app.include_router(photo.router,          prefix="/ml", tags=["Photo Quality"])
app.include_router(conversation.router,   prefix="/ml", tags=["Conversation Starters"])
app.include_router(churn.router,          prefix="/ml", tags=["Churn Prediction"])
app.include_router(profile.router,        prefix="/ml", tags=["Profile Advisor"])
app.include_router(sentiment.router,      prefix="/ml", tags=["Chat Sentiment"])
app.include_router(fake_detection.router, prefix="/ml", tags=["Fake Detection"])
app.include_router(voice_emotion.router,  prefix="/ml", tags=["Voice Emotion"])
app.include_router(compatibility.router,  prefix="/ml", tags=["Compatibility DNA"])
app.include_router(smart_reply.router,    prefix="/ml", tags=["Smart Reply"])
app.include_router(call_debrief.router,   prefix="/ml", tags=["Call Debrief"])


@app.get("/health", tags=["Health"])
def health_check():
    """Health check — Node.js calls this to verify ML service is up."""
    return {
        "status": "ok",
        "service": "LoveNest ML Service",
        "version": "1.0.0",
        "features": [
            "match-score", "moderate-text", "analyze-photo",
            "conversation-starters", "predict-churn", "profile-score",
            "chat-sentiment", "detect-fake", "voice-emotion",
            "compatibility-report", "smart-reply", "call-debrief",
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True, log_level="warning")


