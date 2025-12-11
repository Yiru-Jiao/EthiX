
import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { ResearcherRole, Scenario } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

// Unified Schema: Scenario + Outcomes for choices
const scenarioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Short, punchy title." },
    description: { type: Type.STRING, description: "Concise narrative (max 3 sentences)." },
    context: { type: Type.STRING, description: "Very brief context (1 sentence)." },
    navigatorSpeaking: { type: Type.STRING, description: "Brief 1-sentence tip." },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "Action text." },
          outcome: {
            type: Type.OBJECT,
            properties: {
              outcomeTitle: { type: Type.STRING, description: "Short result title." },
              outcomeDescription: { type: Type.STRING, description: "Result description." },
              integrityScoreChange: { type: Type.INTEGER },
              careerScoreChange: { type: Type.INTEGER },
              rigorScoreChange: { type: Type.INTEGER },
              collaborationScoreChange: { type: Type.INTEGER },
              wellbeingScoreChange: { type: Type.INTEGER },
              longTermImplication: { type: Type.STRING },
              actionableStrategy: { type: Type.STRING },
              openSciencePrinciple: { type: Type.STRING },
              navigatorSpeaking: { type: Type.STRING }
            },
            required: [
              "outcomeTitle", "outcomeDescription", 
              "integrityScoreChange", "careerScoreChange", "rigorScoreChange", "collaborationScoreChange", "wellbeingScoreChange",
              "longTermImplication", "actionableStrategy", "openSciencePrinciple", "navigatorSpeaking"
            ]
          }
        },
        required: ["id", "text", "outcome"]
      }
    }
  },
  required: ["title", "description", "context", "choices", "navigatorSpeaking"]
};

// Batch schema wrapper
const batchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scenarios: {
      type: Type.ARRAY,
      items: scenarioSchema
    }
  },
  required: ["scenarios"]
};

// Advisor Schema
const adviceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    analysis: { type: Type.STRING, description: "Concise ethical analysis (2-3 sentences max)." },
    strategy: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 3-5 distinct, concrete, actionable steps." 
    },
    riskAssessment: { type: Type.STRING, description: "Brief assessment of risks if mishandled." },
    references: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 2-3 specific guidelines (e.g., COPE Flowcharts, ICMJE authorship, GDPR) or principles applicable here." 
    }
  },
  required: ["analysis", "strategy", "riskAssessment", "references"]
};

export interface AdviceResult {
  analysis: string;
  strategy: string[];
  riskAssessment: string;
  references: string[];
}

// Diversity Constraints to avoid repetition
const PRESSURE_SOURCES = [
  "A demanding supervisor",
  "A direct competitor",
  "A journal reviewer",
  "A grant deadline",
  "A close colleague",
  "Financial anxiety",
  "Public attention",
  "A difficult partner",
  "Visa/Immigration status",
  "Media scrutiny",
  "Departmental politics",
  "Family emergency",
  "Equipment failure",
  "Data storage crash"
];

const DILEMMA_TYPES = [
  "Gray area data interpretation",
  "Loyalty vs Truth",
  "Resource scarcity",
  "Witnessing misconduct",
  "Authorship dispute",
  "Deadline pressure",
  "Bureaucracy vs Efficiency",
  "Reproducibility failure",
  "Reviewer bias",
  "Plagiarism suspicion",
  "Harassment/Power abuse",
  "Open Data non-compliance"
];

const getRandomConstraint = () => {
  return {
    pressure: PRESSURE_SOURCES[Math.floor(Math.random() * PRESSURE_SOURCES.length)],
    dilemma: DILEMMA_TYPES[Math.floor(Math.random() * DILEMMA_TYPES.length)]
  };
};

