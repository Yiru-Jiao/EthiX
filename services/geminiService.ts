
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResearcherRole, Scenario } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

// Unified Schema: Scenario + Outcomes for choices
const scenarioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, catchy title for the ethical dilemma." },
    description: { type: Type.STRING, description: "The detailed narrative of the situation. It must be subtle, not obvious misconduct." },
    context: { type: Type.STRING, description: "Brief context regarding the specific research environment or pressure." },
    navigatorSpeaking: { type: Type.STRING, description: "A brief, 1-sentence tip from a neutral navigator/guide in the target language. Warn if stats are low." },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "The action the user can take." },
          outcome: {
            type: Type.OBJECT,
            properties: {
              outcomeTitle: { type: Type.STRING, description: "Short title of what happened." },
              outcomeDescription: { type: Type.STRING, description: "Narrative description of the immediate result." },
              integrityScoreChange: { type: Type.INTEGER, description: "Impact on Research Integrity (-10 to +10)." },
              careerScoreChange: { type: Type.INTEGER, description: "Impact on Career Standing (-10 to +10)." },
              rigorScoreChange: { type: Type.INTEGER, description: "Impact on Scientific Rigor/Quality (-10 to +10)." },
              collaborationScoreChange: { type: Type.INTEGER, description: "Impact on Collaboration/Trust (-10 to +10)." },
              wellbeingScoreChange: { type: Type.INTEGER, description: "Impact on Wellbeing/Mental Health (-10 to +10)." },
              longTermImplication: { type: Type.STRING, description: "Potential future consequences (positive or negative)." },
              actionableStrategy: { type: Type.STRING, description: "Advice on how to handle this situation professionally." },
              openSciencePrinciple: { type: Type.STRING, description: "Which Open Science principle is relevant here." },
              navigatorSpeaking: { type: Type.STRING, description: "A brief, 1-sentence reaction from the navigator about the result." }
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

// Diversity Constraints to avoid repetition
const PRESSURE_SOURCES = [
  "A demanding supervisor or senior Principal Investigator",
  "A direct competitor in the same research field",
  "A prestigious journal's reviewer or editor",
  "A looming grant deadline or funding agency requirement",
  "A close colleague or friend asking for a favor",
  "Personal financial anxiety or career instability",
  "The media, public attention, or university PR department",
  "A difficult collaborative partner from another institution"
];

const DILEMMA_TYPES = [
  "A subtle 'gray area' interpretation of data points",
  "A conflict between personal loyalty and professional truth",
  "A resource scarcity issue (lack of time, funding, or equipment)",
  "Witnessing subtle misconduct by a superior",
  "A complex authorship or credit dispute",
  "Pressure to cut corners to meet a deadline",
  "Navigating bureaucratic barriers vs scientific efficiency"
];

export const generateScenario = async (
  role: ResearcherRole, 
  turnCount: number, 
  language: string,
  currentStats: any,
  topicId: string,
  previousContext?: string
): Promise<Scenario> => {
  
  let specificGuidance = "";

  // Set guidance based on provided topic
  switch(topicId) {
      case 'plagiarism': specificGuidance = "Focus on micro-plagiarism, mosaic plagiarism, improper paraphrasing, or self-plagiarism."; break;
      case 'authorship': specificGuidance = "Focus on disputes about gift authorship, ghost authorship, credit order, or acknowledgement."; break;
      case 'data': specificGuidance = "Focus on data cleaning vs manipulation, p-hacking, image enhancement, or selective reporting."; break;
      case 'coi': specificGuidance = "Focus on undisclosed financial conflicts, personal relationships, or reviewing a competitor/friend."; break;
      case 'peer_review': specificGuidance = "Focus on breaching confidentiality, stealing ideas during review, or biased reviewing."; break;
      case 'mentorship': specificGuidance = "Focus on power dynamics, harassment, exploitation of juniors, or lack of supervision."; break;
      case 'collaboration': specificGuidance = "Focus on international partnerships, cultural differences in ethics, or ownership of shared ideas."; break;
      case 'open_science': specificGuidance = "Focus on pressure to not share data, fear of scooping, or hiding negative results."; break;
      default: specificGuidance = "Focus on a subtle ethical dilemma in general research integrity.";
  }

  // Randomize Constraints for Diversity
  const pressure = PRESSURE_SOURCES[Math.floor(Math.random() * PRESSURE_SOURCES.length)];
  const dilemma = DILEMMA_TYPES[Math.floor(Math.random() * DILEMMA_TYPES.length)];

  const prompt = `
    Generate a realistic, subtle research integrity scenario for a ${role}. 
    Turn number: ${turnCount}.
    Language: ${language}.
    Current Stats: ${JSON.stringify(currentStats)}.
    
    CRITICAL INSTRUCTION: 
    1. Primary Focus Topic: ${topicId}
    2. Source of External Pressure: ${pressure}
    3. Type of Ethical Dilemma: ${dilemma}
    
    Specific Topic Guidance: ${specificGuidance}

    IMPORTANT: Provide ALL content (including 'navigatorSpeaking' and 'outcome' details) in ${language}.

    The scenario should focus on "grey areas" and subtle pressures in academia.
    
    For 'navigatorSpeaking' (Scenario Level):
    - If Turn 1: Briefly explain that the chart shows their professional balance.
    - If any stat < 40: Give a critical warning about that specific risk.
    - Otherwise: Give a general tip about trade-offs related to the current scenario topic.

    Provide 3 distinct choices. For EACH choice, you MUST pre-calculate the outcome in the 'outcome' object:
    1. The "Easy/Passive" path (often leads to lower integrity but might save time/stress).
    2. The "Aggressive/Self-serving" path (might boost career short term but hurts collaboration/rigor).
    3. The "Strategic/Ethical" path (balanced, open science approach, might be harder or slower).
    
    Evaluate the outcomes for each choice based on:
    - Integrity (Ethical conduct)
    - Career (Prestige, funding)
    - Rigor (Quality, reproducibility)
    - Collaboration (Trust, team)
    - Wellbeing (Mental health, stress)
    Assign score changes (-10 to +10) for EACH dimension in the outcome.

    ${previousContext ? `Previous context/outcome to build upon: ${previousContext}` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scenarioSchema,
        temperature: 0.85 
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Scenario;
    }
    throw new Error("No text response from Gemini");
  } catch (error) {
    console.error("Error generating scenario:", error);
    // Fallback scenario in case of API failure
    return {
      title: "Connection Error",
      description: "We couldn't reach the AI simulation engine. Please check your connection.",
      context: "System Error",
      choices: [
        { 
          id: "retry", 
          text: "Retry Connection",
          outcome: {
            outcomeTitle: "System Offline",
            outcomeDescription: "Please check your internet connection and try again.",
            integrityScoreChange: 0, careerScoreChange: 0, rigorScoreChange: 0, collaborationScoreChange: 0, wellbeingScoreChange: 0,
            longTermImplication: "None", actionableStrategy: "Refresh the page.", openSciencePrinciple: "N/A", navigatorSpeaking: "System offline."
          }
        }
      ],
      navigatorSpeaking: "System is offline."
    };
  }
};
