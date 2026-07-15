import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Briefcase, FileText, Mic, Play, Sparkles, Target } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  ['Resume intelligence', FileText],
  ['Career roadmap AI', Target],
  ['Interview practice', Mic],
  ['Skill gap analysis', Brain],
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden bg-obsidian text-white">
      <div className="particle-field pointer-events-none absolute inset-0 opacity-40" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <div className="inline-block">
          <Logo size="md" subtitle="AI Career OS" />
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="premium-button">Dashboard <ArrowRight size={17} /></Link>
          ) : (
            <>
              <Link to="/login" className="ghost-button hidden sm:inline-flex">Login</Link>
              <Link to="/signup" className="premium-button">Get Started <ArrowRight size={17} /></Link>
            </>
          )}
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-12 px-5 pb-12 pt-8 lg:grid-cols-[.88fr_1.12fr]">
        <motion.div initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} className="relative mx-auto aspect-square w-full max-w-[480px] order-2 lg:order-1">
          <div className="absolute inset-4 animate-pulse rounded-full border border-gold/40 shadow-glow" />
          <div className="absolute inset-10 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-2xl" />
          <motion.img animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-[18%] h-[64%] w-[64%] rounded-full object-cover ring-4 ring-gold/60" src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=720&q=85" alt="CareerPilot AI user profile" />
          {[Briefcase, Brain, Sparkles, FileText].map((Icon, index) => (
            <motion.div key={index} animate={{ y: [0, index % 2 ? 14 : -14, 0] }} transition={{ duration: 3 + index, repeat: Infinity }} className={`absolute glass grid h-16 w-16 place-items-center rounded-3xl text-gold ${['left-0 top-20','right-5 top-8','bottom-12 left-8','bottom-24 right-0'][index]}`}>
              <Icon />
            </motion.div>
          ))}
        </motion.div>

        <div className="pb-8 text-center lg:text-left order-1 lg:order-2">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-5 inline-flex rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold uppercase text-gold">
            AI career operating system
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            AI-Powered Career Growth Platform
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg lg:mx-0">
            Build Your Resume, Improve Your Skills, Crack Interviews, and Accelerate Your Career with AI.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            {user ? (
              <Link to="/dashboard" className="premium-button">Go to Dashboard <ArrowRight size={18} /></Link>
            ) : (
              <>
                <Link to="/signup" className="premium-button">Get Started <ArrowRight size={18} /></Link>
                <a href="#features" className="ghost-button"><Play size={18} /> Watch Demo</a>
              </>
            )}
          </motion.div>
          <div id="features" className="mt-10 grid gap-3 sm:grid-cols-2">
            {features.map(([label, Icon]) => (
              <motion.div whileHover={{ y: -4 }} key={label} className="glass flex items-center gap-3 rounded-3xl p-4">
                <div className="rounded-2xl bg-gold/15 p-3 text-gold"><Icon size={20} /></div>
                <span className="font-semibold">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
