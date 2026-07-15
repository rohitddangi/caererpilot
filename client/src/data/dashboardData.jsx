// ─── Career Readiness Breakdown ───────────────────────────────────────────────
export const readinessBreakdown = [
  { label: 'Resume Score',         score: 82, weight: 0.20, icon: 'FileText'   },
  { label: 'Skills Score',         score: 68, weight: 0.20, icon: 'Zap'        },
  { label: 'Projects Score',       score: 59, weight: 0.18, icon: 'Code2'      },
  { label: 'Certificates',         score: 45, weight: 0.12, icon: 'Medal'      },
  { label: 'GitHub Activity',      score: 73, weight: 0.12, icon: 'Github'     },
  { label: 'Interview Readiness',  score: 55, weight: 0.10, icon: 'Mic2'       },
  { label: 'Job Applications',     score: 38, weight: 0.08, icon: 'Send'       },
];

// Weighted readiness score calculation
export const careerReadinessScore = Math.round(
  readinessBreakdown.reduce((sum, item) => sum + item.score * item.weight, 0)
);

// ─── User Goal & Target ────────────────────────────────────────────────────────
export const userGoal = {
  targetRole: 'AI/ML Engineer',
  currentLevel: 'B.Tech 3rd Year',
  estimatedMonths: 4,
  readinessStatus: 'improving', // 'ready' | 'improving' | 'gap'
  motivationalMessage:
    'You\'re making strong progress! Completing 2 more projects and practicing DSA daily will put you in the top 15% of candidates for AI/ML roles.',
};

// ─── Analytics Card Stats ─────────────────────────────────────────────────────
export const analyticsStats = {
  profileCompletion:  { value: 76, trend: +8,  unit: '%' },
  skillProgress:      { value: 68, trend: +12, unit: '%' },
  careerMomentum:     { value: 14, trend: +3,  unit: 'd streak' },
  actionsCompleted:   { value: 23, trend: +7,  unit: 'this month' },
};

// ─── Weekly Growth Chart Data ─────────────────────────────────────────────────
export const weeklyGrowthData = [
  { day: 'Mon', learning: 2.5, skills: 3, projects: 1, applications: 2, interviews: 1 },
  { day: 'Tue', learning: 3.0, skills: 4, projects: 0, applications: 3, interviews: 2 },
  { day: 'Wed', learning: 4.5, skills: 5, projects: 2, applications: 5, interviews: 1 },
  { day: 'Thu', learning: 3.5, skills: 6, projects: 1, applications: 4, interviews: 3 },
  { day: 'Fri', learning: 5.0, skills: 8, projects: 2, applications: 6, interviews: 2 },
  { day: 'Sat', learning: 6.0, skills: 7, projects: 3, applications: 3, interviews: 4 },
  { day: 'Sun', learning: 4.0, skills: 5, projects: 2, applications: 2, interviews: 3 },
];

// ─── Career Radar Data ────────────────────────────────────────────────────────
export const careerRadarData = [
  { subject: 'Technical',   score: 72, fullMark: 100 },
  { subject: 'Projects',    score: 59, fullMark: 100 },
  { subject: 'Resume',      score: 82, fullMark: 100 },
  { subject: 'Interview',   score: 55, fullMark: 100 },
  { subject: 'Networking',  score: 41, fullMark: 100 },
  { subject: 'Certifications', score: 45, fullMark: 100 },
];

// ─── Progress Tracker ─────────────────────────────────────────────────────────
export const progressJourneys = [
  { name: 'Frontend',     percent: 74, color: '#d6a83a', icon: 'Monitor'   },
  { name: 'Backend',      percent: 52, color: '#f4d37a', icon: 'Server'    },
  { name: 'DSA',          percent: 61, color: '#a97b16', icon: 'Brain'     },
  { name: 'AI/ML',        percent: 68, color: '#fff0aa', icon: 'Cpu'       },
  { name: 'Interview',    percent: 55, color: '#e8c96a', icon: 'MessageCircle' },
];

// ─── Skill Gap Snapshot ───────────────────────────────────────────────────────
export const skillGapData = {
  targetRole: 'AI/ML Engineer',
  currentSkills: ['Python', 'React', 'TensorFlow', 'SQL', 'Git', 'NumPy', 'Pandas', 'JavaScript'],
  requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'Docker', 'AWS', 'MLflow', 'Kubernetes', 'MongoDB', 'FastAPI', 'SQL', 'Git'],
  missingSkills:  [
    { name: 'Docker',     priority: 'high',   hours: 20 },
    { name: 'PyTorch',    priority: 'high',   hours: 30 },
    { name: 'AWS',        priority: 'high',   hours: 40 },
    { name: 'MLflow',     priority: 'medium', hours: 15 },
    { name: 'Kubernetes', priority: 'medium', hours: 25 },
    { name: 'MongoDB',    priority: 'low',    hours: 10 },
    { name: 'FastAPI',    priority: 'low',    hours: 12 },
  ],
  prioritySkill: 'PyTorch',
  recommendedPath: ['PyTorch Fundamentals', 'Docker Basics', 'AWS Cloud Practitioner', 'MLflow Tracking'],
};

