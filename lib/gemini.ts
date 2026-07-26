const stripFence = (value: string) =>
  value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

export function geminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function generateJson<T>(prompt: string): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini is not configured");
  }

  const model = (
    process.env.GEMINI_MODEL || "gemini-3.6-flash"
  )
    .replace(/^models\//, "")
    .trim();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18_000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();

      throw new Error(
        `Gemini request failed (${response.status}): ${detail.slice(0, 500)}`,
      );
    }

    const payload = await response.json();

    const text = payload?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      throw new Error("Gemini returned no text");
    }

    return JSON.parse(stripFence(text)) as T;
  } finally {
    clearTimeout(timer);
  }
}