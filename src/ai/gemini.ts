import { GoogleGenAI } from "@google/genai";

let defaultAi: GoogleGenAI | null = null;

export const initGemini = (customKey?: string) => {
  if (customKey) {
    return new GoogleGenAI({ apiKey: customKey });
  }
  
  if (!defaultAi) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      defaultAi = new GoogleGenAI({ apiKey });
    }
  }
  return defaultAi;
};

export const askController = async (question: string, context: any, customKey?: string) => {
  const gemini = initGemini(customKey);
  if (!gemini) {
    return { response: "AI reasoning temporarily unavailable. Please configure GEMINI_API_KEY to use the Ask Controller feature." };
  }

  const systemInstruction = `You are the AI Finance Controller for Predator.
You process synthetic merchant CSVs and help a finance team reconcile payments.
The deterministic Python/TypeScript engine has already computed exact matching, batch aggregation, cash position, GST/TDS, and 7-day projections.

NON-NEGOTIABLE RULES:
- Do NOT perform arithmetic, reconciliation totals, cash calculations, or match-rate calculations yourself. Rely purely on the Context provided.
- Never ask the user to pay, add a credit card, or use live APIs. This is a zero-cost local system.
- Be concise, audit-friendly, and professional. Prefer clear, factual wording over marketing language.
- Use only the provided context. Do not fabricate missing fields.
- COMPLIANCE CONTEXT: Use these as reference-only (RBI payment settlement transparency, GST reconciliation and GSTR-2B vs books discrepancy, TDS screening). If uncertain, say: "Verify against the latest official regulatory notification before production use."`;

  const response = await gemini.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `${systemInstruction}\n\nContext from Deterministic Engine:\n${JSON.stringify(context).substring(0, 50000)}\n\nUser Question: ${question}`
  });
  
  return { response: response.text };
};

export const classifyException = async (exception: any, customKey?: string) => {
  const gemini = initGemini(customKey);
  if (!gemini) {
    return { 
      probableCause: "Unknown (AI unavailable)",
      recommendedAction: "manual_review",
      confidence: 0,
      reasoning: "AI reasoning temporarily unavailable. Deterministic reconciliation completed successfully." 
    };
  }
  
  const prompt = `You are an AI Finance Controller interpreting unresolved or ambiguous exceptions.
The deterministic Python/TypeScript engine has already done the matching.
Do not invent numbers. Do not change amounts. Do not override deterministic reconciliation.

If given a list of exception records, do the following:
1. Classify probable cause.
2. Assign confidence from 0 to 1.
3. Recommend one action (auto_resolve, manual_review, escalate). If ambiguous, choose manual_review.
4. Explain the reasoning in one to three sentences. Be concise, audit-friendly, and professional.

OUTPUT RULES:
When asked to classify exceptions, return valid JSON only.
Use this exact shape:
{
  "exceptions": [
    {
      "id": "EXC_001",
      "type": "Amount_Mismatch",
      "transaction_id": "TXN_082",
      "probable_cause": "Unexplained settlement shortfall",
      "confidence": 0.99,
      "action": "manual_review",
      "reasoning": "The books and settlement amounts differ materially and no fee explanation is present."
    }
  ],
  "summary": "Processed exceptions."
}
Do not wrap JSON in markdown. Do not add commentary outside JSON.

Records to classify:
[${JSON.stringify(exception)}]`;

  const response = await gemini.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.1
    }
  });
  
  try {
    const text = response.text?.trim() || "{}";
    const parsed = JSON.parse(text.replace(/^\s*```json/i, '').replace(/```\s*$/, ''));
    
    if (parsed.exceptions && parsed.exceptions.length > 0) {
      const ex = parsed.exceptions[0];
      return {
        probableCause: ex.probable_cause || "Requires review",
        confidence: Math.round((ex.confidence || 0) * 100),
        recommendedAction: ex.action || "manual_review",
        reasoning: ex.reasoning || "Analyzed by AI Controller."
      };
    }
    throw new Error("Invalid format");
  } catch (err) {
    return {
      probableCause: "AI Parse Error",
      confidence: 0,
      recommendedAction: "manual_review",
      reasoning: "AI returned invalid structured output. Manual review required."
    };
  }
};