export const generateScenario = async (
  role: ResearcherRole, 
  turnCount: number, 
  language: string,
  currentStats: any,
  topicId: string,
  avoidTitles: string[] = []
): Promise<Scenario> => {
  
  const { pressure, dilemma } = getRandomConstraint();
  
  const avoidInstruction = avoidTitles.length > 0 
    ? `IMPORTANT: Do NOT generate scenarios with these titles or similar storylines: ${avoidTitles.slice(-15).join(', ')}.`
    : '';

  const prompt = `
    Generate a research integrity scenario for a ${role}. 
    Turn: ${turnCount}. Language: ${language}.
    Stats: ${JSON.stringify(currentStats)}.
    
    Topic: ${topicId}
    Pressure: ${pressure}
    Dilemma: ${dilemma}

    ${avoidInstruction}

    IMPORTANT: Treat this as a standalone EPISODE in a career.
    Keep descriptions CONCISE and PUNCHY.
    Provide 3 choices. For EACH, pre-calculate the outcome/stats impacts (-10 to +10).
    
    Outcome logic:
    1. Easy/Passive (Low Integrity, High Convenience)
    2. Aggressive (High Career, Low Collab/Rigor)
    3. Ethical (High Integrity, Difficult/Slow)

    Output JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scenarioSchema,
        temperature: 0.95 // High temperature for diversity
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Scenario;
    }
    throw new Error("No text response from Gemini");
  } catch (error) {
    console.error("Error generating scenario:", error);
    return getFallbackScenario();
  }
};

export interface BatchRequest {
  role: ResearcherRole;
  turn: number;
  topic: string;
  currentStats: any;
}

export const generateScenarioBatch = async (
  requests: BatchRequest[],
  language: string,
  avoidTitles: string[] = []
): Promise<Record<number, Scenario>> => {
  
  if (requests.length === 0) return {};

  const avoidInstruction = avoidTitles.length > 0 
    ? `GLOBAL NEGATIVE CONSTRAINT: Do NOT repeat titles or themes from: ${avoidTitles.slice(-15).join(', ')}`
    : '';

  const prompt = `
    Generate ${requests.length} distinct research integrity scenarios.
    Output a JSON object with a "scenarios" array containing the results in order.
    Language: ${language}.
    
    ${avoidInstruction}

    ${requests.map((req, i) => {
      const constraints = getRandomConstraint();
      return `
        ITEM ${i + 1}:
        Role: ${req.role}
        Turn: ${req.turn}
        Topic: ${req.topic}
        Stats: ${JSON.stringify(req.currentStats)}
        Pressure: ${constraints.pressure}
        Dilemma: ${constraints.dilemma}
      `;
    }).join('\n')}

    GLOBAL RULES:
    - Each scenario must be unique and specific to its Topic.
    - Ensure scenarios in this batch are DISTINCT from each other.
    - Treat each as an episode.
    - Provide 3 choices per scenario with calculated outcomes.
    - Keep concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: batchSchema,
        temperature: 0.95 // High temperature for batch diversity
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      if (parsed.scenarios && Array.isArray(parsed.scenarios)) {
        const result: Record<number, Scenario> = {};
        parsed.scenarios.forEach((scen: Scenario, idx: number) => {
          if (idx < requests.length) {
            result[requests[idx].turn] = scen;
          }
        });
        return result;
      }
    }
    throw new Error("Invalid batch response format");
  } catch (error) {
    console.error("Error generating batch:", error);
    return {};
  }
};

// --- Advisor Chat Session ---

export class AdvisorSession {
  private chat: Chat;

  constructor() {
    this.chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        temperature: 0.7,
        systemInstruction: "You are an expert Research Integrity Officer and professional mentor. Your goal is to provide actionable, ethical, and supportive guidance to researchers facing dilemmas."
      }
    });
  }

  async startAnalysis(situation: string, role: string, language: string): Promise<AdviceResult> {
    const prompt = `
    User Role: ${role}
    Language: ${language}
    Situation: "${situation}"

    Please provide a structured response:
    1. Analysis: A very brief summary of the ethical core of the issue.
    2. Strategy: A list of 3-5 distinct, concrete, actionable steps the user should take immediately. Be prescriptive.
    3. Risk Assessment: A concise warning about what happens if they ignore the issue or handle it poorly.
    4. References: A list of 2-3 specific guidelines (e.g., COPE Flowcharts, ICMJE authorship, GDPR) or principles applicable here.

    Tone: Supportive but direct and actionable.
    `;

    try {
      const response = await this.chat.sendMessage({
        message: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: adviceSchema
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as AdviceResult;
      }
      throw new Error("No advice generated");
    } catch (error) {
      console.error("Error generating advice:", error);
      throw error;
    }
  }

  async sendFollowUp(message: string): Promise<string> {
    try {
      // Explicitly instruct the model to switch to conversational mode
      const prompt = `
        [SYSTEM INSTRUCTION: Switch to CONVERSATIONAL MODE]
        User's Follow-up: "${message}"

        Guidelines for response:
        1. Be concise (approx. 3-4 sentences). Do NOT generate a long report.
        2. Keep a supportive, mentor-like tone.
        3. Address the specific follow-up question directly.
        4. Use plain text or simple markdown (e.g., **bold**) for emphasis if needed.
      `;

      const response = await this.chat.sendMessage({
        message: prompt,
        // Ensure no schema restriction for free-text conversation
        config: {
           responseMimeType: "text/plain",
           responseSchema: undefined
        } 
      });
      return response.text || "I couldn't generate a response.";
    } catch (error) {
      console.error("Error in follow-up:", error);
      throw error;
    }
  }
}

const getFallbackScenario = (): Scenario => ({
  title: "Connection Interrupted",
  description: "We couldn't generate the next simulation segment.",
  context: "Network Error",
  choices: [
    { 
      id: "retry", 
      text: "Retry Connection",
      outcome: {
        outcomeTitle: "System Offline",
        outcomeDescription: "Please check internet.",
        integrityScoreChange: 0, careerScoreChange: 0, rigorScoreChange: 0, collaborationScoreChange: 0, wellbeingScoreChange: 0,
        longTermImplication: "None", actionableStrategy: "Refresh.", openSciencePrinciple: "N/A", navigatorSpeaking: "System offline."
      }
    }
  ],
  navigatorSpeaking: "System is offline."
});
