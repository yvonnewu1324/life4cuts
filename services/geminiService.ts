import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCaption = async (vibe: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a single, short, trendy, aesthetic caption (maximum 6 words) for a photo booth strip. 
      The user describes the vibe as: "${vibe}".
      Examples of style: "Best friends forever", "Seoul Vibes 🇰🇷", "Date Night ❤️", "Sunny days".
      Return ONLY the text of the caption, nothing else.`,
      config: {
        temperature: 1.0, 
      }
    });

    return response.text?.trim() || "Good Vibes Only";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Memories ✨";
  }
};