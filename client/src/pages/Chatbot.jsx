import { useState, useEffect, useRef } from 'react';
import { 
  Mic, Send, Bot, Paperclip, CheckCircle2, ChevronRight, UserCircle2, 
  Trash2, PlusCircle, Bookmark, Star, Sparkles, AlertCircle, RefreshCw, 
  Copy, Pin, Search, ShieldAlert, Cpu, Database, Landmark, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../components/SectionHeader.jsx';
import { api } from '../services/api.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const AGENTS = [
  { id: 'Career Coach', icon: Bot, desc: 'General career strategy & advice' },
  { id: 'Resume Expert', icon: Paperclip, desc: 'ATS optimization & tailoring' },
  { id: 'Roadmap Expert', icon: ChevronRight, desc: 'Learning paths & milestones' },
  { id: 'Job Expert', icon: UserCircle2, desc: 'Job market & applications' },
  { id: 'Interview Expert', icon: CheckCircle2, desc: 'Mock prep & feedback' },
];

const QUICK_ACTIONS = [
  { label: 'Analyze Resume Gaps', prompt: 'Analyze my current resume score gaps against my target role requirements.' },
  { label: 'Create Weekly Study Plan', prompt: 'Design a highly optimized 7-day study plan committing 15 hours this week.' },
  { label: 'Recommend Course Stack', prompt: 'Recommend the top 3 high-yield courses to master Next.js and TypeScript.' },
  { label: 'Interview Star Framework', prompt: 'Explain the STAR method using a real-world full-stack deployment scenario.' },
  { label: 'Salary Scaling Guidance', prompt: 'What is the salary ceiling projection for entry-level vs senior developers in my target stack?' },
  { label: 'Suggest Capstone Projects', prompt: 'Suggest 2 resume-ready capstone project ideas to resolve databases scaling gaps.' }
];

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState('Career Coach');
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedAdvice, setPinnedAdvice] = useState([]);
  const chatEndRef = useRef(null);

  // Initialize with welcome message when agent changes
  useEffect(() => {
    setMessages([
      { 
        role: 'ai', 
        text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your **${activeAgent}**. How can I help you accelerate your career today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [activeAgent, user?.name]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(prompt = text) {
    if (!prompt.trim()) return;
    
    setLoading(true);
    const userMsg = {
      role: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(m => [...m, userMsg]);
    setText('');
    
    try {
      const { data } = await api.post('/ai/career-chat', { 
        message: prompt, 
        agent: activeAgent 
      });
      
      const aiMsg = {
        role: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(m => [...m, aiMsg]);
    } catch (err) {
      toast.error('Failed to get response');
      setMessages(m => [...m, { 
        role: 'ai', 
        text: 'Sorry, I encountered an error connecting to the intelligence engine.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  }

  // Clear Chat history locally
  const handleClearChat = () => {
    setMessages([
      { 
        role: 'ai', 
        text: `Hi ${user?.name?.split(' ')[0] || 'there'}! Chat has been cleared. How can I help you?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    toast.success('Chat cleared!');
  };

  // Pin a helpful message to memory drawer
  const handlePinMessage = (messageText) => {
    if (pinnedAdvice.includes(messageText)) {
      toast.error('Advice already pinned!');
      return;
    }
    setPinnedAdvice(prev => [...prev, messageText]);
    toast.success('Pinned to AI memory drawer!');
  };

  const handleCopyMessage = (messageText) => {
    navigator.clipboard.writeText(messageText);
    toast.success('Advice copied to clipboard!');
  };

  const handleDeleteMessage = (idx) => {
    setMessages(prev => prev.filter((_, i) => i !== idx));
    toast.success('Message deleted.');
  };

  const handleRegenerateLast = () => {
    // Find last user message
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length === 0) return;
    const lastUserPrompt = userMsgs[userMsgs.length - 1].text;
    send(lastUserPrompt);
  };

  // Search filtered messages
  const filteredMessages = messages.filter(m => 
    m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Custom Markdown & formatting parser (bold, lists, tables, code)
  const formatResponse = (rawText) => {
    if (!rawText) return '';

    // Handle code blocks: ```code```
    if (rawText.includes('```')) {
      const parts = rawText.split('```');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <pre key={index} className="bg-zinc-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-white/5 my-2 leading-relaxed">
              <code>{part}</code>
            </pre>
          );
        }
        return formatTextHelper(part);
      });
    }

    return formatTextHelper(rawText);
  };

  const formatTextHelper = (textBlock) => {
    // Handle table layouts: | col1 | col2 |
    if (textBlock.includes('|') && textBlock.includes('\n')) {
      const lines = textBlock.split('\n');
      const tableLines = lines.filter(l => l.trim().startsWith('|'));
      if (tableLines.length > 1) {
        return (
          <div className="overflow-x-auto my-3 border border-white/10 rounded-xl">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 font-bold uppercase text-[9px] tracking-wider">
                  {tableLines[0].split('|').filter(Boolean).map((cell, idx) => (
                    <th key={idx} className="p-3 text-zinc-300">{cell.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/20">
                {tableLines.slice(2).map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    {row.split('|').filter(Boolean).map((cell, cellIdx) => (
                      <td key={cellIdx} className="p-3 text-zinc-400 font-medium">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Standard styling with bold and list rules
    const lines = textBlock.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      let isBullet = false;

      // Check lists: - item or * item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        content = line.trim().substring(2);
        isBullet = true;
      }

      // Check bold syntax: **bold**
      const boldSplit = content.split('**');
      const styledLine = boldSplit.map((part, index) => 
        index % 2 === 1 ? <strong key={index} className="font-bold text-gold">{part}</strong> : part
      );

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 ml-4 my-1">
            <span className="text-gold mt-1">•</span>
            <span>{styledLine}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs text-zinc-300 leading-relaxed my-1 font-semibold">
          {styledLine}
        </p>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      
      {/* ─── PREMIUM CHAT HEADER COCKPIT ─── */}
      <div className="glass-panel p-5 rounded-[2rem] bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/10 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Assistant avatar & online indicators */}
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-gold/15">
                <Bot className="h-5.5 w-5.5 text-black" />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5 leading-none">
                AI Career Assistant <span className="text-[10px] text-zinc-500 font-bold">• Active Context</span>
              </h2>
              <p className="text-[10px] text-zinc-400 mt-1">
                Goal Role: <strong className="text-gold">{user?.profile?.targetRole || 'Full Stack Developer'}</strong>
              </p>
            </div>
          </div>

          {/* Connection status triggers */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 border border-white/5 rounded-xl px-3 py-1.5 bg-white/[0.01]">
              Engine: <span className="text-emerald-400 font-black">Connected</span>
            </div>
            <div className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 border border-white/5 rounded-xl px-3 py-1.5 bg-white/[0.01]">
              Chats: <span className="text-white font-black">{messages.length}</span>
            </div>
            
            <div className="flex gap-1.5 shrink-0 ml-auto sm:ml-0">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-zinc-500 hover:text-white transition-all"
                title="Clear chat"
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={handleClearChat}
                className="p-2 rounded-full border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/10 text-zinc-500 hover:text-gold transition-all"
                title="New conversation"
              >
                <PlusCircle size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 flex-1 min-h-0">
        
        {/* Sidebar: Advisor Selection & Pinned Advice */}
        <div className="glass rounded-3xl p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar shrink-0">
          
          {/* Search chat */}
          <div className="relative">
            <Search size={11} className="absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-gold/50"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 block">Advisors Boards</span>
            {AGENTS.map((agent) => {
              const Icon = agent.icon;
              const isActive = activeAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all text-left ${
                    isActive ? 'bg-gold/10 border border-gold/30' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-xl ${isActive ? 'bg-gold text-black' : 'bg-white/5 text-gold'}`}>
                    <Icon size={14} />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isActive ? 'text-gold' : 'text-zinc-300'}`}>{agent.id}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 leading-normal">{agent.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Pinned advice drawer */}
          <div className="mt-auto border-t border-white/5 pt-4 space-y-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 flex items-center gap-1">
              <Bookmark size={11} className="text-gold" /> Pinned AI Advice ({pinnedAdvice.length})
            </span>
            {pinnedAdvice.length === 0 ? (
              <div className="text-[10px] text-zinc-500 italic px-2">No pinned advice nodes yet. Click the pin icon on chat advice to save.</div>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-2 custom-scrollbar">
                {pinnedAdvice.map((adv, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 text-[10px] text-zinc-400 font-semibold relative group leading-relaxed">
                    <button
                      onClick={() => setPinnedAdvice(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-white transition-all text-[8px] uppercase font-black"
                    >
                      Delete
                    </button>
                    {adv.substring(0, 80)}...
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat space */}
        <div className="glass flex flex-col rounded-3xl overflow-hidden relative border border-white/5 bg-black/20">
          
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <AnimatePresence initial={false}>
              {(searchQuery ? filteredMessages : messages).map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[85%] space-y-1">
                    {/* Timestamp & role info */}
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 uppercase font-black px-1">
                      <span>{m.role === 'user' ? 'You' : activeAgent}</span>
                      <span>{m.timestamp}</span>
                    </div>

                    <div className={`relative rounded-3xl px-5 py-3.5 shadow-lg group ${
                      m.role === 'user' 
                        ? 'bg-gradient-to-br from-gold to-champagne text-black rounded-br-sm font-medium' 
                        : 'bg-white/5 border border-white/10 text-zinc-200 rounded-bl-sm backdrop-blur-md'
                    }`}>
                      {/* Action parameters for copy/pin/delete */}
                      {m.role === 'ai' && (
                        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all flex gap-1 bg-zinc-900 border border-white/10 rounded-lg p-0.5 z-10">
                          <button
                            onClick={() => handleCopyMessage(m.text)}
                            className="p-1 hover:bg-white/5 rounded text-zinc-400 hover:text-white"
                            title="Copy advice"
                          >
                            <Copy size={11} />
                          </button>
                          <button
                            onClick={() => handlePinMessage(m.text)}
                            className="p-1 hover:bg-white/5 rounded text-zinc-400 hover:text-gold"
                            title="Pin to memory drawer"
                          >
                            <Pin size={11} />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(i)}
                            className="p-1 hover:bg-white/5 rounded text-zinc-400 hover:text-red-400"
                            title="Delete Advice"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}

                      {/* Content Formatter */}
                      {m.role === 'user' ? (
                        <p className="text-xs font-semibold text-black leading-relaxed">{m.text}</p>
                      ) : (
                        formatResponse(m.text)
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/10 text-zinc-400 rounded-3xl rounded-bl-sm px-5 py-3.5 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </AnimatePresence>
          </div>

          {/* Smart quick actions bar */}
          <div className="px-6 py-2 shrink-0 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none bg-black/40">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                disabled={loading}
                onClick={() => send(action.prompt)}
                className="flex-shrink-0 text-[10px] font-black uppercase tracking-wider text-zinc-400 border border-white/5 bg-white/5 rounded-xl px-3 py-2 hover:border-gold/30 hover:bg-gold/10 hover:text-white transition duration-150"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input control block */}
          <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3 relative">
              <button className="p-3 text-zinc-400 hover:text-white transition-colors" title="Upload document">
                <Paperclip size={18} />
              </button>
              <input 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && send()}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-xs focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all text-white placeholder-zinc-500 shadow-inner" 
                placeholder={`Ask ${activeAgent}...`} 
              />
              <button className="p-3 text-zinc-400 hover:text-gold transition-colors absolute right-16" title="Voice input">
                <Mic size={18} />
              </button>
              <button 
                onClick={() => send()} 
                disabled={loading || !text.trim()} 
                className="premium-button !p-3.5 !rounded-full aspect-square flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={15} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
