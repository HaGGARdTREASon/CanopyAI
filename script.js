import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3';

let generator = null;

const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate-btn');
const statusDiv = document.getElementById('status');
const outputDiv = document.getElementById('output');

generateBtn.addEventListener('click', async () => {
  const text = promptInput.value.trim();
  if (!text) return;

  generateBtn.disabled = true;

  try {
    // Lazily load the pipeline on first request
    if (!generator) {
      statusDiv.innerText = "Downloading model weights into browser (only happens once)...";
      generator = await pipeline('text-generation', 'HuggingFaceTB/SmolLM2-360M-Instruct', {
        device: 'webgpu' // Falls back to WASM automatically if WebGPU is unavailable
      });
    }

    statusDiv.innerText = "Generating text...";
    outputDiv.innerText = "";

    const messages = [{ role: 'user', content: text }];
    const result = await generator(messages, { max_new_tokens: 128 });

    outputDiv.innerText = result[0].generated_text.at(-1).content;
    statusDiv.innerText = "Done!";
  } catch (error) {
    statusDiv.innerText = `Error: ${error.message}`;
    console.error(error);
  } finally {
    generateBtn.disabled = false;
  }
});