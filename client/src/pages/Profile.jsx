import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SectionHeader from '../components/SectionHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    title: user?.title || '',
    github: user?.profile?.github || '',
    linkedin: user?.profile?.linkedin || '',
    bio: user?.profile?.bio || '',
    skills: (user?.profile?.skills || []).join(', '),
  });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event) {
    event.preventDefault();
    const payload = {
      name: form.name,
      title: form.title,
      profile: {
        github: form.github,
        linkedin: form.linkedin,
        bio: form.bio,
        skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      },
    };
    const { data } = await api.patch('/users/profile', payload);
    setUser(data.user);
    localStorage.setItem('cp_user', JSON.stringify(data.user));
    toast.success('Profile saved');
  }

  return (
    <div>
      <SectionHeader eyebrow="Profile" title="Editable Career Profile" description="Profile photo, bio, skills, education, GitHub, LinkedIn, and career signals." />
      <form onSubmit={save} className="glass rounded-3xl p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col items-center md:items-start gap-4 shrink-0">
            <img src={user?.avatar} className="h-32 w-32 rounded-full object-cover ring-4 ring-gold/40" alt={user?.name} />
            
            {/* Account Credentials Summary Card */}
            <div className="w-full bg-white/[0.02] border border-white/[0.08] p-3.5 rounded-2xl text-xs space-y-2.5 text-left">
              <div>
                <span className="text-zinc-500 block uppercase text-[9px] font-bold tracking-wider">Method</span>
                <span className="font-semibold text-white capitalize">{user?.authProvider === 'google.com' ? 'Google OAuth' : 'Email & Pass'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase text-[9px] font-bold tracking-wider">Verification</span>
                {user?.emailVerified ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified
                  </span>
                ) : (
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Unverified
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/verify-email')}
                      className="text-[10px] text-gold hover:underline font-bold block"
                    >
                      Verify Now →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Name" />
            <input className="input" value={form.email} disabled placeholder="Email" />
            <input className="input" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Career title" />
            <input className="input" value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="Skills comma separated" />
            <input className="input" value={form.github} onChange={(e) => update('github', e.target.value)} placeholder="GitHub" />
            <input className="input" value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} placeholder="LinkedIn" />
            <textarea className="input min-h-32 md:col-span-2" value={form.bio} onChange={(e) => update('bio', e.target.value)} placeholder="Bio" />
          </div>
        </div>
        <button className="premium-button mt-6">Save Profile</button>
      </form>
    </div>
  );
}
