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
      statusDiv.innerText = "Downloading model weights into browser (SmolLM2-360M)...";
      
      // Official repo containing native browser-compatible ONNX weights
      generator = await pipeline('text-generation', 'HuggingFaceTB/SmolLM2-360M-Instruct', {
        device: 'webgpu',
        dtype: 'q4' // 4-bit quantization stabilizes WebGPU execution
      });
    }

    statusDiv.innerText = "Generating response...";
    outputDiv.innerText = "";

    const messages = [{ role: 'user', content: text }];
    const result = await generator(messages, {
      max_new_tokens: 128,
      do_sample: true,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.15
    });

    const generated = result[0].generated_text;
    outputDiv.innerText = Array.isArray(generated) ? generated.at(-1).content : generated;
    statusDiv.innerText = "Done!";
  } catch (error) {
    statusDiv.innerText = `Error: ${error.message}`;
    console.error(error);
  } finally {
    generateBtn.disabled = false;
  }
});
