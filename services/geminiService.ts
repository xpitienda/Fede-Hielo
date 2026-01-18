
import { GoogleGenAI } from "@google/genai";

export class GeminiImageService {
  async generateWaterManImage(prompt: string, referenceImageBase64?: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contents: any = {
      parts: []
    };

    if (referenceImageBase64) {
      contents.parts.push({
        inlineData: {
          data: referenceImageBase64.split(',')[1] || referenceImageBase64,
          mimeType: 'image/png'
        }
      });
    }

    contents.parts.push({ text: prompt });

    // Usamos gemini-2.5-flash-image para evitar la necesidad de selector de clave manual
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      },
    });

    // Buscar la parte de la imagen en la respuesta
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No se pudo extraer la imagen de la respuesta de la API.");
  }
}
