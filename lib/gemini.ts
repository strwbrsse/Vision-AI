import { File } from "expo-file-system";

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

export const PROMPTS = {
  academic: `
Analyze this image.

Identify:
1. Objects
2. Context
3. Activities
4. Recommendations

Respond ONLY with valid JSON.

{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`,

  safety: `
Act as a workplace safety inspector.

Analyze this image.

Respond ONLY with valid JSON.

{
  "objects": [],
  "context": "...",
  "activities": "...",
  "recommendations": "List any safety hazards. If none exist, say so."
}
`,

  inventory: `
Act as an inventory manager.

List every visible asset.

Respond ONLY with valid JSON.

{
  "objects": [],
  "context": "Inventory",
  "activities": "None",
  "recommendations": "None"
}
`,
};

export async function imageToBase64(uri: string): Promise<string> {
  const file = new File(uri);

  const base64 = await file.base64();

  if (!base64) {
    throw new Error("Failed to convert image to Base64.");
  }

  return base64;
}

export async function analyzeImage(base64Image: string, prompt: string) {
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
    }),
  });

  const json = await response.json();

  console.log("HTTP Status:", response.status);
  console.log("Gemini Response:", JSON.stringify(json, null, 2));

  return json;
}
