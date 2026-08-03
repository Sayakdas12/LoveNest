"""
utils/image_utils.py — OpenCV + PIL helpers for photo analysis
Used by photo.py and fake_detection.py
"""
import cv2
import cv2.data
import numpy as np
import requests
from PIL import Image
from io import BytesIO


def download_image(url: str) -> np.ndarray | None:
    """Download image from URL and return as OpenCV BGR array."""
    if not url or not url.strip() or not url.startswith("http"):
        return None
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        resp = requests.get(url.strip(), headers=headers, timeout=10)
        resp.raise_for_status()

        # Try OpenCV decoding first
        img_array = np.frombuffer(resp.content, np.uint8)
        if hasattr(cv2, "imdecode"):
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            if img is not None:
                return img

        # Fallback to PIL decoding (handles WebP, PNG, etc.)
        pil_img = Image.open(BytesIO(resp.content)).convert("RGB")
        img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        return img
    except Exception as e:
        print(f"[ImageUtils] Download failed for {url}: {e}")
        return None


def laplacian_sharpness(img: np.ndarray) -> float:
    """
    Compute sharpness using Laplacian variance.
    Higher = sharper. Below ~100 is considered blurry.
    Returns 0.0–1.0 normalized score.
    """
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        if hasattr(cv2, "Laplacian"):
            variance = cv2.Laplacian(gray, cv2.CV_64F).var()
            return min(float(variance) / 500.0, 1.0)
    except Exception:
        pass
    return 0.5


def brightness_score(img: np.ndarray) -> dict:
    """
    Analyze image brightness.
    Returns { "level": "dark"|"good"|"bright", "value": 0-255 }
    """
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        mean_brightness = float(np.mean(gray))
        if mean_brightness < 60:
            level = "dark"
        elif mean_brightness > 200:
            level = "overexposed"
        else:
            level = "good"
        return {"level": level, "value": round(mean_brightness, 1)}
    except Exception:
        return {"level": "good", "value": 128.0}


_face_cascade = None


def get_face_cascade():
    global _face_cascade
    if _face_cascade is None:
        try:
            cls = getattr(cv2, "CascadeClassifier", None)
            if cls is not None and hasattr(cv2, "data"):
                _face_cascade = cls(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        except Exception:
            _face_cascade = None
    return _face_cascade


def count_faces(img: np.ndarray) -> int:
    """
    Count faces in image using Haar cascade.
    Returns number of detected faces.
    """
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        cascade = get_face_cascade()
        if cascade is None or not hasattr(cascade, "detectMultiScale"):
            return 1
        faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))
        return len(faces) if isinstance(faces, np.ndarray) else 0
    except Exception:
        return 1
