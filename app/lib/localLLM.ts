import { MLCEngine } from "@mlc-ai/web-llm";

let engine: MLCEngine | null = null;
let initializing = false;

export async function translateLocal(text: string, src: string, tgt: string) {
  if (!text.trim()) return "";

  if (!engine && !initializing) {
    initializing = true;

    engine = new MLCEngine();

    await engine.reload("Llama-3.2-1B-Instruct-q4f32_1-MLC");

    initializing = false;
  }

  if (!engine) {
    throw new Error("Model still initializing...");
  }
  const prompt = `Translate the following text from ${src} to ${tgt}. 
Return only the translation, no explanation.

${text}`;

  const response = await engine.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    stream: false,
  });

  return response.choices?.[0]?.message?.content?.trim() || "";
}
