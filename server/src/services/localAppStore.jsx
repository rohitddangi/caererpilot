import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const dataDir = path.resolve('data');
const appFile = path.join(dataDir, 'app.json');

const seed = {
  jobs: [
    { id: 'job-1', title: 'AI Engineering Intern', company: 'NeuroStack Labs', match: 94, type: 'Internship', status: 'Recommended', savedBy: [], appliedBy: [] },
    { id: 'job-2', title: 'Full Stack Developer', company: 'OrbitCloud', match: 87, type: 'Full-time', status: 'Recommended', savedBy: [], appliedBy: [] },
    { id: 'job-3', title: 'ML Research Intern', company: 'DataForge AI', match: 82, type: 'Internship', status: 'Recommended', savedBy: [], appliedBy: [] },
    { id: 'job-4', title: 'Cloud Engineer Trainee', company: 'SkyGrid Systems', match: 78, type: 'Trainee', status: 'Recommended', savedBy: [], appliedBy: [] },
  ],
  certificates: [
    { id: 'cert-1', title: 'React Advanced', category: 'Frontend', ownerId: 'seed', fileName: 'react-advanced.pdf', createdAt: new Date().toISOString() },
    { id: 'cert-2', title: 'MongoDB Basics', category: 'Database', ownerId: 'seed', fileName: 'mongodb-basics.pdf', createdAt: new Date().toISOString() },
    { id: 'cert-3', title: 'AI Foundations', category: 'AI', ownerId: 'seed', fileName: 'ai-foundations.pdf', createdAt: new Date().toISOString() },
  ],
  careerGoals: [],
  activities: [],
};

// ─── Career Goals CRUD ────────────────────────────────────────────────────────
export async function listGoals(userId, filters = {}) {
  const data = await readApp();
  let goals = (data.careerGoals || []).filter(g => g.userId === userId && !g.archived);
  if (filters.status) goals = goals.filter(g => g.status === filters.status);
  if (filters.priority) goals = goals.filter(g => g.priority === filters.priority);
  if (filters.category) goals = goals.filter(g => g.category === filters.category);
  if (filters.difficulty) goals = goals.filter(g => g.difficulty === filters.difficulty);
  if (filters.search) {
    const s = filters.search.toLowerCase();
    goals = goals.filter(g => g.title.toLowerCase().includes(s) || (g.description || '').toLowerCase().includes(s) || (g.targetCompany || '').toLowerCase().includes(s));
  }
  const sort = filters.sort || 'newest';
  goals.sort((a, b) => {
    if (sort === 'deadline') return new Date(a.deadline || '2099-12-31') - new Date(b.deadline || '2099-12-31');
    if (sort === 'priority') { const o = { critical: 0, high: 1, medium: 2, low: 3 }; return (o[a.priority] ?? 3) - (o[b.priority] ?? 3); }
    if (sort === 'completion') return (b.progress || 0) - (a.progress || 0);
    if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === 'alphabetical') return a.title.localeCompare(b.title);
    return new Date(b.createdAt) - new Date(a.createdAt); // newest
  });
  return goals;
}

