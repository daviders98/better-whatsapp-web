import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

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

    return NextResponse.json({ translated, model: "gemini" });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "Gemini failed" }, { status: 500 });
  }
}
