# Use official lightweight Python 3.10 slim base image
FROM python:3.10-slim

# Prevent Python from writing .pyc files and enable unbuffered stdout/stderr for live logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=5001
ENV FLAGS_enable_pir_api=0
ENV FLAGS_enable_pir_in_executor=0
ENV FLAGS_use_onednn=0
ENV FLAGS_use_mkldnn=0

# Install system C/C++ graphics dependencies required by OpenCV & PaddlePaddle runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set container working directory
WORKDIR /app

# Copy requirements file first to leverage Docker layer caching
COPY requirements.txt .

# Upgrade pip and install all Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --prefer-binary -r requirements.txt

# Copy Python OCR server source files
COPY analyzer.py ocr_server.py .

# Expose OCR server port
EXPOSE 5001

# Healthcheck to monitor OCR container status
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

# Start the Flask OCR service
CMD ["python", "ocr_server.py"]
