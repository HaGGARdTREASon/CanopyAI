const DEFAULT_API_URL = "http://localhost:8000/v1/chat/completions";
const DEFAULT_MODEL = "qwen2.5:0.5b";

const endpointInput = document.getElementById('api-url');
const modelInput = document.getElementById('model-name');
const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate-btn');
const statusText = document.getElementById('status-text');
const outputDiv = document.getElementById('output');
const thinkingContainer = document.getElementById('thinking-container');
const thinkingDiv = document.getElementById('thinking');

if (endpointInput) endpointInput.value = DEFAULT_API_URL;
if (modelInput) modelInput.value = DEFAULT_MODEL;

generateBtn.addEventListener('click', async () => {
    const promptText = promptInput.value.trim();
    const apiUrl = endpointInput.value.trim() || DEFAULT_API_URL;
    const modelName = modelInput.value.trim() || DEFAULT_MODEL;

    if (!promptText) return;

    generateBtn.disabled = true;
    statusText.innerText = "Processing...";
    outputDiv.innerText = "";
    thinkingDiv.innerText = "";
    thinkingContainer.style.display = "none";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({
                prompt: promptText,
                model: modelName
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error?.message || errorData?.detail || `HTTP Error ${response.status}`);
        }

        const data = await response.json();
        const messageObj = data.choices?.[0]?.message || {};

        let rawContent = messageObj.content || "";
        let thinkingText = messageObj.reasoning_content || "";

        if (!thinkingText) {
            const thinkMatch = rawContent.match(/<(think|thought)>([\s\S]*?)<\/\1>/i);
            if (thinkMatch) {
                thinkingText = thinkMatch[2].trim();
                rawContent = rawContent.replace(/<(think|thought)>([\s\S]*?)<\/\1>/i, '').trim();
            }
        }

        if (thinkingText) {
            thinkingDiv.innerText = thinkingText;
            thinkingContainer.style.display = "block";
        }

        outputDiv.innerText = rawContent;
        statusText.innerText = "Completed";
    } catch (error) {
        statusText.innerText = "Error";
        outputDiv.innerText = `Request Failed: ${error.message}`;
        console.error("API Request Failed:", error);
    } finally {
        generateBtn.disabled = false;
    }
});