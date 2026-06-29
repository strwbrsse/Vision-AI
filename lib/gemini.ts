
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

export const PROMPTS = {
  academic: `
Respond ONLY with valid JSON.

{
  "objects": [],
  "context": "",
  "activities": "",
  "recommendations": ""
}

Act as a university professor.

Analyze this image and provide:
1. Objects present
2. Educational context
3. Activities happening
4. One constructive academic recommendation.
`,

  safety: `
Respond ONLY with valid JSON.

{
  "objects": [],
  "context": "",
  "activities": "",
  "recommendations": ""
}

Act as a workplace safety inspector.

Analyze this image and identify:
1. Objects
2. Safety hazards
3. Risks
4. Safety recommendations.

If there are no hazards, clearly state that.
`,

  inventory: `
Respond ONLY with valid JSON.

{
  "objects": [],
  "context": "",
  "activities": "",
  "recommendations": ""
}

Act as an inventory manager.

List all visible assets in the image.
Keep responses concise.
`,
} as const;

export async function imageToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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

  console.log("HTTP Status:", response.status);

  const json = await response.json();

  console.log("Gemini Response:", json);

  return json;
}
