
import { GoogleGenerativeAI } from "@google/generative-ai";

import { downloadFile } from "./driveService";

// Initialize the API
// Note: This requires VITE_GOOGLE_GEMINI_API_KEY in .env
const getGenAI = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Missing VITE_GOOGLE_GEMINI_API_KEY");
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
};

export interface ImageAnalysisResult {
    description: string;
    estimatedYear?: string;
    peopleCount?: number;
    location?: string;
    tags: string[];
}

// ... imports ...

export const analyzeImage = async (fileId: string): Promise<ImageAnalysisResult> => {
    const genAI = getGenAI();
    if (!genAI) throw new Error("API Key de Gemini no configurada");

    try {
        // Updated to Gemini 2.5 Flash as per 2025 availability
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        // Fetch the image content securely from Drive
        console.log(`Downloading file ${fileId} for analysis...`);
        const blob = await downloadFile(fileId);
        console.log(`File downloaded, size: ${blob.size} bytes`);

        const base64Data = await blobToBase64(blob);

        const prompt = `
            Analiza esta fotografía antigua.
            Responde ÚNICAMENTE con un objeto JSON válido. No incluyas texto adicional ni markdown.
            
            Estructura requerida:
            {
                "description": "Una descripción detallada y emotiva de la escena, la ropa, y el contexto histórico.",
                "estimatedYear": "Año estimado o década (ej. 1940s)",
                "peopleCount": Número de personas visibles (número entero),
                "location": "Ubicación estimada basada en el entorno (si es posible)",
                "tags": ["lista", "de", "palabras", "clave", "relevantes"]
            }
        `;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: blob.type,
            },
        };

        console.log("Sending request to Gemini...");
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        console.log("Gemini response received");

        // Clean up markdown code blocks if present
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson) as ImageAnalysisResult;

    } catch (error: any) {
        console.error("Error analyzing image with Gemini:", error);
        throw new Error(error.message || "Error desconocido en el servicio de IA");
    }
};

// Helper to convert Blob to Base64 (stripping the data:image/...;base64, prefix)
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove the data URL prefix
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
