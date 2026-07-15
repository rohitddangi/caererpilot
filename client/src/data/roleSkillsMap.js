// ─── Centralized Role → Skills Mapping ────────────────────────────────────────
// Single source of truth — replaces duplicated maps in Dashboard, HeroSection,
// SkillsProgressTracker, SkillGapSnapshot, LearningProgressWidget, etc.

export const ROLE_SKILLS_MAP = {
  'AI/ML Engineer': [
    'Python', 'TensorFlow', 'PyTorch', 'Docker', 'AWS', 'MLflow',
    'Kubernetes', 'MongoDB', 'FastAPI', 'SQL', 'Git', 'NumPy', 'Pandas',
  ],
  'Full Stack Developer': [
    'React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'HTML',
    'CSS', 'Git', 'Docker', 'AWS', 'TypeScript', 'TailwindCSS',
  ],
  'Data Scientist': [
    'Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Scikit-Learn',
    'Tableau', 'PowerBI', 'Hadoop', 'Git', 'Data Modeling',
  ],
  'ML Engineer': [
    'Python', 'TensorFlow', 'PyTorch', 'Docker', 'AWS', 'MLflow',
    'Kubernetes', 'MongoDB', 'FastAPI', 'SQL', 'Git',
  ],
  'Software Engineer': [
    'Java', 'C++', 'Python', 'Go', 'Git', 'Docker', 'SQL',
    'Data Structures', 'Algorithms', 'System Design',
  ],
  'Cyber Security Engineer': [
    'Linux', 'Python', 'Networking', 'Wireshark', 'Metasploit',
    'Nmap', 'Cryptography', 'SIEM', 'Firewalls',
  ],
  'Cloud Engineer': [
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
    'Linux', 'Python', 'Bash', 'CI/CD', 'Git',
  ],
};

const DEFAULT_ROLE = 'Full Stack Developer';

/** Get the required skills array for a given role. Falls back to Full Stack Developer. */
export function getRequiredSkills(role) {
  return ROLE_SKILLS_MAP[role] || ROLE_SKILLS_MAP[DEFAULT_ROLE];
}

/** Get skills the user is missing for their target role. */
export function getMissingSkills(role, currentSkills = []) {
  const required = getRequiredSkills(role);
  const lower = currentSkills.map(s => s.toLowerCase());
  return required.filter(s => !lower.includes(s.toLowerCase()));
}

/** Get matched skills for a role. */
export function getMatchedSkills(role, currentSkills = []) {
  const required = getRequiredSkills(role);
  return currentSkills.filter(s =>
    required.some(rs => rs.toLowerCase() === s.toLowerCase())
  );
}

/** Get skill match percentage (0–100). */
export function getSkillMatchPercent(role, currentSkills = []) {
  const required = getRequiredSkills(role);
  if (required.length === 0) return 0;
  const matched = getMatchedSkills(role, currentSkills);
  return Math.round((matched.length / required.length) * 100);
}

// ─── Learning Track Topics ────────────────────────────────────────────────────
export const LEARNING_TRACKS = {
  'AI/ML Engineer': [
    { id: 'python-basics', title: 'Python Fundamentals', hours: 8 },
    { id: 'math-ml', title: 'Mathematics for Machine Learning', hours: 12 },
    { id: 'numpy-pandas', title: 'Data Manipulation (NumPy/Pandas)', hours: 10 },
    { id: 'scikit-learn', title: 'Classical ML with Scikit-Learn', hours: 15 },
    { id: 'deep-learning', title: 'Deep Learning Basics (PyTorch)', hours: 25 },
    { id: 'fastapi-deployment', title: 'FastAPI Microservice Deployment', hours: 12 },
  ],
  'Full Stack Developer': [
    { id: 'html-css', title: 'Semantic HTML & Advanced CSS', hours: 8 },
    { id: 'modern-javascript', title: 'Modern JavaScript (ES6+)', hours: 10 },
    { id: 'react-basics', title: 'React Hooks & State Management', hours: 16 },
    { id: 'nodejs-express', title: 'REST APIs with Node & Express', hours: 14 },
    { id: 'mongodb-mongoose', title: 'Database Modeling with MongoDB', hours: 12 },
    { id: 'docker-deployment', title: 'Vite Production Deployment & Docker', hours: 10 },
  ],
  'Data Scientist': [
    { id: 'python-ds', title: 'Python for Data Science', hours: 10 },
    { id: 'stats', title: 'Statistics & Probability', hours: 14 },
    { id: 'pandas-mastery', title: 'Pandas Data Wrangling', hours: 12 },
    { id: 'visualization', title: 'Data Visualization (Matplotlib/Seaborn)', hours: 8 },
    { id: 'ml-sklearn', title: 'Machine Learning with Scikit-Learn', hours: 20 },
    { id: 'sql-analytics', title: 'SQL for Analytics', hours: 10 },
  ],
  'Software Engineer': [
    { id: 'dsa-basics', title: 'Data Structures Fundamentals', hours: 20 },
    { id: 'algorithms', title: 'Algorithm Design & Analysis', hours: 25 },
    { id: 'system-design', title: 'System Design Principles', hours: 18 },
    { id: 'oop', title: 'Object-Oriented Programming', hours: 12 },
    { id: 'git-advanced', title: 'Git Workflows & CI/CD', hours: 8 },
    { id: 'testing', title: 'Testing & Quality Assurance', hours: 10 },
  ],
  'Cloud Engineer': [
    { id: 'aws-foundations', title: 'AWS Cloud Foundations', hours: 15 },
    { id: 'docker-k8s', title: 'Docker & Kubernetes', hours: 20 },
    { id: 'terraform', title: 'Infrastructure as Code (Terraform)', hours: 14 },
    { id: 'linux-admin', title: 'Linux System Administration', hours: 12 },
    { id: 'networking', title: 'Cloud Networking & Security', hours: 10 },
    { id: 'cicd', title: 'CI/CD Pipelines', hours: 8 },
  ],
};