// ─── AI Insights ──────────────────────────────────────────────────────────────
export const aiInsights = [
  {
    type: 'strength',
    icon: 'TrendingUp',
    title: '75% Ready for Frontend Developer',
    body: 'Your React & JavaScript skills are strong. 3 deployed projects puts you ahead of 68% of applicants.',
    badge: 'Strength',
    color: 'emerald',
  },
  {
    type: 'warning',
    icon: 'AlertTriangle',
    title: 'DSA Practice Needed',
    body: 'Improving DSA from 61% → 80% can increase placement chances by 34%. Aim for 3 problems/day.',
    badge: 'Priority',
    color: 'amber',
  },
  {
    type: 'opportunity',
    icon: 'Sparkles',
    title: 'Adding Node.js Boosts Reach by 18%',
    body: 'Node.js appears in 73% of Full-Stack JDs you\'ve saved. A 2-week course puts it in your portfolio.',
    badge: 'Opportunity',
    color: 'blue',
  },
  {
    type: 'action',
    icon: 'Award',
    title: 'AWS Certification = +22% Salary Premium',
    body: 'Candidates with AWS Cloud Practitioner earn 22% more on average. Your GitHub activity supports cloud interest.',
    badge: 'High ROI',
    color: 'gold',
  },
];

// ─── Job Readiness Meter ──────────────────────────────────────────────────────
export const jobReadiness = {
  hiringProbability: 68,
  factors: [
    { label: 'Strong Projects',        impact: 'positive', weight: 'high'   },
    { label: '3 Deployed Apps',        impact: 'positive', weight: 'high'   },
    { label: 'Active GitHub (73%)',     impact: 'positive', weight: 'medium' },
    { label: 'Weak Interview Skills',  impact: 'negative', weight: 'high'   },
    { label: 'Limited Certifications', impact: 'negative', weight: 'medium' },
    { label: 'Low Application Count',  impact: 'negative', weight: 'medium' },
  ],
  improvements: [
    'Complete 2 mock interviews this week',
    'Earn AWS Cloud Practitioner in 3 weeks',
    'Apply to 10+ internships before Friday',
  ],
};

// ─── Project Strength ─────────────────────────────────────────────────────────
export const projectStrength = {
  score: 59,
  projects: [
    { name: 'AI Resume Analyzer', deployed: true,  github: true,  docs: true  },
    { name: 'ML Stock Predictor', deployed: false, github: true,  docs: false },
    { name: 'Chat App (MERN)',    deployed: true,  github: true,  docs: false },
    { name: 'Portfolio Website',  deployed: true,  github: true,  docs: true  },
  ],
  metrics: {
    total:       4,
    deployed:    3,
    withDocs:    2,
    githubStars: 47,
    commits30d:  83,
  },
  recommendations: [
    'Add README to ML Stock Predictor (+8 pts)',
    'Deploy ML project with a live demo link (+12 pts)',
    'Write a case study blog for 1 project (+6 pts)',
    'Contribute to 1 open-source repo (+10 pts)',
  ],
};

// ─── Daily Action Center ──────────────────────────────────────────────────────
export const dailyActions = [
  { id: 1, text: 'Solve 3 DSA Questions on LeetCode',        time: '45 min',  priority: 'high',   category: 'DSA'         },
  { id: 2, text: 'Complete React Authentication Module',      time: '1.5 hrs', priority: 'high',   category: 'Project'     },
  { id: 3, text: 'Update Resume with latest project details', time: '30 min',  priority: 'medium', category: 'Resume'      },
  { id: 4, text: 'Apply to 5 Internships on LinkedIn',        time: '40 min',  priority: 'medium', category: 'Jobs'        },
  { id: 5, text: 'Watch PyTorch Tutorial (Chapter 3)',         time: '1 hr',    priority: 'low',    category: 'Learning'    },
  { id: 6, text: 'Practice 2 Behavioral Interview Questions',  time: '20 min',  priority: 'low',    category: 'Interview'   },
];

