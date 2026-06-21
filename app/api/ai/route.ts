import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export type AIOperation = "summarize" | "extract" | "generate" | "custom";
export type AIProvider = "groq" | "openai";

const GROQ_MODELS: Record<string, string> = {
  fast: "llama3-8b-8192",
  smart: "llama3-70b-8192",
};

const OPENAI_MODELS: Record<string, string> = {
  fast: "gpt-4o-mini",
  smart: "gpt-4o",
};

function buildMessages(
  operation: AIOperation,
  input: string,
  extractFields?: string,
  customSystemPrompt?: string,
  customUserPrompt?: string,
): { role: "system" | "user"; content: string }[] {
  switch (operation) {
    case "summarize":
      return [
        { role: "system", content: "You are a concise summarizer. Return only the summary, no preamble." },
        { role: "user", content: `Summarize the following:\n\n${input}` },
      ];
    case "extract":
      return [
        {
          role: "system",
          content:
            "You are a data extractor. Return ONLY a valid JSON object with the requested fields. No markdown, no explanation.",
        },
        {
          role: "user",
          content: `Extract the following fields: ${extractFields || "all key information"}\n\nFrom this text:\n${input}`,
        },
      ];
    case "generate":
      return [
        { role: "system", content: "You are a helpful assistant. Be concise and direct." },
        { role: "user", content: input },
      ];
    case "custom":
      return [
        {
          role: "system",
          content: customSystemPrompt || "You are a helpful assistant.",
        },
        {
          role: "user",
          content: customUserPrompt ? `${customUserPrompt}\n\n${input}` : input,
        },
      ];
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    operation,
    input,
    provider = "groq",
    model = "fast",
    apiKey,
    extractFields,
    customSystemPrompt,
    customUserPrompt,
  } = body as {
    operation: AIOperation;
    input: string;
    provider?: AIProvider;
    model?: "fast" | "smart";
    apiKey?: string;
    extractFields?: string;
    customSystemPrompt?: string;
    customUserPrompt?: string;
  };

  if (!operation || !input) {
    return NextResponse.json({ error: "operation and input are required" }, { status: 400 });
  }

  const messages = buildMessages(operation, input, extractFields, customSystemPrompt, customUserPrompt);

  try {
    let outputText = "";

    if (provider === "groq") {
      const key = apiKey || process.env.GROQ_API_KEY;
      if (!key) return NextResponse.json({ error: "No Groq API key configured. Add GROQ_API_KEY to env or paste a key in the node." }, { status: 400 });
      const { default: Groq } = await import("groq-sdk");
      const groq = new Groq({ apiKey: key });
      const completion = await groq.chat.completions.create({
        model: GROQ_MODELS[model] ?? GROQ_MODELS.fast,
        messages,
        max_tokens: 2048,
        temperature: 0.3,
      });
      outputText = completion.choices[0]?.message?.content ?? "";
    } else {
      const key = apiKey || process.env.OPENAI_API_KEY;
      if (!key) return NextResponse.json({ error: "No OpenAI API key configured. Add OPENAI_API_KEY to env or paste a key in the node." }, { status: 400 });
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: key });
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODELS[model] ?? OPENAI_MODELS.fast,
        messages,
        max_tokens: 2048,
        temperature: 0.3,
      });
      outputText = completion.choices[0]?.message?.content ?? "";
    }

    // For extract: try to parse as JSON so downstream nodes get an object
    let parsedOutput: any = outputText;
    if (operation === "extract") {
      try {
        // Strip markdown code fences if the model added them
        const clean = outputText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        parsedOutput = JSON.parse(clean);
      } catch {
        parsedOutput = outputText;
      }
    }

    return NextResponse.json({
      success: true,
      output: parsedOutput,
      raw: outputText,
      operation,
      provider,
      model,
    });
  } catch (err: any) {
    console.error("[/api/ai]", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "AI request failed" },
      { status: 500 },
    );
  }
}
