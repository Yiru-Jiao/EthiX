
import React from 'react';

interface WelcomeViewProps {
  onEnter: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onEnter }) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden bg-slate-50">
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-pink-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 text-center max-w-5xl mx-auto">
        
        {/* Logo Icon Large */}
        <div className="mb-8 relative group">
           <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
           <div className="relative p-6 bg-white rounded-full shadow-2xl border border-indigo-50 transform group-hover:rotate-12 transition-transform duration-700 ease-in-out">
             <svg className="w-20 h-20 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
             </svg>
           </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
          Ethi<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative inline-block">X
            <svg className="absolute -top-4 -right-6 w-8 h-8 text-pink-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zm0 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 17zm10-5a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0120 12zM4 12a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 014 12zm11.314-7.071a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.061a.75.75 0 011.061 0zm-8.486 8.485a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.061a.75.75 0 011.061 0zM16.375 16.375a.75.75 0 01-1.06 0l-1.061-1.06a.75.75 0 111.06-1.061l1.061 1.06a.75.75 0 010 1.061zM6.88 6.88a.75.75 0 01-1.06 0l-1.061-1.06a.75.75 0 111.06-1.061l1.061 1.06a.75.75 0 010 1.06z"/></svg>
          </span>
        </h1>
        
        <p className="text-xl md:text-3xl text-slate-600 font-medium mb-10 max-w-4xl leading-relaxed">
           Research is complex. 
           <br className="hidden md:block"/> 
           <span className="text-indigo-900 font-semibold">Navigate the trade-offs</span> in a safe, simulated environment designed to build your confidence and awareness.
        </p>

        {/* Feature Cards / Stats visualization */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-4xl mb-12">
           {[
             { label: 'Integrity', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '🛡️' },
             { label: 'Career', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', icon: '🚀' },
             { label: 'Rigor', color: 'bg-violet-500', bg: 'bg-violet-50', text: 'text-violet-700', icon: '🔬' },
             { label: 'Collab', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', icon: '🤝' },
             { label: 'Wellbeing', color: 'bg-pink-500', bg: 'bg-pink-50', text: 'text-pink-700', icon: '🧘' }
           ].map(stat => (
             <div key={stat.label} className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center text-2xl mb-3`}>
                  {stat.icon}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${stat.text}`}>{stat.label}</span>
             </div>
           ))}
        </div>

        <button 
          onClick={onEnter}
          className="group relative px-10 py-5 bg-slate-900 text-white text-xl font-bold rounded-2xl overflow-hidden shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10 flex items-center gap-3">
            Enter Simulation
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>

        <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest opacity-60">
          Powered by Gemini 2.5
        </p>
      </div>
    </div>
  );
};

export default WelcomeView;
