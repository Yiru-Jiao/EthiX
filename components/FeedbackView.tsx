
import React from 'react';
import { Feedback } from '../types';

interface FeedbackViewProps {
  feedback: Feedback;
  onNext: () => void;
  isLoading: boolean;
}

const ScoreChangeBadge: React.FC<{ label: string; change: number }> = ({ label, change }) => {
  if (change === 0) return null;
  const isPositive = change > 0;
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
      isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {label} {isPositive ? '+' : ''}{change}
    </span>
  );
};

const FeedbackView: React.FC<FeedbackViewProps> = ({ feedback, onNext, isLoading }) => {
  const { 
    integrityScoreChange, 
    careerScoreChange,
    rigorScoreChange,
    collaborationScoreChange,
    wellbeingScoreChange
  } = feedback;

  const totalImpact = integrityScoreChange + careerScoreChange + rigorScoreChange + collaborationScoreChange + wellbeingScoreChange;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
      <div className={`h-2 w-full ${totalImpact >= 0 ? 'bg-indigo-500' : 'bg-orange-500'}`} />
      
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{feedback.outcomeTitle}</h2>
          <div className="flex flex-wrap gap-2">
            <ScoreChangeBadge label="Integrity" change={integrityScoreChange} />
            <ScoreChangeBadge label="Career" change={careerScoreChange} />
            <ScoreChangeBadge label="Rigor" change={rigorScoreChange} />
            <ScoreChangeBadge label="Collaboration" change={collaborationScoreChange} />
            <ScoreChangeBadge label="Wellbeing" change={wellbeingScoreChange} />
          </div>
        </div>

        <p className="text-lg text-slate-700 mb-8">
          {feedback.outcomeDescription}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase mb-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Actionable Strategy
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {feedback.actionableStrategy}
            </p>
          </div>
          
          <div className="bg-orange-50 p-5 rounded-lg border border-orange-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-orange-900 uppercase mb-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Long Term Impact
            </h4>
            <p className="text-sm text-orange-800 italic leading-relaxed">
                "{feedback.longTermImplication}"
            </p>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100 mb-8">
          <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-900 uppercase mb-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Open Science Principle
          </h4>
          <p className="text-sm text-indigo-800 leading-relaxed">
            {feedback.openSciencePrinciple}
          </p>
        </div>

        <button
          onClick={onNext}
          className="w-full py-4 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 active:scale-[0.99] transform duration-100"
        >
          {isLoading ? "Loading Next Challenge..." : "Continue Journey"}
        </button>
      </div>
    </div>
  );
};

export default FeedbackView;
