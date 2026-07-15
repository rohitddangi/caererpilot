import { Brain, Briefcase, GraduationCap, LineChart, Medal, MessageSquare, ShieldCheck, Sparkles, Target, UserRoundCheck, Flag, Compass } from 'lucide-react';

export const navItems = [
  ['Dashboard', '/dashboard', LineChart],
  ['Command Center', '/command-center', Compass],
  ['Roadmap', '/roadmap', Target],
  ['Skill Gap', '/skill-gap', Sparkles],
  ['Interview Prep', '/interview', UserRoundCheck],
  ['AI Chatbot', '/chatbot', MessageSquare],
  ['Jobs', '/jobs', Briefcase],
  ['Learning Hub', '/learning', GraduationCap],
  ['Certificates', '/certificates', Medal],
  ['Progress', '/progress', Brain],
  ['Career Goals', '/goals', Flag],
];

export const progressData = [
  { name: 'Readiness', value: 75 },
  { name: 'Skills', value: 68 },
  { name: 'Interview', value: 74 },
  { name: 'Projects', value: 59 },
];

export const weeklyData = [
  { day: 'Mon', skills: 4, interviews: 2 },
  { day: 'Tue', skills: 5, interviews: 1 },
  { day: 'Wed', skills: 8, interviews: 3 },
  { day: 'Thu', skills: 6, interviews: 4 },
  { day: 'Fri', skills: 9, interviews: 3 },
  { day: 'Sat', skills: 7, interviews: 5 },
  { day: 'Sun', skills: 10, interviews: 4 },
];

export const jobs = [
  { title: 'AI Engineering Intern', company: 'NeuroStack Labs', match: 94, type: 'Internship', status: 'Saved' },
  { title: 'Full Stack Developer', company: 'OrbitCloud', match: 87, type: 'Full-time', status: 'Applied' },
  { title: 'ML Research Intern', company: 'DataForge AI', match: 82, type: 'Internship', status: 'Tracking' },
  { title: 'Cloud Engineer Trainee', company: 'SkyGrid Systems', match: 78, type: 'Trainee', status: 'Bookmarked' },
];

export const courses = [
  { title: 'Machine Learning Specialization', tech: 'AI', level: 'Intermediate', type: 'Course' },
  { title: 'System Design for Developers', tech: 'Full Stack', level: 'Advanced', type: 'Documentation' },
  { title: 'React Production Patterns', tech: 'Frontend', level: 'Intermediate', type: 'YouTube' },
  { title: 'AWS Cloud Practitioner', tech: 'Cloud', level: 'Beginner', type: 'Certification' },
  { title: 'Cybersecurity Fundamentals', tech: 'Security', level: 'Beginner', type: 'Course' },
];

export const roadmapRoles = ['AI Engineer', 'Full Stack Developer', 'Data Scientist', 'ML Engineer', 'Software Engineer', 'Cyber Security Engineer', 'Cloud Engineer'];
