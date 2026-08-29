from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import uvicorn

OLLAMA_ENDPOINT = "http://127.0.0.1:11434/v1/chat/completions"

app = FastAPI(title="Qwen 2.5 Local Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/v1/chat/completions")
async def chat_proxy_post(request: Request):
    try:
        body = await request.json()
        model = body.get("model") or "qwen2.5:0.5b"

        # Explicitly set stream=False to prevent JSONDecodeError from Ollama SSE streams
        if "prompt" in body and "messages" not in body:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": body["prompt"]}],
                "stream": False
            }
        else:
            payload = body
            payload["model"] = model
            payload["stream"] = False

        # Forward request to local Ollama instance
        response = requests.post(OLLAMA_ENDPOINT, json=payload, timeout=300)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"Ollama Error ({response.status_code}): {response.text}"
            )

        return response.json()

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503, 
            detail="Cannot connect to Ollama at http://127.0.0.1:11434. Ensure Ollama is running (`ollama serve`)."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gateway Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)