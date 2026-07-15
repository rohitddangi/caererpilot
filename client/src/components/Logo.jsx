import React from 'react';
import { Link } from 'react-router-dom';

export function LogoIcon({ size = "md" }) {
  const containerSizes = {
    sm: "h-9 w-9 p-1.5",
    md: "h-11 w-11 p-2",
    lg: "h-16 w-16 p-3.5",
  };

  return (
    <div className={`relative flex items-center justify-center rounded-full bg-slate-50 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-lg shrink-0 overflow-hidden ${containerSizes[size]}`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 via-transparent to-purple-500/10 rounded-full pointer-events-none" />
      <img 
        src="/logo.png" 
        alt="CareerPilot AI" 
        className="w-full h-full object-contain shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:rotate-6" 
      />
    </div>
  );
}

export default function Logo({ size = "md", subtitle = "Command Center" }) {
  return (
    <Link to="/" className="flex items-center gap-3 group select-none outline-none">
      <LogoIcon size={size} />
      <div className="flex flex-col">
        <span className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 via-zinc-800 to-gold dark:from-white dark:via-zinc-300 dark:to-gold bg-clip-text text-transparent group-hover:opacity-90 transition-all duration-300">
          CareerPilot <span className="text-gold">AI</span>
        </span>
        {subtitle && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 group-hover:text-gold transition-all duration-300">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
