import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResearcherRole, Scenario, Feedback } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

const scenarioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, catchy title for the ethical dilemma." },
    description: { type: Type.STRING, description: "The detailed narrative of the situation. It must be subtle, not obvious misconduct." },
    context: { type: Type.STRING, description: "Brief context about the specific research environment or pressure. Be creative (e.g., 'Late night in the lab', 'Conference in Madrid', 'Zoom call with funders')." },
    mentorSpeaking: { type: Type.STRING, description: "A brief, 1-sentence tip from a mentor in the target language. If turn=1, explain the radar chart tracks balance. If stats are low, warn them." },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "The action the user can take." }
        },
        required: ["id", "text"]
      }
    }
  },
  required: ["title", "description", "context", "choices", "mentorSpeaking"]
};

const feedbackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    outcomeTitle: { type: Type.STRING, description: "Short title of what happened." },
    outcomeDescription: { type: Type.STRING, description: "Narrative description of the immediate result." },
    
    // Score changes
    integrityScoreChange: { type: Type.INTEGER, description: "Impact on Research Integrity (-10 to +10)." },
    careerScoreChange: { type: Type.INTEGER, description: "Impact on Career Standing (-10 to +10)." },
    rigorScoreChange: { type: Type.INTEGER, description: "Impact on Scientific Rigor/Quality (-10 to +10). Does the science suffer?" },
    collaborationScoreChange: { type: Type.INTEGER, description: "Impact on Collaboration/Trust (-10 to +10). Do peers trust you?" },
    wellbeingScoreChange: { type: Type.INTEGER, description: "Impact on Wellbeing/Mental Health (-10 to +10). Is it stressful?" },

    longTermImplication: { type: Type.STRING, description: "Potential future consequences (positive or negative)." },
    actionableStrategy: { type: Type.STRING, description: "Advice on how to handle this situation professionally." },
    openSciencePrinciple: { type: Type.STRING, description: "Which Open Science principle is relevant here (e.g. Transparency, Reproducibility)." },
    mentorSpeaking: { type: Type.STRING, description: "A brief, 1-sentence reaction from a mentor in the target language about the new balance of the researcher." }
  },
  required: [
    "outcomeTitle", "outcomeDescription", 
    "integrityScoreChange", "careerScoreChange", "rigorScoreChange", "collaborationScoreChange", "wellbeingScoreChange",
    "longTermImplication", "actionableStrategy", "openSciencePrinciple", "mentorSpeaking"
  ]
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

  // 2. Randomize Constraints for Diversity
  // We use Math.random() here to ensure each playthrough feels distinct even with same settings
  const pressure = PRESSURE_SOURCES[Math.floor(Math.random() * PRESSURE_SOURCES.length)];
  const dilemma = DILEMMA_TYPES[Math.floor(Math.random() * DILEMMA_TYPES.length)];

  const prompt = `
    Generate a realistic, subtle research integrity scenario for a ${role}. 
    Turn number: ${turnCount}.
    Language: ${language}.
    Current Stats: ${JSON.stringify(currentStats)}.
    
    CRITICAL INSTRUCTION: To ensure a diverse and engaging experience, strictly follow these constraints for this specific turn:
    1. Primary Focus Topic: ${topicId}
    2. Source of External Pressure: ${pressure}
    3. Type of Ethical Dilemma: ${dilemma}
    
    Specific Topic Guidance: ${specificGuidance}

    IMPORTANT: Provide ALL content (including 'mentorSpeaking') in ${language}.

    The scenario should focus on "grey areas" and subtle pressures in academia.
    Do not make it obvious fraud. Make it a difficult social or professional pressure situation.
    
    For 'mentorSpeaking':
    - If Turn 1: Briefly explain that the chart shows their professional balance.
    - If any stat < 40: Give a critical warning about that specific risk.
    - Otherwise: Give a general tip about trade-offs related to the current scenario topic.

    Provide 3 distinct choices:
    1. The "Easy/Passive" path (often leads to lower integrity but might save time/stress).
    2. The "Aggressive/Self-serving" path (might boost career short term but hurts collaboration/rigor).
    3. The "Strategic/Ethical" path (balanced, open science approach, might be harder or slower).
    
    ${previousContext ? `Previous context/outcome to build upon (but pivot to the new constraints): ${previousContext}` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scenarioSchema,
        temperature: 0.85 // Increased temperature for more creativity
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
      description: "We couldn't reach the AI simulation engine. Please check your connection or API key.",
      context: "System Error",
      choices: [{ id: "retry", text: "Retry Connection" }],
      mentorSpeaking: "System is offline."
    };
  }
};

export const evaluateDecision = async (
  scenario: Scenario, 
  choiceText: string, 
  role: ResearcherRole,
  language: string,
  currentStats: any
): Promise<Feedback> => {
  const prompt = `
    Role: ${role}
    Scenario: ${scenario.description}
    User Choice: ${choiceText}
    Language: ${language}
    Stats BEFORE choice: ${JSON.stringify(currentStats)}

    IMPORTANT: Provide the evaluation content fully in ${language}.
    
    Evaluate this choice based on 5 dimensions of academic life:
    1. Research Integrity (Ethical conduct)
    2. Career Standing (Prestige, funding, power)
    3. Scientific Rigor (Methodological quality, reproducibility)
    4. Collaboration (Trust, networking, team morale)
    5. Wellbeing (Stress, burnout, work-life balance)

    Assign score changes (-10 to +10) for EACH dimension.
    
    For 'mentorSpeaking':
    - Provide a short, direct reaction to how this choice affects their stats/balance.
    
    Provide a specific actionable strategy (e.g. "Use reference management software", "Always quote verbatim text").
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: feedbackSchema,
        temperature: 0.7
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Feedback;
    }
    throw new Error("No text response from Gemini");
  } catch (error) {
    console.error("Error evaluating decision:", error);
    return {
      outcomeTitle: "Evaluation Error",
      outcomeDescription: "Could not evaluate choice.",
      integrityScoreChange: 0,
      careerScoreChange: 0,
      rigorScoreChange: 0,
      collaborationScoreChange: 0,
      wellbeingScoreChange: 0,
      longTermImplication: "Unknown",
      actionableStrategy: "Check connection.",
      openSciencePrinciple: "N/A",
      mentorSpeaking: "Error evaluating."
    };
  }
};
