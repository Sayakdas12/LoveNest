"""
utils/embeddings.py — Sentence-BERT / TF-IDF text embedding helper
Used for About text similarity in match scoring and compatibility reports
Handles optional sentence-transformers gracefully.
"""
import numpy as np

_model = None
_has_sentence_transformers = False

try:
    from sentence_transformers import SentenceTransformer
    _has_sentence_transformers = True
except ImportError:
    _has_sentence_transformers = False

MODEL_NAME = "all-MiniLM-L6-v2"


def get_model():
    """Return the embedding model (lazy-loaded singleton)."""
    global _model
    if _has_sentence_transformers and _model is None:
        try:
            print(f"[Embeddings] Loading {MODEL_NAME}...")
            _model = SentenceTransformer(MODEL_NAME)
            print("[Embeddings] SentenceTransformer loaded.")
        except Exception as e:
            print(f"[Embeddings] Could not load SentenceTransformer: {e}")
            _model = None
    return _model


def _fallback_embed(text: str) -> np.ndarray:
    """Fallback n-gram frequency embedding vector (256-dim) when sentence-transformers is unavailable."""
    vec = np.zeros(256, dtype=np.float32)
    words = text.lower().split()
    for w in words:
        h = hash(w) % 256
        vec[h] += 1.0
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec


def embed(text: str) -> np.ndarray:
    """Embed a single text string."""
    if not text or not text.strip():
        return np.zeros(384 if _has_sentence_transformers else 256, dtype=np.float32)
    model = get_model()
    if model is not None:
        try:
            return model.encode(text.strip(), convert_to_numpy=True)
        except Exception:
            pass
    return _fallback_embed(text)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two embedding vectors. Returns 0.0–1.0."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def text_similarity(text1: str, text2: str) -> float:
    """Convenience: cosine similarity between two raw strings."""
    return cosine_similarity(embed(text1), embed(text2))
