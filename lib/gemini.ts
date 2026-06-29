import * as FileSystem from "expo-file-system/legacy";

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

export const PROMPTS: Record<string, string> = {
  academic: `Act as a university professor. Looking at this image, provide an academic-style analysis.

Respond ONLY with valid JSON in this exact shape, no extra text:

{
  "objects": ["...", "..."],
  "context": "Describe the educational context of the scene",
  "activities": "What learning or academic activity appears to be happening",
  "recommendations": "One piece of constructive academic feedback"
}`,

  safety: `Act as a workplace safety inspector. Looking at this image, identify any visible hazards, risks, or safety concerns. If none are visible, state that clearly.

Respond ONLY with valid JSON in this exact shape, no extra text:

{
  "objects": ["...", "..."],
  "context": "Describe the environment from a safety perspective",
  "activities": "What activities or behaviors are occurring that may pose risk",
  "recommendations": "Your top safety recommendation, or 'No hazards identified'"
}`,

  inventory: `Act as an asset management clerk. Looking at this image, list every visible physical asset as a clean inventory list, with no extra commentary.

Respond ONLY with valid JSON in this exact shape, no extra text:

{
  "objects": ["...", "..."],
  "context": "Location or area type where assets are stored",
  "activities": "Current state or condition of the assets",
  "recommendations": "Any asset management action required"
}`,
};

export const ANALYSIS_PROMPT = PROMPTS.academic;

export async function imageToBase64(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeImage(base64Image: string, prompt: string) {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
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

      if (response.ok) {
        const json = await response.json();

        console.log("====================================");
        console.log("Gemini Success");
        console.log(JSON.stringify(json, null, 2));
        console.log("====================================");

        return json;
      }

      const errorText = await response.text();

      console.log("====================================");
      console.log("Gemini Status:", response.status);
      console.log("Gemini Error:", errorText);
      console.log("====================================");

      if (response.status === 503 && attempt < MAX_RETRIES) {
        console.log(`Gemini busy. Retrying ${attempt}/${MAX_RETRIES}...`);

        await delay(2000);
        continue;
      }

      throw new Error(`Gemini API Error: ${response.status}`);
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        throw error;
      }

      console.log(`Retrying request (${attempt}/${MAX_RETRIES})...`);

      await delay(2000);
    }
  }

  throw new Error("Gemini request failed after multiple retries.");
}
