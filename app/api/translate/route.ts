import { NextResponse } from "next/server";
import { pipeline } from "@xenova/transformers";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

let translator: NLLBTranslator | null = null;

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

interface NLLBTranslation {
  translation_text: string;
}

type NLLBTranslator = (
  text: string,
  options: Record<string, unknown>
) => Promise<NLLBTranslation[]>;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const text = url.searchParams.get("text") || "";
  const src = url.searchParams.get("src") || "eng_Latn";
  const tgt = url.searchParams.get("tgt") || "spa_Latn";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Translate this text from ${src} to ${tgt}.
Return ONLY the translated result, no explanation.
"${text}"
    `;

    const result = await model.generateContent(prompt);
    const translated = result.response.text().trim();

    if (translated) {
      return NextResponse.json({ translated, model: "gemini" });
    }
  } catch (err: unknown) {
    console.warn("Gemini error:", err);
  }

  try {
    if (!translator) {
      const pipe = await pipeline(
        "translation",
        "Xenova/nllb-200-distilled-600M"
      );

      translator = pipe as unknown as NLLBTranslator;
    }

    const output = await translator(text, {
      src_lang: src,
      tgt_lang: tgt,
    });

    return NextResponse.json({
      translated: output[0].translation_text,
      model: "xenova",
    });
  } catch (err: unknown) {
    console.error("XENOVA failed:", err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Unknown Xenova error",
    });
  }
}
