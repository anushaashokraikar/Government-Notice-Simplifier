import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SimplifiedNotice {
  title: string;
  authority: string;
  summary: string;
  simplifiedExplanation: string;
  deadline: string;
  eligibility: string;
  requiredDocuments: string[];
  actionSteps: { title: string; description: string }[];
}

export async function simplifyNotice(content: string, userProfession: string, language: string): Promise<SimplifiedNotice> {
  const prompt = `
    Analyze the following government notice and simplify it for a citizen whose profession is: ${userProfession}.
    The explanation should be in ${language}.
    
    Notice Content:
    ${content}
    
    Provide the response in JSON format matching this schema:
    {
      "title": "Clear and simple title",
      "authority": "Issuing authority name",
      "summary": "One sentence summary what this is about",
      "simplifiedExplanation": "Friendly, plain-language explanation of exactly what this means for the user",
      "deadline": "Key deadline date (e.g. 2025-12-31)",
      "eligibility": "Who is eligible or affected in simple terms",
      "requiredDocuments": ["List of documents needed"],
      "actionSteps": [{ "title": "Step title", "description": "Exactly what to do" }]
    }
    
    CRITICAL: For every document listed in 'requiredDocuments', ensure there is a corresponding 'actionStep' to gather or prepare it. Also include steps for submission and any payments mentioned.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            authority: { type: Type.STRING },
            summary: { type: Type.STRING },
            simplifiedExplanation: { type: Type.STRING },
            deadline: { type: Type.STRING },
            eligibility: { type: Type.STRING },
            requiredDocuments: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionSteps: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  title: { type: Type.STRING }, 
                  description: { type: Type.STRING } 
                },
                required: ["title", "description"]
              } 
            }
          },
          required: ["title", "authority", "summary", "simplifiedExplanation", "deadline", "eligibility", "requiredDocuments", "actionSteps"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function chatAboutNotice(noticeContent: string, userMessage: string, history: { role: 'user' | 'model', text: string }[]) {
  const systemInstruction = `
    You are a government service assistant helping a citizen understand a notice.
    Reference this notice: ${noticeContent}
    Use simple, friendly language. If you don't know something about the notice, be honest.
    Prioritize the citizen's needs and safety.
  `;

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: { systemInstruction }
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
}

export async function chatWithSahaay(userMessage: string, history: { role: 'user' | 'model', text: string }[], context?: string) {
  const systemInstruction = `
    You are Sahaay, an AI Digital Citizen Assistant for India. 
    Your goal is to help citizens navigate government notices, schemes, and services.
    Use "Namaste" as a greeting. Use simple, polite, and official but friendly language.
    ${context ? `Current context: ${context}` : 'You are currently helping with general queries about government processes.'}
    If asked about specific documents or processes not in context, provide general guidance based on common Indian government practices.
  `;

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: { systemInstruction }
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
}
