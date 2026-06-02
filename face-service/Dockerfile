FROM python:3.9-slim

# Install system dependencies for OpenCV and other C++ packages
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependencies first for caching benefits
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

EXPOSE 5005

# Run the Flask app
CMD ["python", "app.py"]
