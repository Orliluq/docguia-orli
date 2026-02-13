import { GoogleGenAI, Type } from "@google/genai";
import { ParsedAppointmentData } from "../types";

const genAI = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'demo-key'
});

const SYSTEM_INSTRUCTION = `
You are an expert medical receptionist AI. Your goal is to extract structured appointment data from natural language voice transcripts.
The user speaks Spanish.
The current date and time reference is: ${new Date().toISOString()}.
Use this reference to resolve terms like "mañana" (tomorrow), "el viernes" (this coming Friday), "pasado mañana" (day after tomorrow).

Rules:
1. Identify the 'patientName', 'dateStr' (YYYY-MM-DD), 'timeStr' (HH:mm 24h format), 'durationMinutes', 'reason', and 'consultantName'.
2. Handling Ambiguity:
   - If duration is not mentioned, default to 30.
   - If time is ambiguous (e.g., "a las 7"), prefer 07:00 to 19:00 unless context implies evening or "pm".
   - If day is ambiguous (e.g., "el lunes" but today is Monday), assume next week's Monday unless "hoy" is said.
3. Return an array of strings in 'ambiguities' for any field you had to guess or felt was unclear (e.g., "time", "patient").
4. If no date is provided, default to the current date.
`;

export async function parseVoiceToAppointment(transcript: string): Promise<ParsedAppointmentData> {
  if (!transcript.trim()) {
    throw new Error("Empty transcript");
  }

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview", // Fast and capable of reasoning
      contents: transcript,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patientName: { type: Type.STRING, nullable: true },
            dateStr: { type: Type.STRING, nullable: true },
            timeStr: { type: Type.STRING, nullable: true },
            durationMinutes: { type: Type.INTEGER },
            reason: { type: Type.STRING, nullable: true },
            consultantName: { type: Type.STRING, nullable: true },
            ambiguities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
          },
          required: ["durationMinutes", "ambiguities"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ParsedAppointmentData;
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    // Return a safe fallback to prevent app crash
    return {
      patientName: null,
      dateStr: new Date().toISOString().split('T')[0],
      timeStr: null,
      durationMinutes: 30,
      reason: null,
      consultantName: null,
      ambiguities: ["parsing_failed"],
    };
  }
}