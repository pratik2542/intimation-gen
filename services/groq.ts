import { ExtractedData } from '../types';

export class GroqRequestError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'GroqRequestError';
  }
}

const request = async <Result>(action: 'parse' | 'translate', text: string): Promise<Result> => {
  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, text }),
    signal: AbortSignal.timeout(35_000),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new GroqRequestError(result.error ?? 'Groq request failed.', response.status);
  }
  return result as Result;
};

export const parseMessageToData = (text: string): Promise<ExtractedData> => request('parse', text);

export const translateDiseaseToEnglish = async (text: string): Promise<string> => {
  const trimmed = text.trim();
  if (!/[\u0A80-\u0AFF]/.test(trimmed)) return trimmed;
  const result = await request<{ translation: string }>('translate', trimmed);
  return result.translation;
};