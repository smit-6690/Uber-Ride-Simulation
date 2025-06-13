# Use a lightweight Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire app code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run the app with Uvicorn
CMD ["uvicorn", "fare_api:app", "--host", "0.0.0.0", "--port", "8000"]
