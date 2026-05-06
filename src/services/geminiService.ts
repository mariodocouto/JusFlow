import { GoogleGenAI } from "@google/genai";
import { Qualification } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeLeadViability(answers: Record<string, string>): Promise<Partial<Qualification>> {
  if (!process.env.GEMINI_API_KEY) return { analysis: "Chave API não configurada." };

  const prompt = `Analise as seguintes respostas de um lead jurídico trabalhista no Brasil e determine a viabilidade jurídica do caso, classificação (hot, warm, cold) e um resumo estratégico.
  
  Respostas:
  ${JSON.stringify(answers, null, 2)}
  
  Responda APENAS em JSON com o seguinte formato:
  {
    "score": 0 a 100,
    "classification": "hot" | "warm" | "cold",
    "analysis": "string com análise resumida",
    "isViable": boolean
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return { analysis: "Erro ao processar análise inteligente." };
  }
}

export async function summarizeConversation(interactions: any[]): Promise<string> {
  if (!process.env.GEMINI_API_KEY) return "Histórico indisponível";

  const history = interactions.map(i => `[${i.type}] ${i.content}`).join('\n');
  const prompt = `Resuma de forma executiva e jurídica o seguinte histórico de conversas com o lead:\n\n${history}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text?.trim() || "Resumo não gerado.";
  } catch (error) {
    return "Erro ao gerar resumo.";
  }
}
