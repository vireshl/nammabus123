import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentParameters, Schema } from "@google/genai";
import { GeminiResponseData, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set. Please set it in your environment.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface UserLocation {
    latitude: number;
    longitude: number;
}

export const runQuery = async (
    prompt: string, 
    useGrounding: boolean = true, 
    userLocation: UserLocation | null = null,
    responseSchema: Schema | null = null
): Promise<GeminiResponseData> => {
    try {
        const params: GenerateContentParameters = {
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {},
        };

        if (responseSchema) {
            params.config!.responseMimeType = "application/json";
            params.config!.responseSchema = responseSchema;
        } else if (useGrounding) {
            params.config!.tools = [{ googleMaps: {} }];
            if (userLocation) {
                params.config!.toolConfig = {
                    retrievalConfig: {
                        latLng: {
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                        },
                    },
                };
            }
        }

        const response = await ai.models.generateContent(params);
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const groundingChunks = groundingMetadata?.groundingChunks as GroundingChunk[] || null;

        return { text: response.text, groundingChunks };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('JSON')) {
             throw new Error("The AI returned an invalid data format. Please try again.");
        }
        throw new Error("Failed to get a response from the AI. Please check your connection and API key.");
    }
};