// Updated default fallbacks
const DEFAULT_API_URL = "https://832ca64ca28e2d.lhr.life/v1/chat/completions";
const DEFAULT_API_KEY = "sk-my-secret-key-12345";
const DEFAULT_MODEL = "gemma4:e2b";

const endpointInput = document.getElementById('api-url');
const apiKeyInput = document.getElementById('api-key');
const modelInput = document.getElementById('model-name');
const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate-btn');
const statusDiv = document.getElementById('status');
const outputDiv = document.getElementById('output');

// Pre-fill inputs with default configuration
if (endpointInput) endpointInput.value = DEFAULT_API_URL;
if (apiKeyInput) apiKeyInput.value = DEFAULT_API_KEY;
if (modelInput) modelInput.value = DEFAULT_MODEL;

generateBtn.addEventListener('click', async () => {
  const promptText = promptInput.value.trim();
  const apiUrl = endpointInput.value.trim() || DEFAULT_API_URL;
  const apiKey = apiKeyInput.value.trim() || DEFAULT_API_KEY;
  const modelName = modelInput.value.trim() || DEFAULT_MODEL;

  if (!promptText) return;

  generateBtn.disabled = true;
  statusDiv.innerText = "Sending request to hosted Gemma 4 model...";
  outputDiv.innerText = "";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: promptText }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    outputDiv.innerText = reply;
    statusDiv.innerText = "Response received!";
  } catch (error) {
    statusDiv.innerText = `Error: ${error.message}`;
    console.error("API Request Failed:", error);
  } finally {
    generateBtn.disabled = false;
  }
});