export async function createGoal(userId, payload) {
  const data = await readApp();
  if (!data.careerGoals) data.careerGoals = [];
  const goal = {
    id: randomUUID(),
    userId,
    title: payload.title || 'Untitled Goal',
    description: payload.description || '',
    category: payload.category || 'General',
    priority: payload.priority || 'medium',
    difficulty: payload.difficulty || 'intermediate',
    targetCompany: payload.targetCompany || '',
    targetRole: payload.targetRole || '',
    deadline: payload.deadline || '',
    estimatedHours: payload.estimatedHours || 0,
    currentSkillLevel: payload.currentSkillLevel || 1,
    targetSkillLevel: payload.targetSkillLevel || 5,
    expectedSalary: payload.expectedSalary || '',
    location: payload.location || '',
    workType: payload.workType || 'any',
    color: payload.color || '#D4AF37',
    icon: payload.icon || 'target',
    reminder: payload.reminder || false,
    status: 'not_started',
    progress: 0,
    milestones: payload.milestones || [],
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.careerGoals.unshift(goal);
  data.activities.push({ id: randomUUID(), userId, text: `Created career goal: ${goal.title}`, createdAt: goal.createdAt });
  await writeApp(data);
  return goal;
}

export async function updateGoalById(userId, goalId, updates) {
  const data = await readApp();
  if (!data.careerGoals) data.careerGoals = [];
  const idx = data.careerGoals.findIndex(g => g.id === goalId && g.userId === userId);
  if (idx === -1) return null;
  const safe = { ...updates };
  delete safe.id; delete safe.userId; delete safe.createdAt;
  safe.updatedAt = new Date().toISOString();
  data.careerGoals[idx] = { ...data.careerGoals[idx], ...safe };
  await writeApp(data);
  return data.careerGoals[idx];
}

export async function deleteGoalById(userId, goalId, hard = false) {
  const data = await readApp();
  if (!data.careerGoals) return false;
  if (hard) {
    data.careerGoals = data.careerGoals.filter(g => !(g.id === goalId && g.userId === userId));
  } else {
    const g = data.careerGoals.find(g => g.id === goalId && g.userId === userId);
    if (g) g.archived = true;
  }
  data.activities.push({ id: randomUUID(), userId, text: `Deleted a career goal`, createdAt: new Date().toISOString() });
  await writeApp(data);
  return true;
}

export async function getGoalAnalytics(userId) {
  const data = await readApp();
  const all = (data.careerGoals || []).filter(g => g.userId === userId && !g.archived);
  const completed = all.filter(g => g.status === 'completed');
  const active = all.filter(g => g.status === 'in_progress');
  const overdue = all.filter(g => g.deadline && new Date(g.deadline) < new Date() && g.status !== 'completed' && g.status !== 'cancelled');
  const avgProgress = all.length ? Math.round(all.reduce((s, g) => s + (g.progress || 0), 0) / all.length) : 0;
  return {
    total: all.length,
    completed: completed.length,
    active: active.length,
    overdue: overdue.length,
    completionRate: all.length ? Math.round((completed.length / all.length) * 100) : 0,
    avgProgress,
    byPriority: { critical: all.filter(g => g.priority === 'critical').length, high: all.filter(g => g.priority === 'high').length, medium: all.filter(g => g.priority === 'medium').length, low: all.filter(g => g.priority === 'low').length },
    byStatus: { not_started: all.filter(g => g.status === 'not_started').length, planning: all.filter(g => g.status === 'planning').length, in_progress: active.length, on_hold: all.filter(g => g.status === 'on_hold').length, completed: completed.length, cancelled: all.filter(g => g.status === 'cancelled').length },
  };
}

async function readApp() {
  try {
    const data = JSON.parse(await readFile(appFile, 'utf8'));
    return { ...seed, ...data };
  } catch {
    return seed;
  }
}

async function writeApp(data) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(appFile, JSON.stringify(data, null, 2));
}

export async function getDashboard(user) {
  const data = await readApp();
  const certificates = data.certificates.filter((cert) => cert.ownerId === user.id || cert.ownerId === 'seed');
  const savedJobs = data.jobs.filter((job) => job.savedBy.includes(user.id)).length;
  const appliedJobs = data.jobs.filter((job) => job.appliedBy.includes(user.id)).length;
  return {
    profileCompletion: user.profile?.bio ? 92 : 76,
    skillProgress: Math.min(95, 55 + (user.profile?.skills?.length || 0) * 8),
    careerMomentum: Math.max(7, certificates.length * 5 + savedJobs * 2),
    actionsCompleted: certificates.length + savedJobs + appliedJobs + data.activities.filter((item) => item.userId === user.id).length,
    activities: data.activities.filter((item) => item.userId === user.id).slice(-6).reverse(),
    recommendedActions: ['Upload latest resume for ATS scoring', 'Practice 10 behavioral questions', 'Save 3 role-matched jobs'],
  };
}

export async function listJobs(userId) {
  const data = await readApp();
  return data.jobs.map((job) => ({
    ...job,
    saved: job.savedBy.includes(userId),
    applied: job.appliedBy.includes(userId),
    status: job.appliedBy.includes(userId) ? 'Applied' : job.savedBy.includes(userId) ? 'Saved' : job.status,
  }));
}

export async function updateJob(userId, jobId, action) {
  const data = await readApp();
  const job = data.jobs.find((item) => item.id === jobId);
  if (!job) return null;
  if (action === 'save') job.savedBy = toggle(job.savedBy, userId);
  if (action === 'apply' && !job.appliedBy.includes(userId)) job.appliedBy.push(userId);
  data.activities.push({ id: randomUUID(), userId, text: `${action === 'apply' ? 'Applied to' : 'Updated'} ${job.title}`, createdAt: new Date().toISOString() });
  await writeApp(data);
  return (await listJobs(userId)).find((item) => item.id === jobId);
}

export async function listCertificates(userId) {
  const data = await readApp();
  return data.certificates.filter((cert) => cert.ownerId === userId || cert.ownerId === 'seed');
}

export async function addCertificate(userId, payload) {
  const data = await readApp();
  const cert = {
    id: randomUUID(),
    ownerId: userId,
    title: payload.title || payload.fileName || 'Untitled Certificate',
    category: payload.category || 'General',
    fileName: payload.fileName || 'certificate.pdf',
    createdAt: new Date().toISOString(),
  };
  data.certificates.unshift(cert);
  data.activities.push({ id: randomUUID(), userId, text: `Uploaded certificate: ${cert.title}`, createdAt: cert.createdAt });
  await writeApp(data);
  return cert;
}

export async function getAdminAnalytics() {
  const data = await readApp();
  return {
    users: 1,
    resources: 348,
    jobs: data.jobs.length,
    certificates: data.certificates.length,
    events: ['Admin analytics refreshed', 'Job tracker is online', 'Certificate manager is online', 'AI endpoints are protected'],
  };
}

function toggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
