import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { searchExamples } from '../../data/dashboardData.jsx';

export default function AICommandBar() {
  const [index, setIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Cycle through placeholder text
  useEffect(() => {
    if (isFocused || inputValue) return;
    
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % searchExamples.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isFocused, inputValue]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-xl hidden md:block">
      <div className={`relative flex items-center transition-all duration-300 rounded-2xl border ${
        isFocused 
          ? 'bg-black/60 border-gold/50 shadow-[0_0_20px_rgba(214,168,58,0.15)] ring-2 ring-gold/10' 
          : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
      }`}>
        <div className="pl-4 pr-2 py-3 text-zinc-500">
          <Search size={18} className={isFocused ? 'text-gold transition-colors' : ''} />
        </div>
        
        <div className="relative flex-1 h-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent border-none outline-none text-sm text-white py-3 pr-12 z-10"
          />
          
          {/* Animated Placeholder */}
          {!inputValue && !isFocused && (
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-zinc-500 whitespace-nowrap"
                >
                  {searchExamples[index]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-bold text-zinc-400 bg-white/10 rounded border border-white/10">⌘</kbd>
          <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-bold text-zinc-400 bg-white/10 rounded border border-white/10">K</kbd>
        </div>
      </div>

      {/* Dropdown Results (Mock) */}
      <AnimatePresence>
        {isFocused && inputValue && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-panel overflow-hidden z-50 backdrop-blur-3xl"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">AI Suggestions</div>
              <button className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-white flex items-center gap-2 group transition-colors">
                <Search size={14} className="text-zinc-500 group-hover:text-gold" />
                Analyze "{inputValue}" against AI/ML Engineer requirements
              </button>
              <button className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-white flex items-center gap-2 group transition-colors">
                <Search size={14} className="text-zinc-500 group-hover:text-gold" />
                Find roadmap steps related to "{inputValue}"
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
