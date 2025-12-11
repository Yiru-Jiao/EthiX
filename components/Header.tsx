
import React from 'react';

interface HeaderProps {
  gameActive?: boolean;
  onExit?: () => void;
  onLogoClick?: () => void;
  onOpenAdvisor?: () => void;
}

const Header: React.FC<HeaderProps> = ({ gameActive, onExit, onLogoClick, onOpenAdvisor }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none group"
          aria-label="Return to home"
        >
          {/* Logo Icon: Compass representing Navigation/Guidance */}
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-indigo-100 rounded-full scale-110 group-hover:scale-125 transition-transform duration-300"></div>
            <div className="relative w-full h-full text-indigo-600 group-hover:rotate-45 transition-transform duration-500 ease-in-out">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
            Ethi<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">X</span>
          </h1>
        </button>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 items-center">
             {onOpenAdvisor && (
               <button 
                 onClick={onOpenAdvisor}
                 className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100"
               >
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                 </svg>
                 AI Advisor
               </button>
             )}
            <a 
              href="https://www.cos.io/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Open Science
            </a>
            <a 
              href="https://publicationethics.org/guidance" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Resources
            </a>
            <a 
              href="https://unesdoc.unesco.org/ark:/48223/pf0000379949" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              About
            </a>
          </nav>

          {gameActive && onExit && (
            <button 
              onClick={onExit}
              className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors border border-slate-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save & Exit
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
