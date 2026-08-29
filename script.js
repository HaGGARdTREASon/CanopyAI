const DEFAULT_API_URL = "http://localhost:8000/v1/chat/completions";
const DEFAULT_MODEL = "qwen2.5:0.5b";

const endpointInput = document.getElementById('api-url');
const modelInput = document.getElementById('model-name');
const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate-btn');
const btnText = document.getElementById('btn-text');
const btnIcon = document.getElementById('btn-icon');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status-dot');
const outputDiv = document.getElementById('output');
const thinkingContainer = document.getElementById('thinking-container');
const thinkingDiv = document.getElementById('thinking');

if (endpointInput) endpointInput.value = DEFAULT_API_URL;
if (modelInput) modelInput.value = DEFAULT_MODEL;

/**
 * Live Typewriter Text Generation Engine
 */
async function typeText(targetElement, fullText, speedMs = 10) {
    targetElement.innerHTML = "";

    const cursor = document.createElement("span");
    cursor.className = "typing-cursor";
    targetElement.appendChild(cursor);

    for (let i = 0; i < fullText.length; i++) {
        cursor.insertAdjacentText("beforebegin", fullText[i]);
        targetElement.scrollTop = targetElement.scrollHeight;

        const char = fullText[i];
        let delay = speedMs;
        if (char === '.' || char === '?' || char === '!') delay = speedMs * 4;
        else if (char === ',' || char === '\n') delay = speedMs * 2.5;

        await new Promise(resolve => setTimeout(resolve, delay));
    }

    await new Promise(resolve => setTimeout(resolve, 600));
    cursor.remove();
}

generateBtn.addEventListener('click', async () => {
    const promptText = promptInput.value.trim();
    const apiUrl = endpointInput.value.trim() || DEFAULT_API_URL;
    const modelName = modelInput.value.trim() || DEFAULT_MODEL;

    if (!promptText) {
        alert("Please enter a prompt instruction.");
        return;
    }

    // Lock UI state
    generateBtn.disabled = true;
    btnText.innerText = "Generating...";
    btnIcon.classList.add("spin-icon");

    statusText.innerText = "Connecting...";
    statusDot.className = "status-dot active";

    outputDiv.innerHTML = `<span class="placeholder-text">Awaiting response from local gateway...</span>`;
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

        // Safe response reading for non-JSON error pages (e.g. 502 Bad Gateway)
        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.slice(0, 150)}`);
        }

        if (!response.ok) {
            throw new Error(data.detail || data.error?.message || `HTTP ${response.status} Error`);
        }

        const messageObj = data.choices?.[0]?.message || {};
        let rawContent = messageObj.content || "";
        let thinkingText = messageObj.reasoning_content || "";

        // Fallback for tags like <think> reasoning
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

        // Trigger Live Generation Typewriter Animation
        statusText.innerText = "Streaming Output...";
        await typeText(outputDiv, rawContent, 12);

        statusText.innerText = "Completed";
        statusDot.className = "status-dot completed";

    } catch (error) {
        statusText.innerText = "Error";
        statusDot.className = "status-dot error";
        outputDiv.innerHTML = `<div class="error-box"><strong>Error:</strong> ${error.message}</div>`;
        console.error("API Error:", error);
    } finally {
        generateBtn.disabled = false;
        btnText.innerText = "Generate Response";
        btnIcon.classList.remove("spin-icon");
    }
});