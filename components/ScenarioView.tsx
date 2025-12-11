
import React from 'react';
import { Scenario, ScenarioChoice } from '../types';

interface ScenarioViewProps {
  scenario: Scenario;
  onMakeChoice: (choice: ScenarioChoice) => void;
  isEvaluating: boolean;
}

const ScenarioView: React.FC<ScenarioViewProps> = ({ scenario, onMakeChoice, isEvaluating }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide">
            Decision Point
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{scenario.title}</h2>
        </div>

        <div className="prose prose-slate max-w-none mb-8">
          <p className="text-lg text-slate-700 leading-relaxed">
            {scenario.description}
          </p>
          <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-400 mt-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase mb-1">Context</h4>
            <p className="text-sm text-slate-600 italic">
              {scenario.context}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            How do you respond?
          </h3>
          {scenario.choices.map((choice) => (
            <button
              key={choice.id}
              disabled={isEvaluating}
              onClick={() => onMakeChoice(choice)}
              className={`w-full text-left p-5 rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 flex items-start group ${
                isEvaluating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-500 mr-4 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-slate-800 font-medium group-hover:text-indigo-900">
                {choice.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenarioView;
