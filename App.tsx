import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import IntroView from './components/IntroView';
import TopicSelectionView from './components/TopicSelectionView';
import ScenarioView from './components/ScenarioView';
import FeedbackView from './components/FeedbackView';
import WelcomeView from './components/WelcomeView';
import { GamePhase, ResearcherRole, Scenario, Feedback, ScenarioChoice } from './types';
import { generateScenario, evaluateDecision } from './services/geminiService';
import { ScenarioLibrary } from './services/scenarioLibrary';

const TURNS_PER_ROUND = 5;
const STORAGE_KEY = 'integrity_quest_save_v2'; 

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.WELCOME);
  const [role, setRole] = useState<ResearcherRole>(ResearcherRole.PHD_STUDENT);
  const [turn, setTurn] = useState(1);
  const [language, setLanguage] = useState<string>('English');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Stats
  const [integrityScore, setIntegrityScore] = useState(50);
  const [careerScore, setCareerScore] = useState(50);
  const [rigorScore, setRigorScore] = useState(50);
  const [collaborationScore, setCollaborationScore] = useState(50);
  const [wellbeingScore, setWellbeingScore] = useState(50);
  
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  
  // Buffer for the NEXT scenario to speed up transitions
  const [nextScenarioBuffer, setNextScenarioBuffer] = useState<Scenario | null>(null);
  const prefetchStartedRef = useRef<number | null>(null); // Tracks which turn we are currently prefetching to avoid duplicates

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Check for saved game on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setHasSavedGame(true);
    }
  }, []);

  const getStatsObject = useCallback(() => ({
    integrity: integrityScore,
    career: careerScore,
    rigor: rigorScore,
    collaboration: collaborationScore,
    wellbeing: wellbeingScore
  }), [integrityScore, careerScore, rigorScore, collaborationScore, wellbeingScore]);

  // Helper to determine topic based on turn
  const getTopicForTurn = useCallback((targetTurn: number, topics: string[]) => {
    if (!topics || topics.length === 0) return "General Research Integrity";
    return topics[(targetTurn - 1) % topics.length];
  }, []);

  const saveProgress = useCallback(() => {
    const gameState = {
      phase,
      role,
      turn,
      language,
      selectedTopics,
      stats: getStatsObject(),
      currentScenario,
      currentFeedback
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    setHasSavedGame(true);
  }, [phase, role, turn, language, selectedTopics, getStatsObject, currentScenario, currentFeedback]);

  const handleSaveAndExit = () => {
    saveProgress();
    setPhase(GamePhase.INTRO);
  };

  const handleResume = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        setRole(state.role);
        setTurn(state.turn);
        setLanguage(state.language || 'English');
        setSelectedTopics(state.selectedTopics || []);
        
        setIntegrityScore(state.stats?.integrity ?? 50);
        setCareerScore(state.stats?.career ?? 50);
        setRigorScore(state.stats?.rigor ?? 50);
        setCollaborationScore(state.stats?.collaboration ?? 50);
        setWellbeingScore(state.stats?.wellbeing ?? 50);

        setCurrentScenario(state.currentScenario);
        setCurrentFeedback(state.currentFeedback);
        setPhase(state.phase);
      }
    } catch (e) {
      console.error("Failed to load save", e);
      setError("Failed to load saved game.");
    }
  };

  const handleLogoClick = () => {
    if (phase === GamePhase.SCENARIO || phase === GamePhase.FEEDBACK) {
      setShowExitModal(true);
    } else {
      setPhase(GamePhase.WELCOME);
    }
  };

  const confirmExit = (shouldSave: boolean) => {
    if (shouldSave) {
      saveProgress();
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedGame(false);
    }
    setShowExitModal(false);
    setPhase(GamePhase.INTRO);
  };

  // Phase 1: User selects Role -> Transition to Topic Selection
  const handleRoleSelect = (selectedRole: ResearcherRole) => {
    setRole(selectedRole);
    setPhase(GamePhase.TOPIC_SELECTION);
  };

  // Phase 2: User confirms topics -> Start Game
  const handleTopicsConfirmed = (topics: string[]) => {
    setSelectedTopics(topics);
    startGame(topics);
  };

  const handleBackToRole = () => {
    setPhase(GamePhase.INTRO);
  };

  const handleEnterLab = () => {
    setPhase(GamePhase.INTRO);
  };

  // --- BACKGROUND GENERATION LOGIC ---
  const triggerBackgroundGeneration = useCallback(async (nextTurn: number, currentStats: any, context?: string) => {
    // Determine the next topic
    const topic = getTopicForTurn(nextTurn, selectedTopics);
    
    // Check if we already have this in buffer or are fetching it
    if (prefetchStartedRef.current === nextTurn) return;
    prefetchStartedRef.current = nextTurn;
    
    console.log(`[Background] Prefetching scenario for Turn ${nextTurn} (Topic: ${topic})...`);

    try {
      // 1. Generate new content "behind the screen"
      const scenario = await generateScenario(role, nextTurn, language, currentStats, topic, context);
      
      // 2. Save to buffer for immediate use
      setNextScenarioBuffer(scenario);
      
      // 3. Accumulatively save to Library for future reuse
      ScenarioLibrary.add(role, topic, scenario);
      
      console.log(`[Background] Scenario for Turn ${nextTurn} ready in buffer.`);
    } catch (e) {
      console.error("[Background] Failed to prefetch scenario", e);
      prefetchStartedRef.current = null; // Reset lock on failure
    }
  }, [role, language, selectedTopics, getTopicForTurn]);

  // --- MAIN LOADING LOGIC ---
  const proceedToTurn = async (targetTurn: number, topics: string[] = selectedTopics) => {
    setLoading(true);
    setTurn(targetTurn);
    setPhase(GamePhase.LOADING);
    
    try {
      // 1. Check Buffer (Fastest - Background generation finished)
      if (nextScenarioBuffer && prefetchStartedRef.current === targetTurn) {
        console.log("[Loader] Using Buffered Scenario (Instant Load)");
        setCurrentScenario(nextScenarioBuffer);
        setNextScenarioBuffer(null);
        prefetchStartedRef.current = null;
        setLoading(false);
        setPhase(GamePhase.SCENARIO);
        return;
      }

      // 2. Check Library (Fast - Reuse existing)
      const topic = getTopicForTurn(targetTurn, topics);
      const cachedScenario = ScenarioLibrary.getRandom(role, topic);
      
      if (cachedScenario) {
        console.log("[Loader] Using Library Scenario (Cached Load)");
        setCurrentScenario(cachedScenario);
        
        // Even if we use cached, trigger background gen to add variety to library for future
        // We do this silently without awaiting
        triggerBackgroundGeneration(targetTurn, getStatsObject(), "Variation generation");

        setLoading(false);
        setPhase(GamePhase.SCENARIO);
        return;
      }

      // 3. Fallback to API (Slow - Fresh generation)
      console.log("[Loader] No buffer/cache. Fetching from API...");
      const context = targetTurn > 1 ? currentFeedback?.longTermImplication : undefined;
      const scenario = await generateScenario(role, targetTurn, language, getStatsObject(), topic, context);
      
      // Save this fresh one to library
      ScenarioLibrary.add(role, topic, scenario);

      setCurrentScenario(scenario);
      setPhase(GamePhase.SCENARIO);
    } catch (e) {
      setError("Failed to generate scenario. Please check connection.");
      setPhase(GamePhase.INTRO); 
    } finally {
      setLoading(false);
    }
  };

  // Initialize game
  const startGame = async (topics: string[]) => {
    setIntegrityScore(50);
    setCareerScore(50);
    setRigorScore(50);
    setCollaborationScore(50);
    setWellbeingScore(50);

    setError(null);
    setNextScenarioBuffer(null);
    prefetchStartedRef.current = null;
    
    localStorage.removeItem(STORAGE_KEY);
    setHasSavedGame(false);

    await proceedToTurn(1, topics);
  };

  const clamp = (val: number) => Math.min(100, Math.max(0, val));

  // Handle User Choice
  const handleChoice = async (choice: ScenarioChoice) => {
    if (!currentScenario) return;

    setLoading(true);
    try {
      const feedback = await evaluateDecision(currentScenario, choice.text, role, language, getStatsObject());
      
      const newIntegrity = clamp(integrityScore + (feedback.integrityScoreChange || 0));
      const newCareer = clamp(careerScore + (feedback.careerScoreChange || 0));
      const newRigor = clamp(rigorScore + (feedback.rigorScoreChange || 0));
      const newCollab = clamp(collaborationScore + (feedback.collaborationScoreChange || 0));
      const newWellbeing = clamp(wellbeingScore + (feedback.wellbeingScoreChange || 0));

      setIntegrityScore(newIntegrity);
      setCareerScore(newCareer);
      setRigorScore(newRigor);
      setCollaborationScore(newCollab);
      setWellbeingScore(newWellbeing);
      
      setCurrentFeedback(feedback);
      setPhase(GamePhase.FEEDBACK);

      // --- CRITICAL OPTIMIZATION: START PREFETCHING NEXT TURN HERE ---
      // We know the new stats. We know the next turn. 
      // Start generating 'behind the screen' while user reads feedback.
      const nextTurn = turn + 1;
      const predictedStats = {
        integrity: newIntegrity,
        career: newCareer,
        rigor: newRigor,
        collaboration: newCollab,
        wellbeing: newWellbeing
      };
      
      // Only prefetch if we haven't hit the round limit
      if (nextTurn % TURNS_PER_ROUND !== 1) { 
         triggerBackgroundGeneration(nextTurn, predictedStats, feedback.longTermImplication);
      }

    } catch (e) {
      setError("Failed to evaluate decision.");
    } finally {
      setLoading(false);
    }
  };

  // Next Turn Logic
  const handleNextTurn = async () => {
    if (turn % TURNS_PER_ROUND === 0) {
      setPhase(GamePhase.GAME_OVER);
      return;
    }
    await proceedToTurn(turn + 1);
  };

  const handleContinueJourney = async () => {
     await proceedToTurn(turn + 1);
  };

  const handleRestart = () => {
    setPhase(GamePhase.INTRO);
  };

  useEffect(() => {
    if (phase === GamePhase.GAME_OVER) {
        saveProgress();
    }
  }, [phase, saveProgress]);

  const currentRoundMaxTurns = Math.ceil(turn / TURNS_PER_ROUND) * TURNS_PER_ROUND;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 relative">
      <Header 
        gameActive={phase === GamePhase.SCENARIO || phase === GamePhase.FEEDBACK}
        onExit={handleSaveAndExit}
        onLogoClick={handleLogoClick}
      />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            Error: {error}
          </div>
        )}

        {phase === GamePhase.WELCOME && (
          <WelcomeView onEnter={handleEnterLab} />
        )}

        {phase === GamePhase.INTRO && (
          <IntroView 
            onRoleSelect={handleRoleSelect} 
            onResume={handleResume}
            hasSavedGame={hasSavedGame}
            onLanguageChange={setLanguage}
            currentLanguage={language}
          />
        )}

        {phase === GamePhase.TOPIC_SELECTION && (
          <TopicSelectionView 
            role={role}
            onConfirm={handleTopicsConfirmed}
            onBack={handleBackToRole}
          />
        )}

        {phase === GamePhase.LOADING && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-lg font-medium text-slate-600">
               {nextScenarioBuffer ? "Finalizing simulation..." : "Creating unique scenario..."}
            </p>
          </div>
        )}

        {(phase === GamePhase.SCENARIO || phase === GamePhase.FEEDBACK) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {phase === GamePhase.SCENARIO && currentScenario && (
                <ScenarioView 
                  scenario={currentScenario} 
                  onMakeChoice={handleChoice} 
                  isEvaluating={loading}
                />
              )}

              {phase === GamePhase.FEEDBACK && currentFeedback && (
                <FeedbackView 
                  feedback={currentFeedback} 
                  onNext={handleNextTurn}
                  isLoading={loading}
                />
              )}
            </div>

            <div className="lg:col-span-1">
              <StatsPanel 
                stats={getStatsObject()}
                turn={turn}
                totalTurns={currentRoundMaxTurns}
                role={role}
                mentorMessage={phase === GamePhase.SCENARIO ? currentScenario?.mentorSpeaking : currentFeedback?.mentorSpeaking}
              />
            </div>
          </div>
        )}

        {phase === GamePhase.GAME_OVER && (
          <div className="max-w-4xl mx-auto text-center py-8">
             <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                <div className="mb-6">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                        Milestone Reached
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
                        Round {Math.floor(turn / TURNS_PER_ROUND)} Complete
                    </h2>
                    <p className="text-slate-600 mt-2">
                        You have navigated {turn} scenarios. Your research profile is taking shape.
                    </p>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-8 max-w-2xl mx-auto">
                   {[
                     { l: 'Integrity', v: integrityScore, c: 'text-emerald-600' },
                     { l: 'Career', v: careerScore, c: 'text-blue-600' },
                     { l: 'Rigor', v: rigorScore, c: 'text-violet-600' },
                     { l: 'Collab', v: collaborationScore, c: 'text-amber-600' },
                     { l: 'Wellbeing', v: wellbeingScore, c: 'text-pink-600' },
                   ].map((s) => (
                     <div key={s.l} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                       <div className={`text-2xl font-bold ${s.c} mb-1`}>{s.v}%</div>
                       <div className="text-[10px] font-bold text-slate-500 uppercase truncate">{s.l}</div>
                     </div>
                   ))}
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-8 text-left max-w-2xl mx-auto">
                  <h3 className="font-bold text-indigo-900 mb-2">Mentor's Note</h3>
                  <p className="text-indigo-800 text-sm leading-relaxed">
                    {integrityScore > 80 && rigorScore > 70
                     ? "Your dedication to Open Science is commendable. You've built a strong foundation of trust and quality. The road ahead may bring more complex challenges to your growing reputation." 
                     : integrityScore > 50 
                       ? "You are maintaining a delicate balance. As your career advances, the temptation to cut corners to save time or resources will likely increase. Stay vigilant."
                       : "Your current trajectory prioritizes short-term gains over long-term stability. This approach is risky. Consider focusing on restoring your Integrity and Rigor in the next phase."
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <button 
                      onClick={handleContinueJourney}
                      className="py-4 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex flex-col items-center justify-center gap-1 group"
                    >
                      <span className="flex items-center gap-2">
                        Continue Journey
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                      <span className="text-xs text-slate-400 font-normal">Next 5 scenarios</span>
                    </button>

                    <button 
                      onClick={handleSaveAndExit}
                      className="py-4 px-6 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all flex flex-col items-center justify-center gap-1"
                    >
                       <span className="flex items-center gap-2">
                         Save & Exit
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                         </svg>
                       </span>
                       <span className="text-xs text-slate-400 font-normal">Resume later</span>
                    </button>

                    <button 
                      onClick={handleRestart}
                      className="py-4 px-6 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all flex flex-col items-center justify-center gap-1"
                    >
                       <span className="flex items-center gap-2">
                         Start New Career
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                         </svg>
                       </span>
                       <span className="text-xs text-slate-400 font-normal">Reset scores</span>
                    </button>
                </div>
             </div>
          </div>
        )}
      </main>

      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Leave current game?</h3>
            <p className="text-slate-600 mb-6">You have an active session. Would you like to save your progress before returning to the main menu?</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => confirmExit(true)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Save & Exit
              </button>
              <button 
                onClick={() => confirmExit(false)}
                className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 font-bold rounded-lg transition-colors"
              >
                Exit without Saving
              </button>
              <button 
                onClick={() => setShowExitModal(false)}
                className="w-full py-2 text-slate-500 font-medium hover:text-slate-800 transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;