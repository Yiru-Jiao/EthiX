
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import StatsPanel from './components/StatsPanel';
import IntroView from './components/IntroView';
import TopicSelectionView from './components/TopicSelectionView';
import ScenarioView from './components/ScenarioView';
import FeedbackView from './components/FeedbackView';
import WelcomeView from './components/WelcomeView';
import { GamePhase, ResearcherRole, Scenario, Feedback, ScenarioChoice } from './types';
import { generateScenario, generateScenarioBatch, BatchRequest } from './services/geminiService';
import { ScenarioLibrary } from './services/scenarioLibrary';

const TURNS_PER_ROUND = 5;
const STORAGE_KEY = 'integrity_quest_save_v2'; 
const PREFETCH_LOOKAHEAD = 3; // Aggressively fetch next 3 turns

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
  
  // --- BUFFER ---
  const [scenarioBuffer, setScenarioBuffer] = useState<Record<number, Scenario>>({});
  // Track which turns are currently being fetched
  const fetchingTurnsRef = useRef<Set<number>>(new Set());
  // Track seen scenario titles to avoid repetition in current session
  const seenTitlesRef = useRef<Set<string>>(new Set<string>());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setHasSavedGame(true);
    }
    ScenarioLibrary.ensureSeeds();
  }, []);

  const getStatsObject = useCallback(() => ({
    integrity: integrityScore,
    career: careerScore,
    rigor: rigorScore,
    collaboration: collaborationScore,
    wellbeing: wellbeingScore
  }), [integrityScore, careerScore, rigorScore, collaborationScore, wellbeingScore]);

  const getTopicForTurn = useCallback((targetTurn: number, topics: string[]) => {
    if (!topics || topics.length === 0) return "General Research Integrity";
    return topics[(targetTurn - 1) % topics.length];
  }, []);

  const saveProgress = useCallback(() => {
    const gameState = {
      phase, role, turn, language, selectedTopics,
      stats: getStatsObject(),
      currentScenario, currentFeedback,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    setHasSavedGame(true);
  }, [phase, role, turn, language, selectedTopics, getStatsObject, currentScenario, currentFeedback]);

  // --- SMART BATCH PRE-FETCHING ---
  const checkAndPrefetch = useCallback(async (currentTurn: number, topics: string[]) => {
    const currentRoundEnd = Math.ceil(currentTurn / TURNS_PER_ROUND) * TURNS_PER_ROUND;
    const batchRequests: BatchRequest[] = [];
    const neededTurns: number[] = [];
    const seenArray = Array.from(seenTitlesRef.current) as string[];

    // Identify needed turns in the lookahead window
    for (let i = 1; i <= PREFETCH_LOOKAHEAD; i++) {
      const targetTurn = currentTurn + i;
      
      // Stop if we cross into the next round (wait for game over screen)
      if (targetTurn > currentRoundEnd) break;

      // Skip if already buffered or currently fetching
      if (scenarioBuffer[targetTurn] || fetchingTurnsRef.current.has(targetTurn)) continue;

      // Check library first with exclusion
      const topic = getTopicForTurn(targetTurn, topics);
      const cached = ScenarioLibrary.getRandom(role, topic, language, seenArray);
      
      if (cached) {
        console.log(`[Buffer] Loaded Turn ${targetTurn} from Library.`);
        setScenarioBuffer(prev => ({ ...prev, [targetTurn]: cached }));
        // Add to seen so we don't accidentally fetch it again if logic runs weirdly
        // (Though we don't officially 'see' it until it's presented, adding to cache prevents dupes)
      } else {
        // Need to fetch via API
        neededTurns.push(targetTurn);
        batchRequests.push({
          role,
          turn: targetTurn,
          topic,
          currentStats: getStatsObject() // Use current stats as approximation
        });
      }
    }

    if (batchRequests.length === 0) return;

    // Lock turns
    neededTurns.forEach(t => fetchingTurnsRef.current.add(t));
    
    try {
      console.log(`[Buffer] Fetching batch for Turns: ${neededTurns.join(', ')}`);
      // Use batch API for efficiency, passing seen titles to avoid
      const results = await generateScenarioBatch(batchRequests, language, seenArray);
      
      // Update buffer and library
      setScenarioBuffer(prev => ({ ...prev, ...results }));
      Object.entries(results).forEach(([t, scen]) => {
         // Find which topic corresponded to this turn
         const req = batchRequests.find(r => r.turn === Number(t));
         if (req) {
            ScenarioLibrary.add(role, req.topic, scen, language);
         }
      });
      
    } catch (e) {
      console.warn("Batch prefetch failed", e);
    } finally {
      // Unlock turns
      neededTurns.forEach(t => fetchingTurnsRef.current.delete(t));
    }

  }, [scenarioBuffer, role, language, getTopicForTurn, getStatsObject]);

  // Trigger prefetch on appropriate phases
  useEffect(() => {
    // Also run during LOADING to get ahead
    if (phase === GamePhase.SCENARIO || phase === GamePhase.FEEDBACK || phase === GamePhase.LOADING) {
       // Small delay to ensure state settles, but fast enough to start parallel reqs
       const timer = setTimeout(() => {
          checkAndPrefetch(turn, selectedTopics);
       }, 100);
       return () => clearTimeout(timer);
    }
  }, [turn, phase, checkAndPrefetch, selectedTopics]);


  // --- MAIN FLOW ---

  const proceedToTurn = async (targetTurn: number, topics: string[] = selectedTopics) => {
    setLoading(true);
    setTurn(targetTurn);
    setPhase(GamePhase.LOADING);
    
    // 1. Check Buffer (Instant)
    if (scenarioBuffer[targetTurn]) {
        console.log(`[Flow] Instant transition to Turn ${targetTurn}`);
        const s = scenarioBuffer[targetTurn];
        setCurrentScenario(s);
        seenTitlesRef.current.add(s.title);
        
        // Clear used buffer entry
        setScenarioBuffer(prev => {
            const next = { ...prev };
            delete next[targetTurn];
            return next;
        });
        
        setLoading(false);
        setPhase(GamePhase.SCENARIO);
        return;
    }

    // 2. Urgent Fetch (Buffer Miss)
    console.log(`[Flow] Buffer miss for Turn ${targetTurn}. Fetching urgent...`);
    try {
        const topic = getTopicForTurn(targetTurn, topics);
        const seenArray = Array.from(seenTitlesRef.current) as string[];

        // Double check library with exclusions just in case
        const cached = ScenarioLibrary.getRandom(role, topic, language, seenArray);
        if (cached) {
             setCurrentScenario(cached);
             seenTitlesRef.current.add(cached.title);
        } else {
             // Fallback to single generation for the urgent/blocking request
             // Pass seen titles to avoid duplicates
             const scenario = await generateScenario(role, targetTurn, language, getStatsObject(), topic, seenArray);
             setCurrentScenario(scenario);
             seenTitlesRef.current.add(scenario.title);
             ScenarioLibrary.add(role, topic, scenario, language);
        }
        setPhase(GamePhase.SCENARIO);
    } catch (e) {
        setError("Connection failed. Please check your internet.");
        setPhase(GamePhase.INTRO);
    } finally {
        setLoading(false);
    }
  };

  const startGame = async (topics: string[]) => {
    setIntegrityScore(50); setCareerScore(50); setRigorScore(50); 
    setCollaborationScore(50); setWellbeingScore(50);
    setError(null);
    setScenarioBuffer({});
    fetchingTurnsRef.current.clear();
    localStorage.removeItem(STORAGE_KEY);
    setHasSavedGame(false);
    
    // Start urgent fetch for Turn 1
    const p1 = proceedToTurn(1, topics);
    
    // Concurrently start pre-fetching Turn 2, 3, 4 to reduce future latency
    // We pass '1' as current turn so it looks ahead to 2, 3, 4
    checkAndPrefetch(1, topics);

    await p1;
  };

  const handleChoice = (choice: ScenarioChoice) => {
    if (!currentScenario) return;
    
    // Instant Outcome Application
    const fb = choice.outcome;
    const clamp = (val: number) => Math.min(100, Math.max(0, val));
    
    setIntegrityScore(s => clamp(s + (fb.integrityScoreChange || 0)));
    setCareerScore(s => clamp(s + (fb.careerScoreChange || 0)));
    setRigorScore(s => clamp(s + (fb.rigorScoreChange || 0)));
    setCollaborationScore(s => clamp(s + (fb.collaborationScoreChange || 0)));
    setWellbeingScore(s => clamp(s + (fb.wellbeingScoreChange || 0)));

    setCurrentFeedback(fb);
    setPhase(GamePhase.FEEDBACK);
  };

  const handleNextTurn = async () => {
    if (turn % TURNS_PER_ROUND === 0) {
      setPhase(GamePhase.GAME_OVER);
    } else {
      await proceedToTurn(turn + 1);
    }
  };

  const handleContinueJourney = async () => {
     await proceedToTurn(turn + 1);
  };

  // UI Handlers
  const handleRoleSelect = (r: ResearcherRole) => { setRole(r); setPhase(GamePhase.TOPIC_SELECTION); };
  const handleTopicsConfirmed = (t: string[]) => { setSelectedTopics(t); startGame(t); };
  const handleBackToRole = () => setPhase(GamePhase.INTRO);
  const handleEnterLab = () => setPhase(GamePhase.INTRO);
  const handleLogoClick = () => {
    if (phase === GamePhase.SCENARIO || phase === GamePhase.FEEDBACK) setShowExitModal(true);
    else setPhase(GamePhase.WELCOME);
  };
  const handleSaveAndExit = () => { saveProgress(); setPhase(GamePhase.INTRO); };
  const handleRestart = () => setPhase(GamePhase.INTRO);
  
  const handleResume = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
          const s = JSON.parse(saved);
          setRole(s.role); setTurn(s.turn); setLanguage(s.language); setSelectedTopics(s.selectedTopics);
          setIntegrityScore(s.stats.integrity); setCareerScore(s.stats.career);
          setRigorScore(s.stats.rigor); setCollaborationScore(s.stats.collaboration);
          setWellbeingScore(s.stats.wellbeing);
          setCurrentScenario(s.currentScenario); setCurrentFeedback(s.currentFeedback);
          
          // Restore seen titles from loaded scenario if possible, or just add current
          if (s.currentScenario) seenTitlesRef.current.add(s.currentScenario.title);
          
          setPhase(s.phase);
      }
  };

  const confirmExit = (shouldSave: boolean) => {
    if (shouldSave) saveProgress();
    else { localStorage.removeItem(STORAGE_KEY); setHasSavedGame(false); }
    setShowExitModal(false); setPhase(GamePhase.INTRO);
  };

  const currentRoundMaxTurns = Math.ceil(turn / TURNS_PER_ROUND) * TURNS_PER_ROUND;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 relative">
      <Header 
        gameActive={phase === GamePhase.SCENARIO || phase === GamePhase.FEEDBACK}
        onExit={handleSaveAndExit}
        onLogoClick={handleLogoClick}
      />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">Error: {error}</div>}

        {phase === GamePhase.WELCOME && <WelcomeView onEnter={handleEnterLab} />}
        {phase === GamePhase.INTRO && (
          <IntroView 
            onRoleSelect={handleRoleSelect} onResume={handleResume}
            hasSavedGame={hasSavedGame} onLanguageChange={setLanguage} currentLanguage={language}
          />
        )}
        {phase === GamePhase.TOPIC_SELECTION && (
          <TopicSelectionView role={role} onConfirm={handleTopicsConfirmed} onBack={handleBackToRole} />
        )}

        {phase === GamePhase.LOADING && (
          <div className="flex flex-col items-center justify-center flex-grow h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-lg font-medium text-slate-600">Simulating scenario...</p>
          </div>
        )}

        {(phase === GamePhase.SCENARIO || phase === GamePhase.FEEDBACK) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {phase === GamePhase.SCENARIO && currentScenario && (
                <ScenarioView scenario={currentScenario} onMakeChoice={handleChoice} isEvaluating={loading} />
              )}
              {phase === GamePhase.FEEDBACK && currentFeedback && (
                <FeedbackView feedback={currentFeedback} onNext={handleNextTurn} isLoading={loading} />
              )}
            </div>
            <div className="lg:col-span-1">
              <StatsPanel 
                stats={getStatsObject()} turn={turn} totalTurns={currentRoundMaxTurns} role={role}
                navigatorMessage={phase === GamePhase.SCENARIO ? currentScenario?.navigatorSpeaking : currentFeedback?.navigatorSpeaking}
              />
            </div>
          </div>
        )}

        {phase === GamePhase.GAME_OVER && (
          <div className="max-w-4xl mx-auto text-center py-8">
             <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                <div className="mb-6">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">Milestone Reached</span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Round {Math.floor(turn / TURNS_PER_ROUND)} Complete</h2>
                </div>
                {/* Stats Grid */}
                <div className="grid grid-cols-5 gap-2 mb-8 max-w-2xl mx-auto">
                   {[{ l: 'Integrity', v: integrityScore, c: 'text-emerald-600' }, { l: 'Career', v: careerScore, c: 'text-blue-600' }, { l: 'Rigor', v: rigorScore, c: 'text-violet-600' }, { l: 'Collab', v: collaborationScore, c: 'text-amber-600' }, { l: 'Wellbeing', v: wellbeingScore, c: 'text-pink-600' }].map((s) => (
                     <div key={s.l} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                       <div className={`text-2xl font-bold ${s.c} mb-1`}>{s.v}%</div>
                       <div className="text-[10px] font-bold text-slate-500 uppercase truncate">{s.l}</div>
                     </div>
                   ))}
                </div>
                {/* Insight */}
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-8 text-left max-w-2xl mx-auto">
                  <h3 className="font-bold text-indigo-900 mb-2">Navigator's Insight</h3>
                  <p className="text-indigo-800 text-sm leading-relaxed">
                    {integrityScore > 80 && rigorScore > 70 ? "Excellent dedication to Open Science. You've built strong trust." : integrityScore > 50 ? "You are maintaining a delicate balance. Watch out for shortcuts." : "Your strategy prioritizes short-term gains over stability. Consider refocusing on Integrity."}
                  </p>
                </div>
                {/* Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <button onClick={handleContinueJourney} className="py-4 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex flex-col items-center justify-center group"><span className="flex items-center gap-2">Continue Journey <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></span></button>
                    <button onClick={handleSaveAndExit} className="py-4 px-6 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all flex flex-col items-center justify-center">Save & Exit</button>
                    <button onClick={handleRestart} className="py-4 px-6 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-red-50 hover:text-red-700 transition-all flex flex-col items-center justify-center">Start New Career</button>
                </div>
             </div>
          </div>
        )}
      </main>

      <Footer />
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Leave current game?</h3>
            <div className="flex flex-col gap-3 mt-6">
              <button onClick={() => confirmExit(true)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors">Save & Exit</button>
              <button onClick={() => confirmExit(false)} className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-red-600 font-bold rounded-lg">Exit without Saving</button>
              <button onClick={() => setShowExitModal(false)} className="w-full py-2 text-slate-500 font-medium hover:text-slate-800 mt-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
