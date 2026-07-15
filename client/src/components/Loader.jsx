import React from 'react';
import { motion } from 'framer-motion';
import { LogoIcon } from './Logo.jsx';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="glass rounded-[2rem] bg-black/60 border border-white/10 p-8 flex flex-col items-center justify-center gap-4 text-center max-w-xs shadow-2xl backdrop-blur-xl"
      >
        <div className="relative">
          <LogoIcon size="lg" />
          <div className="absolute -inset-2 rounded-full bg-gold/20 blur-[10px] animate-pulse" />
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-black tracking-wider text-white">CareerPilot <span className="text-gold">AI</span></div>
          <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">AI Career Operating System</div>
        </div>

        <div className="h-0.5 w-24 bg-white/5 rounded-full overflow-hidden mt-2">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-full bg-gradient-to-r from-gold/50 via-gold to-gold/50 w-12 relative rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
