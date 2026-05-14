import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type GenerateImageRequest = {
  imagePrompt: string;
  characterName: string;
  visualType: string;
};

type OpenAIImageResult = {
  b64_json?: string;
  url?: string;
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
    visualType: getTrimmedString(value.visualType, "default", 80),
  };
}

function buildVibeArenaImagePrompt({
  imagePrompt,
  characterName,
  visualType,
}: GenerateImageRequest) {
  return [
    imagePrompt,
    `Character name: ${characterName}.`,
    `Visual type: ${visualType}.`,
    "Create a polished premium 3D game-character portrait for VibeArena.",
    "Use a dark neon Solana arena style with purple, cyan, and green lighting.",
    "Make it dramatic, high-quality, safe, non-sexual, and suitable for a game dashboard collectible card.",
    "No text labels inside the image.",
    "No logos and no marks that imitate real brands.",
  ].join(" ");
}

async function getDataUrlFromImage(image: OpenAIImageResult) {
  if (typeof image.b64_json === "string" && image.b64_json.length > 0) {
    if (image.b64_json.startsWith("data:image/")) {
      return image.b64_json;
    }

    return `data:image/png;base64,${image.b64_json}`;
  }

  if (typeof image.url !== "string" || !image.url) {
    return null;
  }

  const imageResponse = await fetch(image.url);

  if (!imageResponse.ok) {
    return null;
  }

  const contentType = imageResponse.headers.get("content-type") ?? "image/png";
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  return `data:${contentType};base64,${imageBuffer.toString("base64")}`;
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

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY." },
      { status: 500 },
    );
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.images.generate({
      model: "gpt-image-1-mini",
      prompt: buildVibeArenaImagePrompt(imageRequest),
      n: 1,
      size: "1024x1024",
      quality: "low",
      output_format: "png",
      moderation: "auto",
    });

    const image = response.data?.[0];
    const imageUrl = image ? await getDataUrlFromImage(image) : null;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image generation failed." },
        { status: 500 },
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error(
      "OpenAI image generation failed",
      JSON.stringify(safeErrorDetails(error)),
    );

    return NextResponse.json(
      { error: "Image generation failed." },
      { status: 500 },
    );
  }
}
