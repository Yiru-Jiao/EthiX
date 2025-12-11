
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import StatsPanel from './components/StatsPanel';
import IntroView from './components/IntroView';
import TopicSelectionView from './components/TopicSelectionView';
import ScenarioView from './components/ScenarioView';
import FeedbackView from './components/FeedbackView';
import WelcomeView from './components/WelcomeView';
import AdvisorView from './components/AdvisorView';
import RoundLoadingView from './components/RoundLoadingView';
import { GamePhase, ResearcherRole, Scenario, Feedback, ScenarioChoice } from './types';
import { generateScenarioBatch, BatchRequest } from './services/geminiService';
import { ScenarioLibrary } from './services/scenarioLibrary';

const TURNS_PER_ROUND = 5;
const STORAGE_KEY = 'integrity_quest_save_v2'; 

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.WELCOME);
  const [previousPhase, setPreviousPhase] = useState<GamePhase>(GamePhase.WELCOME);
  
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
  const seenTitlesRef = useRef<Set<string>>(new Set<string>());

  const [loading, setLoading] = useState(false); // General UI loading (evaluating choices)
  const [loadingRoundNumber, setLoadingRoundNumber] = useState<number | null>(null); // Specific Round Generation Loading state
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

  // --- SCROLL HANDLING ---
  // Automatically scroll to top on phase/turn changes to guide user focus to new content
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase, loadingRoundNumber, turn]);

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
    if (phase === GamePhase.ADVISOR || phase === GamePhase.WELCOME) return;
    
    const gameState = {
      phase, role, turn, language, selectedTopics,
      stats: getStatsObject(),
      currentScenario, currentFeedback,
      pastTitles: Array.from(seenTitlesRef.current)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    setHasSavedGame(true);
  }, [phase, role, turn, language, selectedTopics, getStatsObject, currentScenario, currentFeedback]);


  // --- BATCH ROUND GENERATION ---
  
  const prepareRound = useCallback(async (startTurn: number, topics: string[]) => {
    const endTurn = startTurn + TURNS_PER_ROUND - 1;
    const batchRequests: BatchRequest[] = [];
    const seenArray = Array.from(seenTitlesRef.current) as string[];

    console.log(`[Round] Preparing Round: Turns ${startTurn} to ${endTurn}`);

    // Check Library and Buffer for all turns in the round
    for (let t = startTurn; t <= endTurn; t++) {
      if (scenarioBuffer[t]) continue; // Already in buffer

      const topic = getTopicForTurn(t, topics);
      const cached = ScenarioLibrary.getRandom(role, topic, language, seenArray);
      
      if (cached) {
         setScenarioBuffer(prev => ({ ...prev, [t]: cached }));
      } else {
         batchRequests.push({
           role,
           turn: t,
           topic,
           currentStats: getStatsObject()
         });
      }
    }

    if (batchRequests.length === 0) return;

    try {
      // Execute Batch Request
      // We do not set loading state here; it is controlled by the caller (proceedToTurn) to prevent UI flicker
      // Artificial delay for better UX pacing if it's too fast
      await new Promise(r => setTimeout(r, 1500)); 
      
      const results = await generateScenarioBatch(batchRequests, language, seenArray);
      
      setScenarioBuffer(prev => ({ ...prev, ...results }));
      
      // Save to library
      Object.entries(results).forEach(([t, scen]) => {
         const req = batchRequests.find(r => r.turn === Number(t));
         if (req) {
            ScenarioLibrary.add(role, req.topic, scen, language);
         }
      });
    } catch (e) {
      console.error("Round generation failed", e);
      setError("Connection interrupted. Please try again.");
    }
  }, [scenarioBuffer, role, language, getTopicForTurn, getStatsObject]);


  // --- MAIN FLOW ---

  const proceedToTurn = async (targetTurn: number, topics: string[] = selectedTopics) => {
    // 1. Check if we already have the content
    if (scenarioBuffer[targetTurn]) {
        console.log(`[Flow] Instant transition to Turn ${targetTurn}`);
        setLoading(true); // Short UI transition
        
        const s = scenarioBuffer[targetTurn];
        setCurrentScenario(s);
        seenTitlesRef.current.add(s.title);
        
        // Cleanup buffer to free memory
        setScenarioBuffer(prev => {
            const next = { ...prev };
            delete next[targetTurn];
            return next;
        });

        setTurn(targetTurn);
        setPhase(GamePhase.SCENARIO);
        setLoading(false);
        return;
    }

    // 2. Buffer Miss -> We need to generate the round containing this turn.
    const roundStart = Math.floor((targetTurn - 1) / TURNS_PER_ROUND) * TURNS_PER_ROUND + 1;
    const targetRoundNumber = Math.floor((targetTurn - 1) / TURNS_PER_ROUND) + 1;

    setLoadingRoundNumber(targetRoundNumber); // Trigger Loading View

    await prepareRound(roundStart, topics);
    
    // 3. State update to trigger the Effect below
    // We update 'turn' now. The Effect will see (turn matches buffer) and switch phase.
    setTurn(targetTurn);
  };
  
  // Watcher to transition from Round Generation to Gameplay
  useEffect(() => {
    if (loadingRoundNumber !== null && scenarioBuffer[turn]) {
       const s = scenarioBuffer[turn];
       setCurrentScenario(s);
       seenTitlesRef.current.add(s.title);
       
       // Cleanup buffer
       setScenarioBuffer(prev => {
          const next = { ...prev };
          delete next[turn];
          return next;
       });
       
       setLoadingRoundNumber(null); // Hide Loading View
       setPhase(GamePhase.SCENARIO);
    }
  }, [scenarioBuffer, turn, loadingRoundNumber]);


  const startGame = async (topics: string[]) => {
    setIntegrityScore(50); setCareerScore(50); setRigorScore(50); 
    setCollaborationScore(50); setWellbeingScore(50);
    setError(null);
    setScenarioBuffer({});
    seenTitlesRef.current.clear(); // Reset diversity tracking for new game
    
    localStorage.removeItem(STORAGE_KEY);
    setHasSavedGame(false);
    
    setTurn(1);
    await proceedToTurn(1, topics);
  };

  const handleChoice = (choice: ScenarioChoice) => {
    if (!currentScenario) return;
    
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
    // If we just finished the last turn of a round (e.g. 5, 10, 15)
    if (turn % TURNS_PER_ROUND === 0) {
      setPhase(GamePhase.GAME_OVER); // Show Round Summary
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
    else if (phase === GamePhase.ADVISOR) setPhase(previousPhase);
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
          
          // Restore seen titles to maintain diversity constraints
          if (s.pastTitles && Array.isArray(s.pastTitles)) {
             seenTitlesRef.current = new Set(s.pastTitles);
          } else if (s.currentScenario) {
             seenTitlesRef.current.add(s.currentScenario.title);
          }
          
          setPhase(s.phase);
      }
  };

  const confirmExit = (shouldSave: boolean) => {
    if (shouldSave) saveProgress();
    else { localStorage.removeItem(STORAGE_KEY); setHasSavedGame(false); }
    setShowExitModal(false); setPhase(GamePhase.INTRO);
  };

  const handleOpenAdvisor = () => {
    if (phase !== GamePhase.ADVISOR) {
      setPreviousPhase(phase);
      setPhase(GamePhase.ADVISOR);
    }
  };
  
  const handleCloseAdvisor = () => {
    setPhase(previousPhase);
  };

  const currentRoundMaxTurns = Math.ceil(turn / TURNS_PER_ROUND) * TURNS_PER_ROUND;
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 relative">
      <Header 
        gameActive={phase === GamePhase.SCENARIO || phase === GamePhase.FEEDBACK}
        onExit={handleSaveAndExit}
        onLogoClick={handleLogoClick}
        onOpenAdvisor={phase !== GamePhase.ADVISOR ? handleOpenAdvisor : undefined}
      />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">Error: {error}</div>}

        {phase === GamePhase.WELCOME && (
          <WelcomeView onEnter={handleEnterLab} onOpenAdvisor={handleOpenAdvisor} />
        )}
        
        {phase === GamePhase.ADVISOR && (
          <AdvisorView 
            onBack={handleCloseAdvisor} 
            role={role} 
            language={language}
          />
        )}

        {phase === GamePhase.INTRO && (
          <IntroView 
            onRoleSelect={handleRoleSelect} onResume={handleResume}
            hasSavedGame={hasSavedGame} onLanguageChange={setLanguage} currentLanguage={language}
          />
        )}
        {phase === GamePhase.TOPIC_SELECTION && (
          <TopicSelectionView role={role} onConfirm={handleTopicsConfirmed} onBack={handleBackToRole} />
        )}

        {/* LOADING STATES */}
        {loadingRoundNumber !== null && (
           <RoundLoadingView role={role} roundNumber={loadingRoundNumber} topics={selectedTopics} />
        )}

        {loadingRoundNumber === null && phase === GamePhase.LOADING && (
          <div className="flex flex-col items-center justify-center flex-grow h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-lg font-medium text-slate-600">Loading scenario...</p>
          </div>
        )}

        {/* GAMEPLAY */}
        {loadingRoundNumber === null && (phase === GamePhase.SCENARIO || phase === GamePhase.FEEDBACK) && (
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
          <div className="max-w-4xl mx-auto text-center py-8 animate-fade-in">
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
                    {integrityScore > 80 && rigorScore > 70 ? "Excellent dedication to Open Science. You've built strong trust within the community." : integrityScore > 50 ? "You are maintaining a delicate balance. Watch out for shortcuts that might compromise your long-term reputation." : "Your strategy prioritizes short-term gains over stability. Consider refocusing on Integrity to avoid future crises."}
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
