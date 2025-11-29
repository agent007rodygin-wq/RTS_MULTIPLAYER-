import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Building } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is provided.
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateBuildingDescription = async (building: Building): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Cannot generate description.";
  }
  
  const prompt = `
    Generate a creative and engaging in-game description for a building with the following characteristics.
    The description should be in Russian, about 2-3 sentences long, and fit a fantasy game world theme.

    Building Name: ${building.name}
    Category: ${building.category}
    Durability: ${building.stats.durability}
    Key Stats:
    ${building.stats.populationBonus ? `- Provides housing for ${building.stats.populationBonus} population` : ''}
    ${building.stats.produces ? `- Produces: ${building.stats.produces.map(p => `${p.amount} ${p.name}`).join(', ')}` : ''}
    ${building.stats.consumes ? `- Consumes: ${building.stats.consumes.map(c => `${c.amount} ${c.name}`).join(', ')}` : ''}
    ${building.description ? `Original Description Hint: ${building.description}` : ''}

    Generate only the creative description text, without any introductory phrases like "Here is a description:".
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "Не удалось сгенерировать описание. Попробуйте позже.";
  }
};