from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import uvicorn

app = FastAPI()

# Enable CORS for frontend clients (Render, GitHub Pages, local files)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MY_API_KEY = "sk-my-secret-key-12345"
OLLAMA_ENDPOINT = "http://127.0.0.1:11434/v1/chat/completions"

@app.post("/v1/chat/completions")
async def chat_proxy(request: Request, authorization: str = Header(None)):
    # Validate API Key
    incoming_key = authorization.replace("Bearer ", "").strip() if authorization else ""
    if incoming_key != MY_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

    try:
        body = await request.json()

        # Ensure model defaults to qwen2.5:0.5b if unspecified
        if "model" not in body or not body["model"]:
            body["model"] = "qwen2.5:0.5b"

        # Proxy request to local Ollama instance
        response = requests.post(
            OLLAMA_ENDPOINT,
            json=body,
            timeout=300
        )
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy forwarding error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)