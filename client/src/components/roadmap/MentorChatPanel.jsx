import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, HelpCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api.jsx';
import toast from 'react-hot-toast';

const suggestedQuestions = [
  'What should I learn next?',
  'How can I become job-ready faster?',
  'Which project should I build?',
  'Which certification is best for me?'
];

export default function MentorChatPanel() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your Career Mentor. I track your roadmap, completed phases, and missing credentials in real-time. Ask me how to accelerate your preparation!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/roadmap/mentor-chat', { message: text });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      toast.error('Could not get response from career mentor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-3xl p-6 relative flex flex-col h-[520px] overflow-hidden border border-white/5 bg-gradient-to-b from-white/[0.01] to-white/[0.03]">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 flex-shrink-0">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-1.5">
            <Sparkles className="text-gold" size={16} /> AI Career Mentor Chat
          </h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">Continuous guidance based on active roadmap metrics.</p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              msg.role === 'user'
                ? 'bg-gold/15 text-gold border-gold/25'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gold text-black font-semibold rounded-tr-none'
                : 'bg-white/[0.03] border border-white/5 text-zinc-300 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="h-8 w-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 flex-shrink-0">
              <Loader2 size={14} className="animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-zinc-500 rounded-tl-none flex items-center gap-2">
              Mentor is reviewing metrics...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && !loading && (
        <div className="mb-4 flex-shrink-0">
          <div className="text-[10px] font-black text-gold uppercase tracking-wider mb-2 flex items-center gap-1">
            <HelpCircle size={10} /> Quick Mentor Prompts
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-[10.5px] text-zinc-300 bg-white/5 hover:bg-gold/10 border border-white/5 hover:border-gold/30 px-3 py-1.5 rounded-xl transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
        className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10 flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your career mentor what to study or focus on next..."
          disabled={loading}
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="h-10 w-10 rounded-2xl bg-gold hover:bg-yellow-500 text-black flex items-center justify-center disabled:opacity-50 disabled:hover:bg-gold transition-all"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
