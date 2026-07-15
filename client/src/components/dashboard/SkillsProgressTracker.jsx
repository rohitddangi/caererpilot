import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Award, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.jsx';
import { getRequiredSkills } from '../../data/roleSkillsMap.js';
import WidgetShell from './WidgetShell.jsx';
import toast from 'react-hot-toast';

export default function SkillsProgressTracker() {
  const { user, setUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);

  const skills = user?.profile?.skills || [];
  const targetRole = user?.profile?.targetRole || 'Full Stack Developer';

  const suggestions = getRequiredSkills(targetRole);

  async function handleAddSkill(skillName) {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Skill already exists in your stack!');
      return;
    }

    const updatedSkills = [...skills, trimmed];
    await updateSkillsInDb(updatedSkills, `Added ${trimmed} to stack!`);
    setNewSkill('');
  }

  async function handleDeleteSkill(skillName) {
    const updatedSkills = skills.filter(s => s !== skillName);
    await updateSkillsInDb(updatedSkills, `Removed ${skillName} from stack.`);
  }

  async function updateSkillsInDb(newSkills, successMessage) {
    setSaving(true);
    try {
      const response = await api.patch('/users/profile', {
        profile: {
          ...user.profile,
          skills: newSkills
        }
      });
      setUser(response.data.user);
      toast.success(successMessage);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update skills in database.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <WidgetShell
      title="Skills Stack Manager"
      icon={Award}
      badge={`${skills.length} Skills`}
      badgeColor="emerald"
      headerRight={
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-xs font-bold text-gold hover:text-white transition-colors bg-gold/10 hover:bg-gold/20 px-3 py-1.5 rounded-xl border border-gold/20"
        >
          <Plus size={14} /> Add Skill
        </button>
      }
      footer={
        <>
          <span>Target role matching: {skills.length} skills</span>
          {saving && (
            <span className="flex items-center gap-1 text-gold font-bold">
              <Loader2 size={12} className="animate-spin" /> Updating...
            </span>
          )}
        </>
      }
    >
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-wrap gap-2.5 max-h-[220px] overflow-y-auto pr-1">
          <AnimatePresence>
            {skills.map((skill) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.03 }}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white hover:border-red-500/30 flex items-center gap-2 transition-all group"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleDeleteSkill(skill)}
                  disabled={saving}
                  className="text-zinc-500 hover:text-red-400 group-hover:text-zinc-300 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X size={13} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          {skills.length === 0 && (
            <div className="text-center py-8 text-zinc-500 italic w-full">
              No skills added yet. Click 'Add Skill' to populate your tech stack.
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add Skill Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-gold" />
                  Add Technical Skills
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10"
                  aria-label="Close add skills menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddSkill(newSkill);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter skill name (e.g. Docker, PyTorch)"
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={saving || !newSkill.trim()}
                    className="premium-button px-5 py-3 rounded-2xl text-xs font-bold"
                  >
                    Add
                  </button>
                </form>

                {/* Suggestions List */}
                <div>
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <BookOpen size={12} /> Target Role Suggestions
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {suggestions.map((sug) => {
                      const added = skills.some(s => s.toLowerCase() === sug.toLowerCase());
                      return (
                        <button
                          key={sug}
                          disabled={added || saving}
                          onClick={() => handleAddSkill(sug)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                            added
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-60 cursor-not-allowed'
                              : 'bg-white/5 border-white/10 hover:border-gold/30 hover:bg-gold/5 text-zinc-300'
                          }`}
                        >
                          {sug}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WidgetShell>
  );
}
