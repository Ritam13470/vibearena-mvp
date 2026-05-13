import Groq from "groq-sdk";

export const runtime = "nodejs";

type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

type VisualType =
  | "tiger"
  | "dragon"
  | "robot"
  | "waifu"
  | "agent"
  | "beast"
  | "default";

type GeneratedCharacter = {
  name: string;
  origin: string;
  power: string;
  weakness: string;
  score: number;
  rarity: Rarity;
  catchphrase: string;
  rank: number;
  visualType: VisualType;
  imagePrompt: string;
};

const visualTypes: VisualType[] = [
  "tiger",
  "dragon",
  "robot",
  "waifu",
  "agent",
  "beast",
  "default",
];

function rarityForScore(score: number): Rarity {
  if (score >= 96) return "Mythic";
  if (score >= 88) return "Legendary";
  if (score >= 78) return "Epic";
  if (score >= 68) return "Rare";
  return "Common";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function getVisualTypeFromPrompt(prompt: string): VisualType {
  const lowerPrompt = prompt.toLowerCase();

  if (
    ["tiger", "lion", "panther"].some((keyword) =>
      lowerPrompt.includes(keyword),
    )
  ) {
    return "tiger";
  }

  if (lowerPrompt.includes("beast")) return "beast";

  if (
    ["dragon", "oracle", "mystic"].some((keyword) =>
      lowerPrompt.includes(keyword),
    )
  ) {
    return "dragon";
  }

  if (
    ["robot", "mecha", "cyborg", "android"].some((keyword) =>
      lowerPrompt.includes(keyword),
    )
  ) {
    return "robot";
  }

  if (
    ["waifu", "anime", "companion"].some((keyword) =>
      lowerPrompt.includes(keyword),
    )
  ) {
    return "waifu";
  }

  if (
    ["agent", "bot", "assistant"].some((keyword) =>
      lowerPrompt.includes(keyword),
    )
  ) {
    return "agent";
  }

  return "default";
}

function parseInteger(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeCharacter(
  value: unknown,
  prompt: string,
): GeneratedCharacter | null {
  const candidate = isRecord(value) && isRecord(value.character)
    ? value.character
    : value;

  if (!isRecord(candidate)) return null;

  if (
    !isNonEmptyString(candidate.name) ||
    !isNonEmptyString(candidate.origin) ||
    !isNonEmptyString(candidate.power) ||
    !isNonEmptyString(candidate.weakness) ||
    !isNonEmptyString(candidate.catchphrase) ||
    !isNonEmptyString(candidate.imagePrompt)
  ) {
    return null;
  }

  const scoreValue = parseInteger(candidate.score);
  const rankValue = parseInteger(candidate.rank);

  if (scoreValue === null) return null;

  const score = clampInteger(scoreValue, 60, 99);
  const rank = rankValue === null
    ? clampInteger(100 - score, 1, 99)
    : clampInteger(rankValue, 1, 99);
  const visualType = typeof candidate.visualType === "string" &&
    visualTypes.includes(candidate.visualType as VisualType)
    ? candidate.visualType as VisualType
    : getVisualTypeFromPrompt(prompt);

  return {
    name: candidate.name.trim(),
    origin: candidate.origin.trim(),
    power: candidate.power.trim(),
    weakness: candidate.weakness.trim(),
    score,
    rarity: rarityForScore(score),
    catchphrase: candidate.catchphrase.trim(),
    rank,
    visualType,
    imagePrompt: candidate.imagePrompt.trim(),
  };
}

function cleanCharacter(character: GeneratedCharacter): GeneratedCharacter {
  return {
    name: character.name.trim(),
    origin: character.origin.trim(),
    power: character.power.trim(),
    weakness: character.weakness.trim(),
    score: character.score,
    rarity: character.rarity,
    catchphrase: character.catchphrase.trim(),
    rank: character.rank,
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
    return Response.json({ error: "Prompt is required." }, { status: 400 });
  }

  const prompt = isRecord(body) && typeof body.prompt === "string"
    ? body.prompt.trim()
    : "";
  const style = isRecord(body) && typeof body.style === "string"
    ? body.style.trim()
    : "Cyberpunk";

  if (!prompt) {
    return Response.json({ error: "Prompt is required." }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Missing GROQ_API_KEY." }, { status: 500 });
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
      return Response.json(
        { error: "AI returned invalid character data." },
        { status: 500 },
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch {
      return Response.json(
        { error: "AI returned invalid character data." },
        { status: 500 },
      );
    }

    const character = normalizeCharacter(parsed, prompt);

    if (!character) {
      return Response.json(
        { error: "AI returned invalid character data." },
        { status: 500 },
      );
    }

    return Response.json(cleanCharacter(character));
  } catch (error) {
    console.error(
      "Groq character generation failed",
      JSON.stringify(safeErrorDetails(error)),
    );

    return Response.json(
      { error: "AI returned invalid character data." },
      { status: 500 },
    );
  }
}
