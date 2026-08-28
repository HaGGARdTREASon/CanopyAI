from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import uvicorn

app = FastAPI()

# Enable CORS so web clients (GitHub Pages, local HTML files, etc.) can communicate without browser blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define your secret API Key
MY_API_KEY = "sk-my-secret-key-12345"

@app.post("/v1/chat/completions")
async def chat_proxy(request: Request, authorization: str = Header(None)):
    # Validate Bearer API Key
    if authorization != f"Bearer {MY_API_KEY}":
        raise HTTPException(status_code=401, detail="Invalid API Key")

    try:
        body = await request.json()

        # Proxy request to local Ollama instance running on port 11434
        response = requests.post(
            "http://127.0.0.1:11434/v1/chat/completions",
            json=body,
            timeout=120
        )
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy forwarding error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)