
export enum GamePhase {
  WELCOME = 'WELCOME',
  INTRO = 'INTRO',
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  LOADING = 'LOADING',
  SCENARIO = 'SCENARIO',
  FEEDBACK = 'FEEDBACK',
  GAME_OVER = 'GAME_OVER'
}

export enum ResearcherRole {
  PHD_STUDENT = 'PhD Student',
  POSTDOC = 'Postdoctoral Researcher',
  LAB_TECH = 'Lab Technician',
  PRINCIPAL_INVESTIGATOR = 'Principal Investigator',
  FULL_PROFESSOR = 'Full Professor (Large Team)',
  EDITOR_CHAIR = 'Journal Editor / Conference Chair'
}

export interface ScenarioChoice {
  id: string;
  text: string;
}

export interface Scenario {
  title: string;
  description: string;
  context: string; // The "open science" context or background
  choices: ScenarioChoice[];
  navigatorSpeaking: string; // Dynamic tip in selected language (formerly mentorSpeaking)
}

export interface Feedback {
  outcomeTitle: string;
  outcomeDescription: string;
  // Metrics changes
  integrityScoreChange: number; // -10 to 10
  careerScoreChange: number; // -10 to 10
  rigorScoreChange: number; // -10 to 10 (Scientific Quality)
  collaborationScoreChange: number; // -10 to 10 (Trust/Network)
  wellbeingScoreChange: number; // -10 to 10 (Mental Health/Burnout)
  
  longTermImplication: string;
  actionableStrategy: string; // What should have been done or what to do next
  openSciencePrinciple: string; // Connection to open science
  navigatorSpeaking: string; // Dynamic reaction in selected language (formerly mentorSpeaking)
}

export interface GameState {
  role: ResearcherRole;
  turn: number;
  language: string;
  selectedTopics: string[];
  stats: {
    integrity: number;
    career: number;
    rigor: number;
    collaboration: number;
    wellbeing: number;
  };
  history: {
    scenario: Scenario;
    choiceId: string;
    feedback: Feedback;
  }[];
}
