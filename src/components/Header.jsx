import React from 'react';

const Header = ({ title, subtitle }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 px-8 py-5 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> System Live
        </span>
      </div>
    </header>
  );
};

export default Header;