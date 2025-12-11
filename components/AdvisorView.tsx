
import React, { useState, useRef, useEffect } from 'react';
import { AdviceResult, AdvisorSession } from '../services/geminiService';
import { ResearcherRole } from '../types';

interface AdvisorViewProps {
  onBack: () => void;
  role: ResearcherRole;
  language: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

// Simple text formatter to handle bold markdown from AI
const FormattedText = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

const AdvisorView: React.FC<AdvisorViewProps> = ({ onBack, role: initialRole, language }) => {
  const [situation, setSituation] = useState('');
  const [selectedRole, setSelectedRole] = useState<ResearcherRole>(initialRole);
  
  const [result, setResult] = useState<AdviceResult | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<AdvisorSession | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when chat history changes
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, result]);

  const handleAnalyze = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      // Initialize new session for fresh context
      sessionRef.current = new AdvisorSession();
      const advice = await sessionRef.current.startAnalysis(situation, selectedRole, language);
      setResult(advice);
    } catch (e) {
      setError("Unable to generate analysis at this time. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || !sessionRef.current) return;

    const userMsg = followUpInput;
    setFollowUpInput('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await sessionRef.current.sendFollowUp(userMsg);
      setChatHistory(prev => [...prev, { sender: 'ai', text: response }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSituation('');
    setError(null);
    setChatHistory([]);
    setFollowUpInput('');
    sessionRef.current = null;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="mb-3 text-slate-500 hover:text-indigo-600 font-medium text-sm flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <span className="text-3xl">🧭</span> Navigator Portal
          </h2>
          <p className="text-slate-600 mt-2 text-lg">
             Confidential, AI-powered guidance for your real-world research dilemmas.
          </p>
        </div>
      </div>

      {!result ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
          <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3">
             <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <div className="text-sm text-indigo-800">
               <p className="font-bold mb-1">Confidentiality Notice</p>
               <p>Your input is processed by AI to generate advice. While we do not store your specific query, please avoid including sensitive personal data (names, specific grant IDs) to ensure complete privacy.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                Your Perspective
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as ResearcherRole)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-8 font-medium"
                >
                  {Object.values(ResearcherRole).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Adjust this if the situation involves a different role.</p>
            </div>
            
            <div className="col-span-1 md:col-span-2">
               <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                Describe the situation
              </label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder={`e.g., "I discovered a mistake in a paper published two years ago, but my supervisor says it's minor and we shouldn't issue a correction..."`}
                className="w-full h-48 p-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-slate-800 placeholder:text-slate-400 text-base"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || !situation.trim()}
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Generate Action Plan
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </>
              )}
            </button>
          </div>
          {error && <p className="mt-4 text-red-600 text-sm font-bold text-center">{error}</p>}
        </div>
      ) : (
        <div className="animate-fade-in space-y-8">
           {/* Results Display */}
           <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
             <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Action Plan Ready
                </h3>
                <button 
                  onClick={handleReset}
                  className="text-indigo-100 hover:text-white text-sm font-medium underline decoration-indigo-300 hover:decoration-white underline-offset-4"
                >
                  New Analysis
                </button>
             </div>
             
             <div className="p-6 md:p-8 space-y-8">
               
               {/* Summary */}
               <section className="bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-500">
                 <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
                   Ethical Core
                 </h4>
                 <p className="text-slate-900 font-medium text-lg leading-relaxed">
                   {result.analysis}
                 </p>
               </section>

               {/* Action Steps - The Hero Section */}
               <section>
                 <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">
                   <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">✓</span>
                   Recommended Actions
                 </h4>
                 <div className="space-y-4">
                   {result.strategy.map((step, idx) => (
                     <div key={idx} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-200 hover:shadow-emerald-50 transition-all">
                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
                         {idx + 1}
                       </div>
                       <p className="text-slate-800 leading-relaxed pt-1">
                         {step}
                       </p>
                     </div>
                   ))}
                 </div>
               </section>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                 <section>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">
                      Risk Assessment
                    </h4>
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-orange-900 text-sm leading-relaxed">
                      {result.riskAssessment}
                    </div>
                 </section>

                 <section>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Relevant Guidelines
                    </h4>
                    <ul className="space-y-2">
                      {result.references.map((ref, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-indigo-700 bg-indigo-50/50 p-2 rounded hover:bg-indigo-50 transition-colors">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          {ref}
                        </li>
                      ))}
                    </ul>
                 </section>
               </div>
             </div>
           </div>
           
           {/* Discussion Section */}
           <div className="border-t-2 border-slate-100 pt-8 mt-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <span className="text-2xl">💬</span> Discuss Strategy
              </h3>
              
              <div className="space-y-6 mb-6">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-slate-900 text-white rounded-2xl rounded-br-none' 
                        : 'bg-indigo-50/80 border border-indigo-100 text-slate-800 rounded-2xl rounded-bl-none'
                    }`}>
                      <FormattedText text={msg.text} />
                    </div>
                  </div>
                ))}
                {chatLoading && (
                   <div className="flex justify-start">
                     <div className="bg-indigo-50/50 border border-slate-100 rounded-2xl rounded-bl-none p-4 flex gap-1.5 items-center h-12">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                     </div>
                   </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleFollowUpSubmit} className="relative">
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-full shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 placeholder:text-slate-400"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={!followUpInput.trim() || chatLoading}
                  className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
           </div>
           
           <div className="text-center max-w-2xl mx-auto pt-8">
             <p className="text-xs text-slate-400">
               Disclaimer: This tool generates guidance based on AI patterns and general ethical principles. It is not a substitute for legal advice or official institutional proceedings.
             </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorView;
