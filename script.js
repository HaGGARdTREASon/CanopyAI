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
    if (!generator) {
      statusDiv.innerText = "Downloading model weights into browser...";
      
      // REQUIRED FIX: Added '-ONNX' to the repo name
      generator = await pipeline('text-generation', 'onnx-community/SmolLM2-360M-Instruct-ONNX', {
        device: 'webgpu',
        dtype: 'q4'
      });
    }

    statusDiv.innerText = "Generating text...";
    outputDiv.innerText = "";

    const result = await generator([{ role: 'user', content: text }], {
      max_new_tokens: 128,
      do_sample: true,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.15
    });

    outputDiv.innerText = result[0].generated_text.at(-1).content;
    statusDiv.innerText = "Done!";
  } catch (error) {
    statusDiv.innerText = `Error: ${error.message}`;
    console.error(error);
  } finally {
    generateBtn.disabled = false;
  }
});
