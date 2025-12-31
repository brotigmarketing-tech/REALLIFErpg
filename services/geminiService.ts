
import { GoogleGenAI } from "@google/genai";

// Guideline: Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY}); 
// inside the function to ensure the most up-to-date API key is used.

export const getMotivationalFeedback = async (level: number, stats: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User is a level ${level} player in a Life RPG. 
                 Their current stats are: ${JSON.stringify(stats)}. 
                 Give a short, epic, 2-sentence motivational RPG-style encouragement.`,
    });
    // Property .text returns the string output directly
    return response.text || "Every struggle is a hidden XP bar. Keep grinding, hero!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The path to greatness is long, but every step counts. Keep grinding, hero!";
  }
};

export const getSeasonalBossDescription = async (season: number) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const bosses = [
      "The Iron Sentinel (Strength/Stamina focus)",
      "The Balanced One (All-around focus)",
      "The Regulator (Hardcore health focus)",
      "The Perfect Balance (Mastery focus)"
    ];
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a 3-sentence dark, epic RPG introduction for a boss called ${bosses[season - 1]} for Season ${season}. Include their phases.`,
    });
    return response.text || `The Season ${season} boss awaits in the final week. Prepare your body and mind.`;
  } catch (error) {
    return `The Season ${season} boss awaits in the final week. Prepare your body and mind.`;
  }
};
