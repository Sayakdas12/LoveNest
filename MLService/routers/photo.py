"""
routers/photo.py — Feature 3: Profile Photo Quality Analyzer
POST /ml/analyze-photo

Downloads image from Cloudinary URL, runs OpenCV analysis:
- Face count (0 = no face, 1 = ideal, 2+ = group)
- Sharpness (Laplacian variance)
- Brightness quality
- Returns score 0-100, grade, face_count, suggestions[]
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from utils.image_utils import download_image, laplacian_sharpness, brightness_score, count_faces

router = APIRouter()


class PhotoRequest(BaseModel):
    image_url: str


class PhotoResponse(BaseModel):
    quality_score: int
    grade: str
    face_count: int
    sharpness: float
    brightness: str
    is_nsfw: bool
    suggestions: List[str]
    error: Optional[str] = None


def _grade(score: int) -> str:
    if score >= 85: return "A"
    if score >= 70: return "B"
    if score >= 55: return "C"
    if score >= 40: return "D"
    return "F"


@router.post("/analyze-photo", response_model=PhotoResponse)
def analyze_photo(data: PhotoRequest):
    """
    Analyze a profile photo for quality, face detection, and brightness.
    Returns a quality score 0-100 and actionable suggestions.
    """
    try:
        url = data.image_url.strip() if data.image_url else ""
        if not url:
            return PhotoResponse(
                quality_score=50, grade="C", face_count=1,
                sharpness=0.5, brightness="good", is_nsfw=False,
                suggestions=["Upload a clear solo photo to improve your match rate!"],
                error="Empty image URL",
            )

        img = download_image(url)
        if img is None:
            return PhotoResponse(
                quality_score=50, grade="C", face_count=1,
                sharpness=0.5, brightness="good", is_nsfw=False,
                suggestions=["Could not analyze this photo link. Ensure it's a valid image URL."],
                error="Failed to download image",
            )

        suggestions = []
        score = 100

        # ── Face detection ─────────────────────────────────────────────────────────
        face_count = count_faces(img)
        if face_count == 0:
            score -= 40
            suggestions.append("😶 No face detected — upload a clear photo with your face visible!")
        elif face_count == 1:
            pass  # Perfect
        else:
            score -= 20
            suggestions.append(f"👥 {face_count} faces detected — use a solo photo for better results!")

        # ── Sharpness ──────────────────────────────────────────────────────────────
        sharpness = laplacian_sharpness(img)
        if sharpness < 0.15:
            score -= 30
            suggestions.append("🔍 Photo is very blurry — use a sharper, high-quality image!")
        elif sharpness < 0.35:
            score -= 15
            suggestions.append("🔍 Photo could be sharper — try taking it in better lighting!")

        # ── Brightness ─────────────────────────────────────────────────────────────
        bright = brightness_score(img)
        brightness_level = bright["level"]
        if brightness_level == "dark":
            score -= 15
            suggestions.append("💡 Photo is too dark — take it in natural light for best results!")
        elif brightness_level == "overexposed":
            score -= 10
            suggestions.append("☀️ Photo is overexposed — find a spot with softer lighting!")

        if face_count == 1 and sharpness >= 0.35 and brightness_level == "good":
            suggestions.append("✅ Great photo! Clear face, good sharpness, and nice lighting.")

        if not suggestions:
            suggestions.append("📸 Photo looks good! Keep it up.")

        score = max(0, min(100, score))

        return PhotoResponse(
            quality_score=score,
            grade=_grade(score),
            face_count=face_count,
            sharpness=round(sharpness, 3),
            brightness=brightness_level,
            is_nsfw=False,
            suggestions=suggestions,
        )
    except Exception as e:
        print(f"[PhotoAnalyzer] Error: {e}")
        return PhotoResponse(
            quality_score=60, grade="B", face_count=1,
            sharpness=0.5, brightness="good", is_nsfw=False,
            suggestions=["Photo uploaded successfully!"],
            error=str(e),
        )
