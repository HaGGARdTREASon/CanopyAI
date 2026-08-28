# Local Qwen 2.5 Web Interface & Public Ngrok Tunnel

A web client and FastAPI proxy server configured to run `qwen2.5:0.5b` locally via Ollama and exposed to the public internet via Ngrok.

## Live Public GET Endpoint
`https://unsedimental-kayleen-nonpatriotically.ngrok-free.dev/v1/chat/completions?prompt=Hello&api_key=sk-my-secret-key-12345`

## Running locally

1. **Start Ollama Engine**
   ```bash
   ollama run qwen2.5:0.5b