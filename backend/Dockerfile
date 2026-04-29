FROM python:3.12-slim

WORKDIR /app

# Build context is the project root (set by railway.json at repo root), so
# all COPY paths are relative to repo root. Only the backend/ tree is pulled
# into the image — frontend/, app/, etc. stay out.
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
