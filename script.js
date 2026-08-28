const API_URL = "https://832ca64ca28e2d.lhr.life/v1/chat/completions";
const API_KEY = "sk-my-secret-key-12345";
const MODEL_NAME = "gemma2:2b";

const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate-btn');
const statusDiv = document.getElementById('status');
const outputDiv = document.getElementById('output');

generateBtn.addEventListener('click', async () => {
  const text = promptInput.value.trim();
  if (!text) return;

  generateBtn.disabled = true;
  statusDiv.innerText = "Sending request to hosted Gemma model...";
  outputDiv.innerText = "";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: text }]
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
    console.error("API Call Failed:", error);
  } finally {
    generateBtn.disabled = false;
  }
});
