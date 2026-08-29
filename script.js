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
 * Live Typewriter Animation Engine
 */
async function typeText(targetElement, fullText, speedMs = 12) {
    targetElement.innerHTML = "";
    
    // Create cursor element
    const cursor = document.createElement("span");
    cursor.className = "typing-cursor";
    targetElement.appendChild(cursor);

    for (let i = 0; i < fullText.length; i++) {
        // Insert character before blinking cursor
        cursor.insertAdjacentText("beforebegin", fullText[i]);
        
        // Auto-scroll target element down smoothly
        targetElement.scrollTop = targetElement.scrollHeight;
        
        // Slight variable delay for realistic typing feel
        const char = fullText[i];
        let delay = speedMs;
        if (char === '.' || char === '?' || char === '!') delay = speedMs * 4;
        else if (char === ',' || char === '\n') delay = speedMs * 2.5;

        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Keep cursor blinking briefly at the end then remove
    await new Promise(resolve => setTimeout(resolve, 800));
    cursor.remove();
}

generateBtn.addEventListener('click', async () => {
    const promptText = promptInput.value.trim();
    const apiUrl = endpointInput.value.trim() || DEFAULT_API_URL;
    const modelName = modelInput.value.trim() || DEFAULT_MODEL;

    if (!promptText) return;

    // Set UI to loading state
    generateBtn.disabled = true;
    btnText.innerText = "Generating...";
    btnIcon.classList.add("spin-icon");
    
    statusText.innerText = "Thinking...";
    statusDot.classList.add("active");
    
    outputDiv.innerHTML = `<span class="placeholder-text">Connecting to gateway...</span>`;
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

        // Fallback reasoning tag extractor
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

        // Trigger Live Generation Animation
        statusText.innerText = "Generating Live Response...";
        await typeText(outputDiv, rawContent, 10);

        statusText.innerText = "Completed";
    } catch (error) {
        statusText.innerText = "Error";
        outputDiv.innerHTML = `<span style="color: #ef4444; font-weight: 600;">Request Failed: ${error.message}</span>`;
        console.error("API Request Failed:", error);
    } finally {
        generateBtn.disabled = false;
        btnText.innerText = "Generate Response";
        btnIcon.classList.remove("spin-icon");
        statusDot.classList.remove("active");
    }
});
