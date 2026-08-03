"""
utils/groq_client.py — Groq LLaMA API wrapper
Reuses the same GROQ_API_KEY already configured in Node.js backend
"""
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_groq_client: Groq | None = None


def get_groq() -> Groq | None:
    """Return Groq client (singleton). Returns None if API key not set."""
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return None
        _groq_client = Groq(api_key=api_key)
    return _groq_client


def groq_chat(messages: list[dict], system_prompt: str = "", max_tokens: int = 512) -> str | None:
    """
    Send a chat completion request to Groq.
    Returns the assistant reply text, or None on failure.
    """
    client = get_groq()
    if not client:
        return None

    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    full_messages = []
    if system_prompt:
        full_messages.append({"role": "system", "content": system_prompt})
    full_messages.extend(messages)

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=full_messages,
            max_tokens=max_tokens,
            temperature=0.7,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"[Groq] Error: {e}")
        return None
