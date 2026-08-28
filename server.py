from fastapi import FastAPI, Header, HTTPException, Query, Request
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

MY_API_KEY = "sk-my-secret-key-12345"
OLLAMA_ENDPOINT = "http://127.0.0.1:11434/v1/chat/completions"

# 1. GET Endpoint (Accepts parameters directly in the URL query string)
@app.get("/v1/chat/completions")
async def chat_proxy_get(
    prompt: str = Query(..., description="User prompt text"),
    model: str = Query("qwen2.5:0.5b", description="Model name"),
    api_key: str = Query(None, description="API Key passed in URL query"),
    authorization: str = Header(None)
):
    # Validate API Key from query parameter or Authorization header
    incoming_key = api_key or (authorization.replace("Bearer ", "").strip() if authorization else "")
    if incoming_key != MY_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

    try:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}]
        }
        response = requests.post(OLLAMA_ENDPOINT, json=payload, timeout=300)
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy forwarding error: {str(e)}")

# 2. POST Endpoint (Accepts standard JSON requests)
@app.post("/v1/chat/completions")
async def chat_proxy_post(request: Request, authorization: str = Header(None)):
    incoming_key = authorization.replace("Bearer ", "").strip() if authorization else ""
    if incoming_key != MY_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

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