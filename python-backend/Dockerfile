FROM python:3.10-alpine

WORKDIR /app

# Install system dependencies required for Pillow and ReportLab
RUN apk add --no-cache gcc musl-dev zlib-dev jpeg-dev freetype-dev

# Copy requirements and install them, adding gunicorn for production
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application source code
COPY . .

EXPOSE 8002

# Run the app using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8002", "main:app"]
