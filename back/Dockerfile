# Use an official Python runtime as the base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for spacy and transformers
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only the requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project structure
COPY . .

# Set Python path to include the project root
ENV PYTHONPATH=/app:$PYTHONPATH

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]