// Configured with your live Ngrok public URL
const DEFAULT_API_URL = "https://unsedimental-kayleen-nonpatriotically.ngrok-free.dev/v1/chat/completions";
const DEFAULT_MODEL = "qwen2.5:0.5b";

const endpointInput = document.getElementById('api-url');
const modelInput = document.getElementById('model-name');
const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate-btn');
const statusDiv = document.getElementById('status');
const outputDiv = document.getElementById('output');
const thinkingContainer = document.getElementById('thinking-container');
const thinkingDiv = document.getElementById('thinking');

// Pre-fill input fields on page load
if (endpointInput) endpointInput.value = DEFAULT_API_URL;
if (modelInput) modelInput.value = DEFAULT_MODEL;

generateBtn.addEventListener('click', async () => {
    const promptText = promptInput.value.trim();
    const baseUrl = endpointInput.value.trim() || DEFAULT_API_URL;
    const modelName = modelInput.value.trim() || DEFAULT_MODEL;

    if (!promptText) return;

    generateBtn.disabled = true;
    statusDiv.innerText = "Sending request to Qwen gateway...";
    outputDiv.innerText = "";
    thinkingDiv.innerText = "";
    thinkingContainer.style.display = "none";

    try {
        // Construct GET URL with query parameters (no API key required)
        const params = new URLSearchParams({
            prompt: promptText,
            model: modelName
        });

        const fullUrl = `${baseUrl}?${params.toString()}`;

        const response = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "ngrok-skip-browser-warning": "true" // Bypasses ngrok warning page
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error?.message || errorData?.detail || `HTTP Error ${response.status}`);
        }

        const data = await response.json();
        const messageObj = data.choices?.[0]?.message || {};

        let rawContent = messageObj.content || "";
        let thinkingText = messageObj.reasoning_content || "";

        // Extract reasoning content wrapped in <think> or <thought> tags
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
        statusDiv.innerText = "Response received!";
    } catch (error) {
        statusDiv.innerText = `Error: ${error.message}`;
        console.error("API Request Failed:", error);
    } finally {
        generateBtn.disabled = false;
    }
});