# ─────────────────────────────────────────────────────────────────────────────
#  LoveNest MLService — Dockerfile
#  Python 3.11 slim, CPU-only PyTorch (saves ~5GB vs GPU image)
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim
WORKDIR /app

# System libraries required by OpenCV, librosa, and sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Install CPU-only PyTorch first ────────────────────────────────────────────
# This avoids pulling CUDA packages (~5GB) — saves significant image size
COPY requirements.txt .
RUN pip install --no-cache-dir \
    torch \
    torchvision \
    torchaudio \
    --index-url https://download.pytorch.org/whl/cpu

# ── Install all remaining Python dependencies ─────────────────────────────────
# Exclude torch from requirements.txt since it's already installed above
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy application source ───────────────────────────────────────────────────
COPY main.py .
COPY routers/ ./routers/
COPY utils/ ./utils/

# Create non-root user
RUN addgroup --system --gid 1001 pygroup && \
    adduser  --system --uid 1001 pyuser --ingroup pygroup
USER pyuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=5 \
  CMD curl -sf http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "warning"]
