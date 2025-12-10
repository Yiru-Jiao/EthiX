
import React, { useState } from 'react';
import { ResearcherRole } from '../types';

interface IntroViewProps {
  onRoleSelect: (role: ResearcherRole) => void;
  onResume?: () => void;
  hasSavedGame?: boolean;
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
}

const LANGUAGES = [
  "English",
  "Chinese (Simplified)",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Portuguese"
];

const IntroView: React.FC<IntroViewProps> = ({ 
  onRoleSelect, 
  onResume, 
  hasSavedGame, 
  onLanguageChange, 
  currentLanguage 
}) => {
  const [isCustomLang, setIsCustomLang] = useState(!LANGUAGES.includes(currentLanguage));

  const handlePresetLanguage = (lang: string) => {
    setIsCustomLang(false);
    onLanguageChange(lang);
  };

  const handleCustomLanguage = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLanguageChange(e.target.value);
  };

  const handleOtherClick = () => {
    setIsCustomLang(true);
    // Clear the language so the input box isn't pre-filled
    onLanguageChange('');
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
       {/* Background Elements (Consistent with Welcome, but subtler) */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Choose Your Perspective
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Research integrity looks different depending on where you sit. 
            Select a role to explore the unique pressures and ethical trade-offs experienced at different career stages.
          </p>
        </div>

        {/* Language Selection Card */}
        <div className="max-w-2xl mx-auto mb-10 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-indigo-50 shadow-sm animate-fade-in">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
            Simulation Language
          </label>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handlePresetLanguage(lang)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  !isCustomLang && currentLanguage === lang
                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {lang}
              </button>
            ))}
            <button
              onClick={handleOtherClick}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                isCustomLang
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              Other (please specify)
            </button>
          </div>
          
          {isCustomLang && (
            <div className="max-w-xs mx-auto animate-fade-in">
               <input 
                 type="text" 
                 placeholder="Type language..." 
                 value={currentLanguage}
                 onChange={handleCustomLanguage}
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center font-medium text-slate-800"
                 autoFocus
               />
            </div>
          )}
        </div>

        {hasSavedGame && onResume && (
          <div className="max-w-md mx-auto mb-12 animate-fade-in">
            <button 
              onClick={onResume}
              className="w-full group relative overflow-hidden bg-white p-1 rounded-2xl shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
               <div className="relative px-6 py-4 flex items-center justify-between">
                 <div className="text-left">
                   <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Resume Journey</h3>
                   <p className="text-xs text-slate-500">Continue where you left off</p>
                 </div>
                 <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                 </div>
               </div>
            </button>
            <div className="text-center mt-6 mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Or Start New Simulation</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in animation-delay-2000">
          {[
            { 
              role: ResearcherRole.PHD_STUDENT, 
              title: "PhD Student",
              desc: "Challenge: Balancing the need for supervisor guidance with the development of your own independent scientific voice and standards.",
              icon: "🎓",
              color: "hover:border-emerald-400 hover:shadow-emerald-100"
            },
            { 
              role: ResearcherRole.POSTDOC, 
              title: "Postdoc",
              desc: "Challenge: Producing high-impact work to secure a permanent career while adhering to rigorous methodological standards.",
              icon: "🔬",
              color: "hover:border-blue-400 hover:shadow-blue-100"
            },
            { 
              role: ResearcherRole.LAB_TECH, 
              title: "Lab Technician",
              desc: "Challenge: Ensuring data accuracy and equipment reliability while navigating hierarchical instructions that may conflict with best practices.",
              icon: "🧪",
              color: "hover:border-violet-400 hover:shadow-violet-100"
            },
            { 
              role: ResearcherRole.PRINCIPAL_INVESTIGATOR, 
              title: "Principal Investigator",
              desc: "Challenge: Sustaining the lab's funding and reputation while fostering a culture of honesty and supporting team wellbeing.",
              icon: "🏛️",
              color: "hover:border-amber-400 hover:shadow-amber-100"
            },
            { 
              role: ResearcherRole.FULL_PROFESSOR, 
              title: "Full Professor",
              desc: "Challenge: Managing a sprawling research empire and complex grants while maintaining oversight to prevent misconduct in a large team.",
              icon: "🌍",
              color: "hover:border-indigo-400 hover:shadow-indigo-100"
            },
            { 
              role: ResearcherRole.EDITOR_CHAIR, 
              title: "Editor / Chair",
              desc: "Challenge: Acting as a gatekeeper of science, detecting misconduct in submissions, and handling conflicts of interest impartially.",
              icon: "⚖️",
              color: "hover:border-pink-400 hover:shadow-pink-100"
            },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => onRoleSelect(item.role)}
              className={`group relative flex flex-col items-start p-6 bg-white/60 backdrop-blur-sm border-2 border-slate-200 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-left ${item.color}`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="text-3xl bg-white p-2 rounded-lg shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {item.title}
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroView;
