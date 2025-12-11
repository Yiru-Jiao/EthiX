import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-8 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        <div className="mb-4">
          <p className="text-sm font-bold text-slate-900">
            © {new Date().getFullYear()} EthiX
          </p>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">
            Powered by Gemini 2.5
          </p>
        </div>

        <div className="max-w-2xl bg-white/50 rounded-lg p-4 border border-slate-100">
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            <span className="font-bold text-indigo-700">Open for Educational & Scientific Use:</span> This application and its content are available for reuse, adaptation, and further development for non-profit educational and scientific purposes, conditioned on providing proper reference to the original author.
          </p>
          <div className="w-16 h-px bg-slate-200 mx-auto my-3"></div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">Commercial Use:</span> Commercial use is <span className="underline decoration-indigo-200">permitted</span>, provided that proper reference is given and communication is established with the author.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;