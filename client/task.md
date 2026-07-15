# Skill Gap Analysis Upgrade — Task Tracker

## Phase 1: Backend Route Upgrade
- `[ ]` Overwrite `/skillgap/analyze` in `skillgap.routes.jsx` to take custom profile fields (Education, Semester, Skills, Resume text, Certs, Goal, Target Company, preferred Stack) and pass them as a structured context block to the Gemini prompt generator.

## Phase 2: Page Header & Analyzer Modal
- `[ ]` Upgrade `SkillGap.jsx` header to include Target Role, Company, Skill Match %, Career Readiness Index, Last Analysis date, and action triggers.
- `[ ]` Build the AI Skill Analyzer customizable form modal gathering: Education, Semester, Existing Skills, Resume Text, Projects links, Certifications, Target Company, and Preferred Tech Stack.

## Phase 3: Scores Grid & Skill Match Matrix
- `[ ]` Expand `CircularProgress` score indices to render 9 circular metrics: Overall Score, Technical Skills, Programming Skills, Development Skills, Problem Solving, Soft Skills, Interview Readiness, Project Readiness, Resume Strength.
- `[ ]` Build the interactive **Skill Match Matrix** component featuring search query inputs, category filters, and sorting parameters (Gap %, priority, difficulty).

## Phase 4: Missing, Strongest & Weakest Skill Cards
- `[ ]` Categorize missing skills by Programming, Frontend, Backend, Database, Cloud/DevOps, AI/ML, System Design, Soft Skills.
- `[ ]` Highlight Strongest skills with top topics, suggested advanced projects, and certifications.
- `[ ]` Detail Weakest skills with required score targets, improvement plan tips, and resources.

## Phase 5: Actionable Improvement Plan & Recommendations
- `[ ]` Render AI Improvement Plan timeline showing daily tasks, weekly milestones, monthly checkmarks, and revision plans.
- `[ ]` Mapped dynamic learning recommendations & phase capstone projects to matching skill gaps.
- `[ ]` Compare matches across 10 common roles and compile build validation checks.
