import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateJapaneseSpeech = async (text: string, voice: VoiceName): Promise<string> => {
  if (!text.trim()) {
    throw new Error("Please enter some Japanese text.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini.");
    }

    return base64Audio;
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    throw new Error(error.message || "Failed to generate speech.");
  }
};