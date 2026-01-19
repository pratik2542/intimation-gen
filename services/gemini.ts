import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GUJARATI_RANGE_REGEX = /[\u0A80-\u0AFF]/;

export const parseMessageToData = async (text: string): Promise<ExtractedData> => {
  const prompt = `
    Analyze the following text which contains insurance claim intimation details. 
    Extract the specific details into a JSON object.
    
    The text usually follows a format like:
    Policy Number
    Insured Name
    Patient Name (or 'Self')
    Disease/Diagnosis
    Date of Admission (DOA)
    Mobile Number
    Doctor and Hospital Details

    Input Text:
    """
    ${text}
    """

    Rules:
    1. If Patient Name contains a relation (e.g., "Namitaben ~ Wife"), separate the Name ("Namitaben") and Relation ("Wife").
    2. If Patient Name is "Self", treat 'Self' as the patient name and leave relation empty or null.
    3. Clean up the dates to DD/MM/YYYY format if possible.
    4. Capture multi-line hospital details into a single string for 'doctorHospital'.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          policyNo: { type: Type.STRING },
          insuredName: { type: Type.STRING },
          patientName: { type: Type.STRING },
          patientRelation: { type: Type.STRING, nullable: true },
          doa: { type: Type.STRING },
          disease: { type: Type.STRING },
          mobile: { type: Type.STRING },
          doctorHospital: { type: Type.STRING },
        },
        required: ["policyNo", "insuredName", "doa", "disease"],
      },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as ExtractedData;
  }
  
  throw new Error("Failed to parse data from Gemini");
};

export const translateDiseaseToEnglish = async (diseaseText: string): Promise<string> => {
  const trimmed = (diseaseText ?? '').trim();
  if (!trimmed) return '';

  // If it's not Gujarati, don't change what the user pasted.
  if (!GUJARATI_RANGE_REGEX.test(trimmed)) return trimmed;

  const prompt = `Translate the following Gujarati disease/diagnosis into concise English (medical term).\nReturn ONLY the English translation, with no quotes and no explanation.\n\nText:\n"""\n${trimmed}\n"""`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const out = response.text?.trim();
  if (!out) return trimmed;

  return out.replace(/^['"]|['"]$/g, '').trim();
};