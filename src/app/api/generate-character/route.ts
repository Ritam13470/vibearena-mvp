import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AICharacterResponse = {
  name: string;
  origin: string;
  power: string;
  weakness: string;
  score: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
  catchphrase: string;
  rank: number;
  visualType:
    | "tiger"
    | "dragon"
    | "robot"
    | "waifu"
    | "agent"
    | "beast"
    | "default";
  imagePrompt: string;
};

type Rarity = AICharacterResponse["rarity"];
type VisualType = AICharacterResponse["visualType"];
type GeneratedCharacter = AICharacterResponse;

const rarityValues = new Set<string>([
  "Common",
  "Rare",
  "Epic",
  "Legendary",
  "Mythic",
]);

const visualTypeValues = new Set<string>([
  "tiger",
  "dragon",
  "robot",
  "waifu",
  "agent",
  "beast",
  "default",
]);

const stringFields = [
  "name",
  "origin",
  "power",
  "weakness",
  "catchphrase",
  "imagePrompt",
] as const satisfies readonly (keyof AICharacterResponse)[];

const numberFields = [
  "score",
  "rank",
] as const satisfies readonly (keyof AICharacterResponse)[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRarity(value: unknown): value is Rarity {
  return typeof value === "string" && rarityValues.has(value);
}

function isVisualType(value: unknown): value is VisualType {
  return typeof value === "string" && visualTypeValues.has(value);
}

function isAICharacterResponse(value: unknown): value is AICharacterResponse {
  if (!isRecord(value)) return false;

  return (
    stringFields.every((field) => isNonEmptyString(value[field])) &&
    numberFields.every((field) => isFiniteNumber(value[field])) &&
    isRarity(value.rarity) &&
    isVisualType(value.visualType)
  );
}

function getCharacterCandidate(value: unknown): unknown {
  if (isRecord(value) && isRecord(value.character)) {
    return value.character;
  }

  return value;
}

function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function rarityForScore(score: number): Rarity {
  if (score >= 96) return "Mythic";
  if (score >= 88) return "Legendary";
  if (score >= 78) return "Epic";
  if (score >= 68) return "Rare";
  return "Common";
}

function normalizeCharacter(
  character: AICharacterResponse,
): GeneratedCharacter {
  const score = clampInteger(character.score, 60, 99);

  return {
    name: character.name.trim(),
    origin: character.origin.trim(),
    power: character.power.trim(),
    weakness: character.weakness.trim(),
    score,
    rarity: rarityForScore(score),
    catchphrase: character.catchphrase.trim(),
    rank: clampInteger(character.rank, 1, 99),
    visualType: character.visualType,
    imagePrompt: character.imagePrompt.trim(),
  };
}

function safeErrorDetails(error: unknown) {
  if (error instanceof Error) {
    const details = error as Error & {
      status?: number;
      code?: string;
    };

    return {
      name: details.name,
      message: details.message.slice(0, 240),
      status: typeof details.status === "number" ? details.status : undefined,
      code: typeof details.code === "string" ? details.code : undefined,
    };
  }

  if (!isRecord(error)) {
    return { type: typeof error };
  }

  return {
    name: typeof error.name === "string" ? error.name : "UnknownError",
    status: typeof error.status === "number" ? error.status : undefined,
    code: typeof error.code === "string" ? error.code : undefined,
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Prompt is required." },
      { status: 400 },
    );
  }

  const prompt = isRecord(body) && typeof body.prompt === "string"
    ? body.prompt.trim()
    : "";
  const style = isRecord(body) && typeof body.style === "string"
    ? body.style.trim()
    : "Cyberpunk";

  if (!prompt) {
    return NextResponse.json(
      { error: "Prompt is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY." },
      { status: 500 },
    );
  }

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_completion_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You generate fictional AI battle characters for VibeArena, a premium cyberpunk crypto x AI game dashboard with Solana-inspired purple, cyan, and green styling. Return valid JSON only. No markdown, no explanation, no code fences, no extra text.",
        },
        {
          role: "user",
          content: `Create one VibeArena character from this user prompt and style.

User prompt: ${prompt}
Style preset: ${style}

Return exactly this JSON object shape:
{
  "name": "string",
  "origin": "string",
  "power": "string",
  "weakness": "string",
  "score": number,
  "rarity": "Common" | "Rare" | "Epic" | "Legendary" | "Mythic",
  "catchphrase": "string",
  "rank": number,
  "visualType": "tiger" | "dragon" | "robot" | "waifu" | "agent" | "beast" | "default",
  "imagePrompt": "string"
}

Rules:
- name must be short and memorable.
- origin must be one sentence.
- power must be one sentence.
- weakness must be one sentence.
- score must be an integer from 60 to 99.
- rank must be an integer from 1 to 99.
- rarity must match score: 96-99 Mythic, 88-95 Legendary, 78-87 Epic, 68-77 Rare, 60-67 Common.
- visualType must match prompt keywords: tiger/lion/panther/beast => tiger or beast; dragon/oracle/mystic => dragon; robot/mecha/cyborg/android => robot; waifu/anime/companion => waifu; agent/bot/assistant => agent; otherwise default.
- imagePrompt must describe high-quality future AI image generation as premium 3D game art in VibeArena style.
- Keep waifu output safe and non-sexual.`,
        },
      ],
    });

    const content = completion.choices[0]?.message.content;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "AI returned invalid character data." },
        { status: 500 },
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid character data." },
        { status: 500 },
      );
    }

    const candidate = getCharacterCandidate(parsed);

    if (!isAICharacterResponse(candidate)) {
      return NextResponse.json(
        { error: "AI returned invalid character data." },
        { status: 500 },
      );
    }

    return NextResponse.json(normalizeCharacter(candidate));
  } catch (error) {
    console.error(
      "Groq character generation failed",
      JSON.stringify(safeErrorDetails(error)),
    );

    return NextResponse.json(
      { error: "AI returned invalid character data." },
      { status: 500 },
    );
  }
}
