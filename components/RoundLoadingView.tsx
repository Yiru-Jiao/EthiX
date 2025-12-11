
import React, { useEffect, useState, useRef } from 'react';
import { ResearcherRole } from '../types';

interface RoundLoadingViewProps {
  role: ResearcherRole;
  roundNumber: number;
  topics: string[];
}

const RoundLoadingView: React.FC<RoundLoadingViewProps> = ({ role, roundNumber, topics }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const activeStepRef = useRef<HTMLDivElement>(null);

  const steps = [
    `Initializing Phase ${roundNumber} Environment`,
    "Analyzing Ethical Parameters",
    "Synthesizing Career Dilemmas",
    "Projecting Long-term Consequences",
    "Finalizing Simulation Data"
  ];

  useEffect(() => {
    // Cycle through steps every 1.2 seconds to simulate progress
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [steps.length]);

  // Automatically scroll the active step into the center of the view
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-fade-in px-4 py-12">
      {/* Animated Icon */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute inset-2 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-indigo-200">
          <svg className="w-10 h-10 text-indigo-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      </div>

      <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
        Preparing Round {roundNumber}
      </h2>
      <p className="text-slate-500 font-medium mb-10 max-w-md">
        Simulating your upcoming career path as a <span className="text-indigo-600 font-bold">{role}</span>...
      </p>

      {/* Progress Steps */}
      <div className="w-full max-w-md space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index}
            ref={index === currentStep ? activeStepRef : null}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 border-2 ${
              index === currentStep 
                ? 'bg-white border-indigo-100 shadow-lg scale-105 opacity-100 z-10'
                : index < currentStep 
                   ? 'bg-slate-50 border-transparent opacity-60 scale-95 grayscale' 
                   : 'bg-transparent border-transparent opacity-30 scale-90 translate-y-2'
            }`}
          >
             <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all duration-500 ${
               index < currentStep 
                 ? 'bg-emerald-500 border-emerald-500 text-white scale-100' 
                 : index === currentStep 
                    ? 'border-indigo-600 border-t-transparent animate-spin bg-white' 
                    : 'border-slate-300 bg-slate-100'
             }`}>
               {index < currentStep && (
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                 </svg>
               )}
             </div>
             
             <span className={`text-base font-bold text-left transition-colors duration-300 ${
               index === currentStep ? 'text-indigo-900' : 'text-slate-500'
             }`}>
               {step}
             </span>
          </div>
        ))}
      </div>
      
      {/* Topics Badge */}
      <div className="mt-12 flex flex-wrap justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 py-1">Parameters:</span>
        {topics.slice(0, 3).map(t => (
          <span key={t} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] uppercase font-bold rounded shadow-sm">
            {t}
          </span>
        ))}
        {topics.length > 3 && (
          <span className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] uppercase font-bold rounded shadow-sm">
            +{topics.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
};

export default RoundLoadingView;