/** Get learning track topics for a role. */
export function getLearningTrack(role) {
  return LEARNING_TRACKS[role] || LEARNING_TRACKS['Full Stack Developer'];
}

// ─── Certification Recommendations ────────────────────────────────────────────
export const CERT_RECOMMENDATIONS = {
  'AI/ML Engineer': [
    { name: 'AWS Certified Machine Learning', provider: 'Amazon Web Services', relevance: 'High' },
    { name: 'Google Cloud Professional ML Engineer', provider: 'Google Cloud', relevance: 'High' },
    { name: 'TensorFlow Developer Certificate', provider: 'Google', relevance: 'Medium' },
  ],
  'Full Stack Developer': [
    { name: 'AWS Certified Cloud Practitioner', provider: 'Amazon Web Services', relevance: 'High' },
    { name: 'Meta Front-End Developer', provider: 'Meta (Coursera)', relevance: 'High' },
    { name: 'MongoDB Developer Certification', provider: 'MongoDB University', relevance: 'Medium' },
  ],
  'Data Scientist': [
    { name: 'IBM Data Science Professional', provider: 'IBM (Coursera)', relevance: 'High' },
    { name: 'Google Data Analytics', provider: 'Google (Coursera)', relevance: 'High' },
    { name: 'Tableau Desktop Specialist', provider: 'Tableau', relevance: 'Medium' },
  ],
  'Software Engineer': [
    { name: 'AWS Certified Developer', provider: 'Amazon Web Services', relevance: 'High' },
    { name: 'Oracle Java Certification', provider: 'Oracle', relevance: 'Medium' },
    { name: 'Google Associate Cloud Engineer', provider: 'Google Cloud', relevance: 'Medium' },
  ],
  'Cloud Engineer': [
    { name: 'AWS Solutions Architect', provider: 'Amazon Web Services', relevance: 'High' },
    { name: 'Certified Kubernetes Administrator', provider: 'CNCF', relevance: 'High' },
    { name: 'HashiCorp Terraform Associate', provider: 'HashiCorp', relevance: 'Medium' },
  ],
  'Cyber Security Engineer': [
    { name: 'CompTIA Security+', provider: 'CompTIA', relevance: 'High' },
    { name: 'Certified Ethical Hacker (CEH)', provider: 'EC-Council', relevance: 'High' },
    { name: 'AWS Security Specialty', provider: 'Amazon Web Services', relevance: 'Medium' },
  ],
  'ML Engineer': [
    { name: 'AWS Certified Machine Learning', provider: 'Amazon Web Services', relevance: 'High' },
    { name: 'Google Cloud Professional ML Engineer', provider: 'Google Cloud', relevance: 'High' },
    { name: 'MLflow Certified Associate', provider: 'Databricks', relevance: 'Medium' },
  ],
};

/** Get cert recommendations for a role. */
export function getCertRecommendations(role) {
  return CERT_RECOMMENDATIONS[role] || CERT_RECOMMENDATIONS['Full Stack Developer'];
}