// ─── Recent Activities ────────────────────────────────────────────────────────
export const recentActivities = [
  { id: 1, type: 'resume',    text: 'Resume analyzed — ATS score improved to 82',  time: '2h ago',   icon: 'FileText'    },
  { id: 2, type: 'skill',     text: 'Completed "React Hooks Deep Dive" module',    time: '5h ago',   icon: 'Zap'         },
  { id: 3, type: 'job',       text: 'Applied to AI Engineering Intern @ NeuroStack', time: '1d ago', icon: 'Briefcase'   },
  { id: 4, type: 'cert',      text: 'Started AWS Cloud Practitioner course',        time: '2d ago',   icon: 'Award'       },
  { id: 5, type: 'interview', text: 'Completed mock interview — scored 7.2/10',    time: '3d ago',   icon: 'Mic2'        },
  { id: 6, type: 'project',   text: 'Deployed ML Resume Analyzer to Vercel',       time: '4d ago',   icon: 'Code2'       },
  { id: 7, type: 'skill',     text: 'Reached 100-day coding streak on GitHub',     time: '5d ago',   icon: 'Flame'       },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = [
  { id: 1, type: 'alert',     title: 'Resume Needs Update',         body: 'Add your latest ML project to boost ATS score by 12%',  time: '1h',  read: false },
  { id: 2, type: 'match',     title: '4 New Job Matches',           body: 'ML Engineer roles at Google, Meta, and 2 startups',       time: '3h',  read: false },
  { id: 3, type: 'reminder',  title: 'Interview in 2 Days',         body: 'NeuroStack Labs technical round — review FAANG patterns', time: '5h',  read: false },
  { id: 4, type: 'cert',      title: 'Cert Recommendation',         body: 'AWS Cloud Practitioner aligns with your AI/ML target role', time: '1d', read: true  },
  { id: 5, type: 'milestone', title: '🎉 14-Day Streak!',           body: 'You\'re on fire! Keep going to unlock the Elite badge',    time: '2d',  read: true  },
  { id: 6, type: 'alert',     title: 'Skill Gap Alert',             body: 'Docker & PyTorch are missing from your profile',          time: '3d',  read: true  },
];

// ─── Search Quick Results ──────────────────────────────────────────────────────
export const searchExamples = [
  'Search roadmap for AI/ML Engineer',
  'Search React interview questions',
  'Search missing skills',
  'Search AWS certification',
  'Search top internships',
  'Search DSA practice problems',
];

// ─── AI Motivational Messages ───────────────────────────────────────────────
export const AI_MOTIVATIONAL_MESSAGES = [
  "Consistency is key! Devoting just 45 minutes today to DSA can compound into major career breakthroughs.",
  "You're making incredible progress. Bridging your target role's high-priority skill gaps will set you apart from other candidates.",
  "Keep your learning streak alive! Every completed topic brings you closer to your target role readiness.",
  "Fantastic! You've crossed the career readiness threshold. Keep active and start applying to matched opportunities.",
  "Start the day with a quick AI mock interview. It takes 15 minutes but builds lifelong confidence."
];

// ─── Daily Task Templates ───────────────────────────────────────────────────
export const DAILY_TASK_TEMPLATES = {
  'AI/ML Engineer': [
    { id: 't1', text: 'Solve 2 DSA problems on Arrays/Hashing', time: '45m', priority: 'high', category: 'DSA' },
    { id: 't2', text: 'Complete ML PyTorch basics exercises', time: '1h', priority: 'high', category: 'Learning' },
    { id: 't3', text: 'Document stock predictor project architecture', time: '30m', priority: 'medium', category: 'Project' },
    { id: 't4', text: 'Optimize resume ML metrics with ATS suggestions', time: '20m', priority: 'medium', category: 'Resume' },
    { id: 't5', text: 'Complete a mock coding assessment', time: '30m', priority: 'low', category: 'Interview' }
  ],
  'Full Stack Developer': [
    { id: 't1', text: 'Implement React Hooks state management task', time: '40m', priority: 'high', category: 'Learning' },
    { id: 't2', text: 'Solve 2 DSA problems on LinkedLists', time: '45m', priority: 'high', category: 'DSA' },
    { id: 't3', text: 'Deploy MERN chat application to hosting provider', time: '1h', priority: 'medium', category: 'Project' },
    { id: 't4', text: 'Add verified certificates to LinkedIn profile', time: '15m', priority: 'medium', category: 'Certificates' },
    { id: 't5', text: 'Review Node.js/Express REST interview questions', time: '30m', priority: 'low', category: 'Interview' }
  ]
};

