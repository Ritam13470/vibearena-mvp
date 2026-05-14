import { NextResponse } from "next/server";

export const runtime = "nodejs";

type GenerateImageRequest = {
  imagePrompt: string;
  characterName: string;
  visualType: string;
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

function buildPollinationsPrompt({
  imagePrompt,
  characterName,
  visualType,
}: GenerateImageRequest) {
  return [
    `${characterName}, ${visualType} character.`,
    "Premium 3D game character art, cyberpunk Solana arena, purple cyan green neon lighting, full body hero pose, high detail, no text labels, no watermark, safe non-sexual design.",
    `Original prompt: ${imagePrompt}`,
  ].join(" ");
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
