
import React, { useState } from 'react';
import { ResearcherRole } from '../types';

interface TopicSelectionViewProps {
  role: ResearcherRole;
  onConfirm: (topics: string[]) => void;
  onBack: () => void;
}

const AVAILABLE_TOPICS = [
  { id: 'plagiarism', label: 'Plagiarism & Citation', desc: 'Micro-plagiarism, self-plagiarism, and proper attribution.' },
  { id: 'authorship', label: 'Authorship & Credit', desc: 'Gift/ghost authorship and contribution disputes.' },
  { id: 'data', label: 'Data Management', desc: 'Fabrication, falsification, p-hacking, and image manipulation.' },
  { id: 'coi', label: 'Conflicts of Interest', desc: 'Financial, personal, and professional conflicts.' },
  { id: 'peer_review', label: 'Peer Review Ethics', desc: 'Confidentiality, bias, and reviewer responsibilities.' },
  { id: 'mentorship', label: 'Power Dynamics', desc: 'Mentorship abuse, harassment, and lab culture.' },
  { id: 'collaboration', label: 'Collaboration', desc: 'International partnerships and ownership of ideas.' },
  { id: 'open_science', label: 'Open Science Practices', desc: 'Pre-registration, data sharing, and transparency.' },
];

const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({ role, onConfirm, onBack }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleTopic = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === AVAILABLE_TOPICS.length) {
      setSelected([]);
    } else {
      setSelected(AVAILABLE_TOPICS.map(t => t.id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
      <div className="mb-8 text-center">
        <button 
          onClick={onBack}
          className="mb-4 text-slate-500 hover:text-indigo-600 font-medium text-sm flex items-center justify-center gap-2 mx-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Role Selection
        </button>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
          Tailor Your Simulation
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          As a <strong>{role}</strong>, which areas of research integrity concern you the most? 
          Select the topics you wish to explore in this session.
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <button 
          onClick={handleSelectAll}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
        >
          {selected.length === AVAILABLE_TOPICS.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {AVAILABLE_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => toggleTopic(topic.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              selected.includes(topic.id)
                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                 selected.includes(topic.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'
              }`}>
                {selected.includes(topic.id) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${selected.includes(topic.id) ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {topic.label}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {topic.desc}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => onConfirm(selected)}
          disabled={selected.length === 0}
          className="px-10 py-4 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Begin Simulation
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
      {selected.length === 0 && (
        <p className="text-center text-slate-400 text-sm mt-4">Please select at least one topic to continue.</p>
      )}
    </div>
  );
};

export default TopicSelectionView;
