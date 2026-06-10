# server/main.py
from fastapi import FastAPI
app = FastAPI(title="RailTwin-X Lite")

@app.get("/health")
def health():
    return {"status": "ok"}
