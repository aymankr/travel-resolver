# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the project files into the container

COPY requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download fr_core_news_lg

COPY train_and_test.py /app

# Create necessary directories
RUN mkdir -p /app/models

# Set volume mount points
VOLUME ["/app/models"]

# Run the script when the container launches
CMD ["python", "train_and_test.py"]