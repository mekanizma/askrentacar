import { NextResponse } from "next/server";
import type { LocaleCode, LocalizedString } from "@/types";

const SUPPORTED_LOCALES: LocaleCode[] = ["tr", "en", "ru"];

function decodeEntities(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function translate(text: string, source: LocaleCode, target: LocaleCode) {
  if (source === target) return text;
  const params = new URLSearchParams({
    q: text,
    langpair: `${source}|${target}`,
  });
  const response = await fetch(
    `https://api.mymemory.translated.net/get?${params.toString()}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    },
  );
  if (!response.ok) throw new Error("Translation provider unavailable");
  const payload = (await response.json()) as {
    responseStatus?: number;
    responseData?: { translatedText?: string };
  };
  const translated = payload.responseData?.translatedText?.trim();
  if (payload.responseStatus !== 200 || !translated) {
    throw new Error("Translation failed");
  }
  return decodeEntities(translated);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: unknown;
      sourceLocale?: unknown;
    };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const sourceLocale = body.sourceLocale as LocaleCode;

    if (
      !text ||
      text.length > 2000 ||
      !SUPPORTED_LOCALES.includes(sourceLocale)
    ) {
      return NextResponse.json(
        { error: "Invalid translation request" },
        { status: 400 },
      );
    }

    const entries = await Promise.all(
      SUPPORTED_LOCALES.map(async (target) => [
        target,
        await translate(text, sourceLocale, target),
      ]),
    );

    return NextResponse.json({
      translations: Object.fromEntries(entries) as unknown as LocalizedString,
    });
  } catch {
    return NextResponse.json(
      { error: "Automatic translation service is currently unavailable" },
      { status: 502 },
    );
  }
}
