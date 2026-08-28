from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import uvicorn

app = FastAPI(title="Qwen 2.5 Proxy Gateway")

# Enable CORS for web clients (local files, Render, GitHub Pages)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_ENDPOINT = "http://127.0.0.1:11434/v1/chat/completions"

# 1. GET Endpoint (Public access - API key removed)
@app.get("/v1/chat/completions")
async def chat_proxy_get(
    prompt: str = Query(..., description="User prompt text"),
    model: str = Query("qwen2.5:0.5b", description="Model name")
):
    try:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}]
        }
        response = requests.post(OLLAMA_ENDPOINT, json=payload, timeout=300)
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy forwarding error: {str(e)}")

# 2. POST Endpoint (Standard JSON requests)
@app.post("/v1/chat/completions")
async def chat_proxy_post(request: Request):
    try:
        body = await request.json()
        if "model" not in body or not body["model"]:
            body["model"] = "qwen2.5:0.5b"

        response = requests.post(OLLAMA_ENDPOINT, json=body, timeout=300)
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy forwarding error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)