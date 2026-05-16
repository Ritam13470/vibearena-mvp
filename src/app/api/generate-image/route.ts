import { NextResponse } from "next/server";

export const runtime = "nodejs";

type GenerateImageRequest = {
  imagePrompt: string;
  characterName: string;
  origin: string;
  power: string;
  weakness: string;
  catchphrase: string;
  rarity: string;
  visualType: string;
  stylePreset: string;
  originalPrompt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTrimmedString(
  value: unknown,
  fallback = "",
  maxLength = 1200,
) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : fallback;
}

function parseGenerateImageRequest(value: unknown): GenerateImageRequest | null {
  if (!isRecord(value)) return null;

  const imagePrompt = getTrimmedString(value.imagePrompt, "", 2800);

  if (!imagePrompt) return null;

  return {
    imagePrompt,
    characterName: getTrimmedString(
      value.characterName,
      "VibeArena character",
      120,
    ),
    origin: getTrimmedString(value.origin, "", 300),
    power: getTrimmedString(value.power, "", 300),
    weakness: getTrimmedString(value.weakness, "", 240),
    catchphrase: getTrimmedString(value.catchphrase, "", 180),
    rarity: getTrimmedString(value.rarity, "Legendary", 60),
    visualType: getTrimmedString(value.visualType, "default", 80),
    stylePreset: getTrimmedString(value.stylePreset, "Cyberpunk", 80),
    originalPrompt: getTrimmedString(value.originalPrompt, "", 600),
  };
}

function buildVisualTypeQualityPrompt(visualType: string) {
  const normalizedType = visualType.toLowerCase();

  if (normalizedType === "tiger" || normalizedType === "beast") {
    return [
      "powerful feline anatomy",
      "luminous glowing eyes",
      "neon claw energy",
      "cybernetic armor accents",
      "electric aura",
      "sharp fur detail",
      "predatory hero silhouette",
    ].join(", ");
  }

  if (normalizedType === "dragon") {
    return [
      "luminous glowing eyes",
      "detailed facial structure",
      "luminous scales",
      "mystical flame energy",
      "elegant wings and horns",
      "magical aura",
      "regal dragon oracle presence",
    ].join(", ");
  }

  if (normalizedType === "robot" || normalizedType === "agent") {
    return [
      "glowing optic sensors",
      "high-tech armor plating",
      "sharp metallic details",
      "holographic accents",
      "polished sci-fi rendering",
      "precision engineered silhouette",
    ].join(", ");
  }

  if (normalizedType === "waifu") {
    return [
      "safe premium anime cyber-fantasy portrait quality",
      "luminous glowing eyes",
      "elegant lighting",
      "detailed hair",
      "detailed costume",
      "kind companion aura",
      "non-sexual heroic design",
    ].join(", ");
  }

  return [
    "premium sci-fi fantasy hero render",
    "luminous glowing eyes",
    "cinematic hero composition",
    "abstract Solana energy accents",
    "sharp readable silhouette",
  ].join(", ");
}

function compactProviderPrompt(parts: string[]) {
  return parts
    .filter((part) => part.trim().length > 0)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 3200);
}

function buildPollinationsPrompt(request: GenerateImageRequest) {
  const {
    imagePrompt,
    characterName,
    origin,
    power,
    weakness,
    catchphrase,
    rarity,
    visualType,
    stylePreset,
    originalPrompt,
  } = request;
  const loreDetails = [
    origin ? `Origin: ${origin}.` : "",
    power ? `Power: ${power}.` : "",
    weakness ? `Weakness: ${weakness}.` : "",
    catchphrase ? `Catchphrase: ${catchphrase}.` : "",
  ].filter(Boolean);

  return compactProviderPrompt([
    `${characterName}, ${rarity} ${visualType} VibeArena character, ${stylePreset} style.`,
    "Main subject centered and dominant, clear face, visible eyes, glowing eyes, front-facing or 3/4 hero view, chest-up waist-up or full-body hero pose with the face large enough to read.",
    "Ultra detailed premium game key art, fantasy sci-fi concept art quality, sharp focus, crisp edges, highly detailed face, polished texture detail, strong silhouette readability, clean composition.",
    "Cinematic lighting, dramatic rim lighting, volumetric neon glow, vibrant purple cyan green cyberpunk palette, high contrast, premium character rendering, polished dramatic lighting.",
    buildVisualTypeQualityPrompt(visualType),
    loreDetails.join(" "),
    `Original character art direction: ${imagePrompt}.`,
    originalPrompt ? `Original user prompt: ${originalPrompt}.` : "",
    "Avoid muddy blur, weak soft focus, low detail, dull colors, flat lighting, messy background, unreadable face, hidden eyes, text labels, watermark, logo, UI, frame border.",
  ]);
}

function getPollinationsUrls(encodedPrompt: string) {
  return [
    `https://gen.pollinations.ai/image/${encodedPrompt}`,
    `https://image.pollinations.ai/prompt/${encodedPrompt}`,
  ];
}

async function fetchPollinationsImage(encodedPrompt: string) {
  for (const imageUrl of getPollinationsUrls(encodedPrompt)) {
    const response = await fetch(imageUrl, {
      headers: {
        Accept: "image/*",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      continue;
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";

    if (!contentType.startsWith("image/")) {
      continue;
    }

    return {
      contentType,
      imageBuffer: Buffer.from(await response.arrayBuffer()),
    };
  }

  return null;
}

function safeErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message.slice(0, 240),
    };
  }

  if (!isRecord(error)) {
    return { type: typeof error };
  }

  return {
    name: typeof error.name === "string" ? error.name : "UnknownError",
    status: typeof error.status === "number" ? error.status : undefined,
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Image prompt is required." },
      { status: 400 },
    );
  }

  const imageRequest = parseGenerateImageRequest(body);

  if (!imageRequest) {
    return NextResponse.json(
      { error: "Image prompt is required." },
      { status: 400 },
    );
  }

  try {
    const encodedPrompt = encodeURIComponent(
      buildPollinationsPrompt(imageRequest),
    );
    const image = await fetchPollinationsImage(encodedPrompt);

    if (!image) {
      return NextResponse.json(
        { error: "Image generation failed." },
        { status: 500 },
      );
    }

    const imageUrl = `data:${image.contentType};base64,${image.imageBuffer.toString(
      "base64",
    )}`;

    return NextResponse.json({
      imageUrl,
      provider: "pollinations",
    });
  } catch (error) {
    console.error(
      "Pollinations image generation failed",
      JSON.stringify(safeErrorDetails(error)),
    );

    return NextResponse.json(
      { error: "Image generation failed." },
      { status: 500 },
    );
  }
}
