import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getSkillMatchPercent, getMissingSkills, getMatchedSkills, getRequiredSkills } from '../data/roleSkillsMap.js';

/**
 * useDashboardData — computes all dashboard metrics from user context.
 * Centralizes the calculation logic that was previously duplicated across
 * Dashboard.jsx, HeroSection.jsx, and other components.
 */
export default function useDashboardData() {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        targetRole: 'Full Stack Developer',
        currentSkills: [],
        requiredSkills: [],
        matchedSkills: [],
        missingSkills: [],
        skillProgress: 0,
        profileCompletion: 0,
        actionsCompleted: 0,
        resumeScore: 0,
        interviewScore: 0,
        projectsCount: 0,
        certsCount: 0,
        projectsScore: 0,
        certsScore: 0,
        githubScore: 0,
        appsScore: 0,
        appsCount: 0,
        readinessScore: 0,
        readinessStatus: 'gap',
        estimatedMonths: 6,
        streakCurrent: 0,
        streakBest: 0,
        learningHours: 0,
        completedTopics: 0,
        careerHealthScore: 0,
        breakdown: [],
        greeting: getGreeting(),
        motivationalMessage: 'Welcome to CareerPilot AI! Get started by setting your target role, configuring your skills, and uploading your resume.',
      };
    }

    const targetRole = user.profile?.targetRole || 'Full Stack Developer';
    const currentSkills = user.profile?.skills || [];
    const required = getRequiredSkills(targetRole);
    const matched = getMatchedSkills(targetRole, currentSkills);
    const missing = getMissingSkills(targetRole, currentSkills);
    const skillProgress = getSkillMatchPercent(targetRole, currentSkills);

    // Profile completion
    let profileCompletion = 20; // Base for having an account
    if (user.profile?.bio) profileCompletion += 10;
    if (user.profile?.targetRole) profileCompletion += 15;
    if (currentSkills.length > 0) profileCompletion += 15;
    if (user.profile?.projects?.length > 0) profileCompletion += 15;
    if (user.profile?.experience) profileCompletion += 10;
    if (user.profile?.education) profileCompletion += 15;
    profileCompletion = Math.min(100, profileCompletion);

    // Actions completed
    const actionsCompleted = user.xp ? Math.min(99, Math.floor(user.xp / 10)) : 0;

    // Sub-scores
    const resumeScore = user.profile?.resumeScore || 0;
    const interviewScore = user.profile?.interviewScore || 0;
    const projectsCount = user.profile?.projects?.length || 0;
    const certsCount = user.certificates?.length || user.profile?.certifications?.length || 0;
    const projectsScore = Math.min(100, projectsCount * 25);
    const certsScore = Math.min(100, certsCount * 25);
    const githubScore = user.profile?.github ? 80 : 0;
    const appsCount = user.jobApplications?.length || 0;
    const appsScore = Math.min(100, appsCount * 20);

    // Career readiness breakdown
    const breakdown = [
      { label: 'Resume ATS Score', score: resumeScore, weight: 20, description: 'Measures standard recruiter filter readability.' },
      { label: 'Skills Alignment', score: skillProgress, weight: 20, description: 'Matches active stack against role demands.' },
      { label: 'Project Strength', score: projectsScore, weight: 18, description: 'Calibrates portfolio quantity and live hosts.' },
      { label: 'Certifications', score: certsScore, weight: 12, description: 'Credentials verified in certificates locker.' },
      { label: 'GitHub Activity', score: githubScore, weight: 12, description: 'Checks open-source linking states.' },
      { label: 'Interview Prep', score: interviewScore, weight: 10, description: 'Scored by AI simulator technical assessments.' },
      { label: 'Job Applications', score: appsScore, weight: 8, description: 'Tracks application submissions.' },
    ];

    const readinessScore = Math.round(
      breakdown.reduce((sum, item) => sum + item.score * (item.weight / 100), 0)
    );

    const readinessStatus = readinessScore >= 75 ? 'ready' : readinessScore >= 40 ? 'improving' : 'gap';
    const estimatedMonths = Math.max(1, Math.ceil((100 - readinessScore) / 20));

    // Streak
    const streakCurrent = user.streak?.current || 0;
    const streakBest = user.streak?.best || 0;

    // Learning
    const completedTopics = user.completedTopics?.length || 0;
    const learningHours = completedTopics * 3; // Approximate 3 hrs per topic

    // Career Health Score (composite of all sub-scores)
    const careerHealthScore = Math.round(
      (resumeScore * 0.18) +
      (skillProgress * 0.20) +
      (projectsScore * 0.15) +
      (certsScore * 0.10) +
      (githubScore * 0.10) +
      (interviewScore * 0.12) +
      (appsScore * 0.05) +
      (Math.min(100, streakCurrent * 5) * 0.05) +
      (Math.min(100, profileCompletion) * 0.05)
    );

    // Motivational message
    let motivationalMessage;
    if (readinessScore === 0) {
      motivationalMessage = 'Welcome to CareerPilot AI! Get started by setting your target role, configuring your skills, and uploading your resume to analyze your ATS score.';
    } else if (readinessScore < 40) {
      motivationalMessage = 'You\'re taking your first steps! Try adding at least 3 projects and completing a mock interview to boost your readiness score.';
    } else if (readinessScore < 75) {
      motivationalMessage = 'Making great progress! Focus on bridging your high-priority skill gaps and practicing technical interviews to cross the 75% job-ready threshold.';
    } else {
      motivationalMessage = 'Amazing work! You\'ve crossed the job-ready threshold. Start applying to matching jobs and keep your coding streak active!';
    }

    return {
      targetRole,
      currentSkills,
      requiredSkills: required,
      matchedSkills: matched,
      missingSkills: missing,
      skillProgress,
      profileCompletion,
      actionsCompleted,
      resumeScore,
      interviewScore,
      projectsCount,
      certsCount,
      projectsScore,
      certsScore,
      githubScore,
      appsScore,
      appsCount,
      readinessScore,
      readinessStatus,
      estimatedMonths,
      streakCurrent,
      streakBest,
      learningHours,
      completedTopics,
      careerHealthScore,
      breakdown,
      greeting: getGreeting(),
      motivationalMessage,
    };
  }, [user]);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
