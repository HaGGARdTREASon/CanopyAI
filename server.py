from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import uvicorn

app = FastAPI(title="Qwen 2.5 Proxy Gateway")

# Enable CORS for web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_ENDPOINT = "http://127.0.0.1:11434/v1/chat/completions"

# POST Endpoint (Retrieves prompt/model from JSON request body)
@app.post("/v1/chat/completions")
async def chat_proxy_post(request: Request):
    try:
        body = await request.json()

        # Extract parameters from the JSON body
        model = body.get("model", "qwen2.5:0.5b")
        
        # Accept either {"prompt": "..."} or standard OpenAI {"messages": [...]}
        if "prompt" in body and "messages" not in body:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": body["prompt"]}]
            }
        else:
            payload = body
            if "model" not in payload or not payload["model"]:
                payload["model"] = "qwen2.5:0.5b"

        # Forward request body to local Ollama instance
        response = requests.post(OLLAMA_ENDPOINT, json=payload, timeout=300)
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy forwarding error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)