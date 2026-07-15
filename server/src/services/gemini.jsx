import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Rich fallback data for when Gemini API key is missing ────────────────────
const fallback = {
  jobMatch: {
    jobs: [
      {
        id: 'job-react-1',
        title: 'React & Frontend Developer Intern',
        company: 'Vercel',
        type: 'Internship',
        location: 'Bengaluru (Remote)',
        salary: '₹35,000 – ₹45,000 / month',
        experience: 'Freshers',
        description: 'Collaborate with the Next.js DX team to build high-performance client panels and dashboard layouts. Focus on speed index optimizations, lazy loading structures, and accessible design systems.',
        matchScore: 88,
        atsScore: 82,
        hiringProbability: 78,
        missingSkills: ['Next.js App Router'],
        url: 'https://vercel.com/careers',
        urgent: true
      },
      {
        id: 'job-node-2',
        title: 'Junior Backend Engineer (Node.js)',
        company: 'Razorpay',
        type: 'Full Time',
        location: 'Mumbai (Hybrid)',
        salary: '₹8 – ₹12 LPA',
        experience: '0 - 2 years',
        description: 'Design robust APIs and scalable payment webhook processors using Express, Redis caching pipelines, and MongoDB cluster environments. Implement rate-limiting and JWT protocols.',
        matchScore: 74,
        atsScore: 68,
        hiringProbability: 65,
        missingSkills: ['Redis Caching', 'Docker'],
        url: 'https://razorpay.com/careers',
        urgent: false
      },
      {
        id: 'job-ml-3',
        title: 'Machine Learning Research Engineer Intern',
        company: 'Google Careers',
        type: 'Internship',
        location: 'Bengaluru',
        salary: '₹60,000 / month',
        experience: 'Freshers',
        description: 'Design and fine-tune large language models and retrieval-augmented generation pipelines for NLP products. Experience with PyTorch or TensorFlow, vector indexing, and python scripts.',
        matchScore: 35,
        atsScore: 40,
        hiringProbability: 25,
        missingSkills: ['PyTorch', 'Vector Databases', 'TensorFlow'],
        url: 'https://careers.google.com',
        urgent: false
      },
      {
        id: 'job-full-4',
        title: 'Associate Full Stack Developer',
        company: 'Atlassian',
        type: 'Full Time',
        location: 'Bengaluru (Remote)',
        salary: '₹14 – ₹18 LPA',
        experience: '1 - 3 years',
        description: 'Maintain and scale Jira workspace features using React, Node.js, and PostgreSQL. Implement strict typing setups, CI/CD pipelines, and connection pooling protocols.',
        matchScore: 82,
        atsScore: 85,
        hiringProbability: 80,
        missingSkills: ['TypeScript', 'CI/CD'],
        url: 'https://www.atlassian.com/careers',
        urgent: true
      },
      {
        id: 'job-freelance-5',
        title: 'MERN E-Commerce Dashboard System',
        company: 'Upwork',
        type: 'Freelance',
        location: 'Remote',
        salary: '₹80,000 (Fixed Budget)',
        experience: 'Freshers & Experienced',
        description: 'Develop a responsive admin control panel for a multi-vendor retail store. Setup secure checkout integrations, order telemetry boards, and custom image upload mechanisms.',
        matchScore: 90,
        atsScore: 88,
        hiringProbability: 85,
        missingSkills: [],
        url: 'https://www.upwork.com',
        urgent: false
      },
      {
        id: 'job-freelance-6',
        title: 'FastAPI AI Agent Integration Script',
        company: 'Fiverr',
        type: 'Freelance',
        location: 'Remote',
        salary: '₹40,000 (Fixed Budget)',
        experience: 'Freshers & Experienced',
        description: 'Build a Python FastAPI microservice that extracts PDF document structures and streams text completion calls using the Gemini API. Must include rate-limiting and unit tests.',
        matchScore: 50,
        atsScore: 45,
        hiringProbability: 40,
        missingSkills: ['Python', 'FastAPI', 'Gemini API'],
        url: 'https://www.fiverr.com',
        urgent: false
      }
    ]
  },
  learningPath: {
    recommended: [
      { id: 'path-fs', topic: 'Next.js App Router & State', track: 'Full Stack', estimatedHours: 24 },
      { id: 'path-db', topic: 'PostgreSQL & Prisma ORM', track: 'Full Stack', estimatedHours: 18 },
      { id: 'path-cache', topic: 'Redis Caching & Queues', track: 'Full Stack', estimatedHours: 12 },
      { id: 'path-ml', topic: 'Agentic RAG & LangChain', track: 'AI-ML', estimatedHours: 30 }
    ]
  },
  learningTrack: {
    title: 'Full-Stack Developer Specialization',
    description: 'Master advanced frontend routing, state architectures, relational databases scaling, and key-value cache layer invalidations.',
    totalHours: 54,
    phases: [
      {
        id: 'phase-1',
        title: 'Phase 1: Modern Frontend & TypeScript',
        topics: [
          {
            id: 'topic-rsc',
            title: 'Next.js App Router & RSC',
            hours: 12,
            difficulty: 'Intermediate',
            resources: [
              { title: 'Next.js Official Documentation', type: 'documentation', url: 'https://nextjs.org/docs', free: true },
              { title: 'Harvard CS50 Web Programming', type: 'video', url: 'https://youtube.com', free: true }
            ]
          },
          {
            id: 'topic-ts',
            title: 'TypeScript strict mode & interfaces',
            hours: 8,
            difficulty: 'Beginner',
            resources: [
              { title: 'TypeScript Handbook', type: 'documentation', url: 'https://typescriptlang.org', free: true }
            ]
          }
        ]
      },
      {
        id: 'phase-2',
        title: 'Phase 2: Database Scaling & Caching',
        topics: [
          {
            id: 'topic-prisma',
            title: 'PostgreSQL & Prisma connection pools',
            hours: 14,
            difficulty: 'Intermediate',
            resources: [
              { title: 'Prisma Client Guides', type: 'documentation', url: 'https://prisma.io', free: true }
            ]
          },
          {
            id: 'topic-redis',
            title: 'Redis key-value invalidation TTL',
            hours: 10,
            difficulty: 'Advanced',
            resources: [
              { title: 'Redis Developers Guides', type: 'documentation', url: 'https://redis.io', free: true }
            ]
          }
        ]
      }
    ]
  },
  projectMentor: {
    projectName: 'E-Commerce Platform',
    description: 'A scalable full-stack e-commerce store with real-time inventory management and payment integration.',
    techStack: {
      frontend: ['React', 'Tailwind CSS', 'Redux Toolkit'],
      backend: ['Node.js', 'Express', 'TypeScript'],
      database: ['PostgreSQL', 'Redis'],
      devops: ['Docker', 'AWS S3', 'GitHub Actions']
    },
    databaseDesign: {
      type: 'Relational',
      description: 'A normalized PostgreSQL schema ensuring data integrity for orders, users, and products.',
      tablesOrCollections: [
        {
          name: 'users',
          fields: [
            { name: 'id', type: 'UUID', description: 'Primary key' },
            { name: 'email', type: 'VARCHAR', description: 'Unique user email' },
            { name: 'password', type: 'VARCHAR', description: 'Hashed password' }
          ],
          relationships: ['One-to-Many with orders']
        },
        {
          name: 'products',
          fields: [
            { name: 'id', type: 'UUID', description: 'Primary key' },
            { name: 'name', type: 'VARCHAR', description: 'Product name' },
            { name: 'price', type: 'NUMERIC', description: 'Product price' },
            { name: 'stock', type: 'INTEGER', description: 'Current inventory quantity' }
          ],
          relationships: ['Many-to-Many with orders through order_items']
        }
      ]
    },
    apiStructure: {
      endpoints: [
        { method: 'POST', path: '/api/auth/register', description: 'Registers a new user', requestBody: '{ email, password, name }', responseBody: '{ token, user }' },
        { method: 'GET', path: '/api/products', description: 'Fetches list of products', requestBody: 'none', responseBody: '[{ id, name, price, stock }]' },
        { method: 'POST', path: '/api/orders', description: 'Creates a product order', requestBody: '{ items: [{ productId, quantity }] }', responseBody: '{ orderId, total, status }' }
      ]
    },
    folderStructure: {
      tree: 'root/\n├── client/\n│   ├── src/\n│   │   ├── components/\n│   │   ├── pages/\n│   │   └── store/\n├── server/\n│   ├── src/\n│   │   ├── controllers/\n│   │   ├── models/\n│   │   └── routes/\n└── package.json'
    },
    developmentRoadmap: [
      { phase: 'Phase 1: Database & Auth Setup', tasks: ['Design schema and run initial migrations', 'Implement JWT auth register and login APIs'] },
      { phase: 'Phase 2: Product & Cart Flow', tasks: ['Build products listing page and cart state management', 'Create order creation logic and transaction handlers'] }
    ],
    deploymentStrategy: {
      hosting: 'AWS App Runner + RDS PostgreSQL',
      steps: [
        'Containerize both client and server code using Dockerfiles.',
        'Configure database connection pool inside VPC.',
        'Set up GitHub Actions to push images to ECR and deploy.'
      ]
    }
  },

  industryTrends: {
    trendingSkills: [
      { name: 'TypeScript', growthRate: '+24% YoY', demandIndex: '9.2/10' },
      { name: 'Agentic Workflows', growthRate: '+45% YoY', demandIndex: '8.8/10' },
      { name: 'Vector Database Indexing', growthRate: '+38% YoY', demandIndex: '8.5/10' },
      { name: 'Docker Containerization', growthRate: '+15% YoY', demandIndex: '8.1/10' }
    ],
    trendingTechnologies: [
      { name: 'Next.js App Router', category: 'Frontend', description: 'React framework using Server Components and Server Actions for data fetching.' },
      { name: 'LangGraph', category: 'AI/ML', description: 'Orchestrating agentic LLM systems with loops, branches, and memory.' },
      { name: 'PostgreSQL pgvector', category: 'Database', description: 'Storing vector embeddings directly inside relational schemas for semantic search.' }
    ],
    mostDemandedJobs: [
      { title: 'Full Stack Engineer', openings: '12,500+ open roles', topCompanies: ['Vercel', 'Stripe', 'Atlassian'] },
      { title: 'AI/ML Platform Engineer', openings: '8,400+ open roles', topCompanies: ['OpenAI', 'Google', 'Anthropic'] },
      { title: 'Cloud Infrastructure Architect', openings: '6,200+ open roles', topCompanies: ['AWS', 'Datadog', 'HashiCorp'] }
    ],
    salaryInsights: [
      { role: 'Full Stack Developer', entryLevel: '₹6 – 10 LPA', midLevel: '₹12 – 18 LPA', seniorLevel: '₹22 – 35+ LPA' },
      { role: 'AI/ML Engineer', entryLevel: '₹8 – 12 LPA', midLevel: '₹15 – 24 LPA', seniorLevel: '₹28 – 45+ LPA' },
      { role: 'Cloud Engineer', entryLevel: '₹5 – 8 LPA', midLevel: '₹10 – 16 LPA', seniorLevel: '₹20 – 30+ LPA' }
    ],
    futureOpportunities: [
      { trend: 'SaaS AI Native features', description: 'Every traditional CRUD SaaS is adding AI copilots, semantic search, and autocomplete agents.', timeframe: '1-2 years' },
      { trend: 'Edge Computing deployments', description: 'Moving heavy model inference and API endpoints closer to the user to reduce latency.', timeframe: '3-5 years' }
    ]
  },

  roadmap: {
    learningPath: ['Programming fundamentals', 'Data structures', 'Core role stack', 'AI-assisted portfolio', 'Interview preparation'],
    skillsRequired: ['Problem solving', 'Cloud basics', 'APIs', 'Testing', 'System design'],
    projectsRequired: ['Career AI assistant', 'Analytics dashboard', 'Realtime collaboration tool'],
    certifications: ['Cloud fundamentals', 'Role-specific specialization'],
    interviewPreparationPath: ['DSA basics', 'Project storytelling', 'Mock interviews', 'Behavioral frameworks'],
  },
  skillGap: {
    missingSkills: ['TypeScript', 'Docker', 'System Design', 'CI/CD'],
    requiredTechnologies: ['React', 'Node.js', 'MongoDB', 'Gemini API'],
    learningRecommendations: ['Build one deployed full stack app', 'Practice architecture tradeoffs', 'Add automated tests'],
    priorityRanking: ['System Design', 'TypeScript', 'Docker', 'CI/CD'],
  },
  interview: {
    technicalQuestions: ['Explain REST vs GraphQL.', 'How do indexes improve MongoDB queries?', 'Design a resume analyzer.'],
    hrQuestions: ['Why this role?', 'What motivates you?', 'Describe your strengths.'],
    behavioralQuestions: ['Tell me about a difficult project.', 'Describe a time you handled feedback.'],
    feedback: 'Answer with structure, measurable impact, and tradeoffs.',
    interviewScore: 84,
  },
  roadmapDeepFullStack: {
    targetRole: 'Full Stack Developer',
    currentProfile: {
      level: 'Beginner',
      strengths: ['Basic HTML/CSS layouts', 'Familiar with JavaScript logic', 'Fager to build projects'],
      weaknesses: ['No backend integration experience', 'Missing databases (SQL/NoSQL) knowledge', 'No cloud deployment credentials']
    },
    skillGap: {
      currentSkills: ['HTML', 'CSS', 'JavaScript', 'Git'],
      requiredSkills: ['TypeScript', 'Next.js', 'PostgreSQL', 'Prisma ORM', 'Docker', 'Redis'],
      missingSkills: ['TypeScript', 'Next.js', 'PostgreSQL', 'Prisma ORM', 'Docker', 'Redis'],
      learningPriorities: ['TypeScript Strict Mode', 'Next.js App Router & Server Actions', 'Prisma Database Hookups', 'Redis Cache Architectures', 'Docker Container Deployment']
    },
    gamification: {
      level: 1,
      levelName: 'Beginner',
      xp: 0,
      streak: { current: 1, best: 1 }
    },
    timeEstimation: {
      skillCompletion: '4 Weeks',
      roadmapCompletion: '3 Months',
      internshipReadiness: '2 Months',
      placementReadiness: '4 Months'
    },
    dailyPlan: {
      tasks: [
        'Complete React Server Components & Routing modules',
        'Solve 3 SQL query optimization exercises on LeetCode',
        'Configure Prisma Schema with relations & constraints',
        'Push local changes to Docker container registry'
      ],
      estimatedHours: 3.0
    },
    weeklyGoals: [
      'Week 1: TypeScript transition and strict typing configurations',
      'Week 2: Next.js App Router, RSC, and dynamic segment structures',
      'Week 3: PostgreSQL schemas, Prisma migrations, and connection pools',
      'Week 4: Redis caching pipelines and memory storage optimization'
    ],
    monthlyMilestones: [
      'Month 1: Modern Frontend & TypeScript Mastery',
      'Month 2: Relational Databases, ORM, & Cache Scaling',
      'Month 3: Containerization, CI/CD pipelines, & AWS Deployment'
    ],
    recommendedCertifications: [
      { name: 'Vercel Next.js Professional Certification', provider: 'Vercel Inc.', relevance: 'Very High' },
      { name: 'AWS Certified Developer - Associate', provider: 'Amazon Web Services', relevance: 'High' }
    ],
    jobMarket: {
      demand: [
        { name: 'Next.js', status: 'Very High' },
        { name: 'TypeScript', status: 'Very High' },
        { name: 'PostgreSQL', status: 'High' },
        { name: 'Docker', status: 'Growing' }
      ],
      salaryTrend: 'Core Full Stack roles range from ₹8 – ₹15 LPA entry-level range.',
      hiringProbability: '92%'
    },
    readiness: {
      internship: 52,
      placement: 38
    },
    careerPredictions: {
      internshipDate: 'August 2026',
      placementDate: 'October 2026',
      expectedGrowth: '28% increase in TypeScript/Next.js vacancies'
    },
    interviewPrep: {
      technical: [
        'Explain React Server Components vs Client Components in Next.js.',
        'How do you manage connection pooling in Prisma with PostgreSQL?',
        'What is cache invalidation and how do you implement it in Redis?'
      ],
      hr: [
        'Why did you choose Next.js and PostgreSQL as your target stack?',
        'Talk about a complex database query optimization you performed.'
      ],
      companyPrep: 'Prepare advanced Next.js server optimization queries for OrbitCloud and NeuroStack.'
    },
    projectRecommendations: [
      { name: 'Real-Time SaaS Analytics Dashboard', level: 'Advanced', tech: 'Next.js, Tailwind, Recharts, PostgreSQL, Redis', description: 'Interactive dashboard parsing real-time analytics using WebSockets, with Redis caching and PostgreSQL indices.' },
      { name: 'Collaborative Board Planner', level: 'Intermediate', tech: 'Next.js, TypeScript, Prisma, PostgreSQL, Tailwind', description: 'Board coordination application featuring drag-and-drop mechanics, strict typing, and multi-user sync.' },
      { name: 'SaaS E-Commerce Engine', level: 'Advanced', tech: 'Next.js, Stripe, Prisma, PostgreSQL, Docker', description: 'Fully scalable e-commerce SaaS engine complete with subscription mechanics, checkout sessions, and containerized dev systems.' }
    ],
    skillTree: [
      {
        phase: 'Phase 1: Modern Frontend & TypeScript',
        topics: [
          {
            name: 'Next.js App Router & RSC',
            completed: false,
            description: 'Learn Next.js 14/15 filesystem routing, React Server Components (RSC), and Server Actions for database mutations.',
            modules: ['App Router Directory Routing', 'Server Components vs Client Components', 'Server Actions for Mutations', 'Suspense & Error Borders'],
            resources: [
              { title: 'Next.js Official Documentation', type: 'Documentation', link: 'https://nextjs.org/docs', free: true },
              { title: 'Mastering Next.js App Router', type: 'Video Tutorial', link: 'https://youtube.com', free: true }
            ],
            quiz: [
              { question: 'What is the default component type inside the Next.js App Router?', options: ['Client Component', 'Server Component', 'Context Component'], answer: 'Server Component' },
              { question: 'Which file represents custom fallbacks in Next.js folders?', options: ['fallback.jsx', 'loading.jsx', 'suspense.jsx'], answer: 'loading.jsx' }
            ]
          },
          {
            name: 'TypeScript & State Orchestration',
            completed: false,
            description: 'Transition layouts to strict TypeScript typing and implement lightweight global stores with Zustand.',
            modules: ['Types vs Interfaces in TS', 'Generics & Utility Types', 'Zustand Global Store Setup', 'Local storage synchronization'],
            resources: [
              { title: 'TypeScript Cheat Sheet', type: 'Documentation', link: 'https://typescriptlang.org', free: true }
            ],
            quiz: [
              { question: 'How do you configure strict checks in TypeScript configurations?', options: ['"strict": true', '"checkTypes": true', '"strictMode": true'], answer: '"strict": true' }
            ]
          }
        ]
      },
      {
        phase: 'Phase 2: Database Scaling & APIs',
        topics: [
          {
            name: 'PostgreSQL & Prisma ORM',
            completed: false,
            description: 'Design relational schemas, execute schema migrations, configure indices, and perform join queries.',
            modules: ['Prisma Schema models', 'Relational migrations', 'Database indexing strategies', 'Connection pooling configurations'],
            resources: [
              { title: 'Prisma Client Guide', type: 'Documentation', link: 'https://prisma.io', free: true }
            ],
            quiz: [
              { question: 'Which Prisma CLI command synchronizes database structures and recreates the client?', options: ['prisma db sync', 'prisma migrate dev', 'prisma client update'], answer: 'prisma migrate dev' }
            ]
          },
          {
            name: 'Caching with Redis',
            completed: false,
            description: 'Incorporate memory-caching layers, set cache invalidation lifetimes, and manage queue lists.',
            modules: ['Key-Value basics', 'Time-To-Live (TTL) strategies', 'Caching middlewares', 'Redis Pub/Sub setup'],
            resources: [
              { title: 'Redis Developer Guides', type: 'Documentation', link: 'https://redis.io', free: true }
            ],
            quiz: [
              { question: 'What parameter sets key expiry times in Redis commands?', options: ['EXPIRE', 'TTL', 'DELETE_AFTER'], answer: 'EXPIRE' }
            ]
          }
        ]
      }
    ]
  },
  roadmapDeepAI: {
    targetRole: 'AI/ML Engineer',
    currentProfile: {
      level: 'Beginner',
      strengths: ['Python scripting foundation', 'Familiar with pandas & NumPy', 'Basic scikit-learn models'],
      weaknesses: ['Lacks production RAG pipeline skills', 'No vector database integration experience', 'Missing GPU serving & MLOps deployment knowledge']
    },
    skillGap: {
      currentSkills: ['Python', 'Pandas', 'NumPy', 'Git'],
      requiredSkills: ['PyTorch', 'Transformers (HuggingFace)', 'LangChain', 'Pinecone', 'FastAPI', 'Docker', 'MLflow'],
      missingSkills: ['PyTorch', 'Transformers (HuggingFace)', 'LangChain', 'Pinecone', 'FastAPI', 'Docker', 'MLflow'],
      learningPriorities: ['PyTorch Tensor Operations', 'LangChain Agentic RAG', 'Pinecone Vector Indices', 'HuggingFace PEFT/LoRA Fine-tuning', 'FastAPI GPU Serving Pipelines', 'MLflow Tracking Systems']
    },
    gamification: {
      level: 1,
      levelName: 'Beginner',
      xp: 0,
      streak: { current: 1, best: 1 }
    },
    timeEstimation: {
      skillCompletion: '5 Weeks',
      roadmapCompletion: '3.5 Months',
      internshipReadiness: '2 Months',
      placementReadiness: '4.5 Months'
    },
    dailyPlan: {
      tasks: [
        'Complete LangChain document chunking & parsing exercises',
        'Initialize Pinecone vector index and test query response times',
        'Implement Pydantic prompt validation middleware in FastAPI',
        'Push local HuggingFace wrapper script to Docker registry'
      ],
      estimatedHours: 3.5
    },
    weeklyGoals: [
      'Week 1: PyTorch deep neural networks and gradient optimization workflows',
      'Week 2: Agentic RAG systems, embedding structures, and vector search indices',
      'Week 3: Model fine-tuning protocols, QLoRA adapter setups, and PEFT engines',
      'Week 4: FastAPI model serving, batching optimizations, and CUDA Docker deployments'
    ],
    monthlyMilestones: [
      'Month 1: Deep Learning & PyTorch foundations',
      'Month 2: Generative AI, Embeddings, & Agentic RAG',
      'Month 3: Fine-Tuning, Quantization, & MLOps deployment'
    ],
    recommendedCertifications: [
      { name: 'DeepLearning.AI Generative AI Specialization', provider: 'DeepLearning.AI / Coursera', relevance: 'Very High' },
      { name: 'Google Professional Machine Learning Engineer', provider: 'Google Cloud', relevance: 'Very High' },
      { name: 'AWS Certified Machine Learning - Specialty', provider: 'Amazon Web Services', relevance: 'High' }
    ],
    jobMarket: {
      demand: [
        { name: 'PyTorch', status: 'Very High' },
        { name: 'Agentic RAG / LLMs', status: 'Very High' },
        { name: 'FastAPI / MLOps', status: 'High' },
        { name: 'Vector Databases', status: 'High' }
      ],
      salaryTrend: 'Core AI/ML Engineering roles range from ₹8 – ₹18 LPA entry-level range.',
      hiringProbability: '95%'
    },
    readiness: {
      internship: 55,
      placement: 40
    },
    careerPredictions: {
      internshipDate: 'July 2026',
      placementDate: 'September 2026',
      expectedGrowth: '42% increase in Generative AI / Agentic vacancies'
    },
    interviewPrep: {
      technical: [
        'Explain the mathematical difference between dot product and cosine similarity in vector embeddings.',
        'How does QLoRA reduce the GPU VRAM requirements during model fine-tuning?',
        'Describe request batching and concurrency strategies in FastAPI for model hosting.'
      ],
      hr: [
        'Why do you want to specialize in AI/ML over traditional software engineering?',
        'Talk about a project where you balanced model accuracy with latency requirements.'
      ],
      companyPrep: 'Prepare advanced model quantization & batch hosting queries for NeuroStack and OrbitCloud.'
    },
    projectRecommendations: [
      { name: 'Semantic Knowledge Base & Agentic RAG', level: 'Advanced', tech: 'LangChain, Pinecone, FastAPI, HuggingFace, React', description: 'Multi-source document semantic analyzer integrating LLM agents, memory pipelines, and Pinecone vector database.' },
      { name: 'Quantized LLM Support Assistant', level: 'Intermediate', tech: 'Python, FastAPI, HuggingFace PEFT, Docker, Pydantic', description: 'FastAPI chatbot hosting a quantized Llama-3 model utilizing prompt guardrails and GPU batch inference optimization.' },
      { name: 'MLOps Pipeline tracker', level: 'Advanced', tech: 'PyTorch, MLflow, Docker, GitHub Actions, AWS S3', description: 'Automated CI/CD pipeline training custom model classifiers, pushing metrics to MLflow and registry to S3.' }
    ],
    skillTree: [
      {
        phase: 'Phase 1: Generative AI & Vector Search',
        topics: [
          {
            name: 'Agentic RAG & LangChain',
            completed: false,
            description: 'Build robust Retrieval-Augmented Generation (RAG) structures using chunking models, embedding queries, and vector DB indices.',
            modules: ['Recursive Text Chunking', 'Vector Databases & Pinecone Setup', 'Embedding Queries APIs', 'LangChain Agents with Memory'],
            resources: [
              { title: 'LangChain Concept Guides', type: 'Documentation', link: 'https://python.langchain.com', free: true },
              { title: 'Building Production RAG Systems', type: 'Video Tutorial', link: 'https://youtube.com', free: true }
            ],
            quiz: [
              { question: 'What is the main purpose of chunking in RAG pipelines?', options: ['Reduce GPU costs', 'Ensure text fits LLM context window limits', 'Optimize database connection pools'], answer: 'Ensure text fits LLM context window limits' },
              { question: 'Which index type offers sub-linear approximate nearest neighbor search in Pinecone?', options: ['Flat Index', 'HNSW Index', 'LSH Index'], answer: 'HNSW Index' }
            ]
          },
          {
            name: 'LLM Orchestration & Guardrails',
            completed: false,
            description: 'Orchestrate chat templates, manage model system instructions, and enforce JSON schemas using Pydantic.',
            modules: ['ChatPromptTemplates APIs', 'Function Calling & Tool Use', 'Output Parsing & Pydantic Validation', 'Prompt Injection Guardrails'],
            resources: [
              { title: 'Pydantic V2 Guides', type: 'Documentation', link: 'https://docs.pydantic.dev', free: true }
            ],
            quiz: [
              { question: 'Which library validates LLM JSON outputs directly against custom classes?', options: ['LangChain', 'FastAPI', 'Pydantic'], answer: 'Pydantic' }
            ]
          }
        ]
      },
      {
        phase: 'Phase 2: Deep Learning & Fine-Tuning',
        topics: [
          {
            name: 'PyTorch Neural Networks',
            completed: false,
            description: 'Code custom model layers, manage forward/backward runs, and optimize weights via backpropagation.',
            modules: ['Tensor manipulations', 'Custom layers & nn.Module', 'Loss functions & Optimizer gradients', 'Model checkpointing & loading'],
            resources: [
              { title: 'PyTorch Learning Path', type: 'Documentation', link: 'https://pytorch.org/tutorials', free: true }
            ],
            quiz: [
              { question: 'Which method resets PyTorch optimizer gradients before a new step?', options: ['optimizer.step()', 'optimizer.zero_grad()', 'loss.backward()'], answer: 'optimizer.zero_grad()' }
            ]
          },
          {
            name: 'Model Fine-Tuning & Quantization',
            completed: false,
            description: 'Fine-tune models using Parameter-Efficient Fine-Tuning (PEFT/LoRA) and evaluate model performance against benchmarks.',
            modules: ['LoRA Adapters logic', 'BitsAndBytes Quantization (4-bit)', 'HuggingFace SFTTrainer setup', 'Model Evaluation benchmarks'],
            resources: [
              { title: 'HuggingFace Fine-Tuning Guide', type: 'Documentation', link: 'https://huggingface.co/docs', free: true }
            ],
            quiz: [
              { question: 'What parameter reduces parameter updates by inserting small low-rank matrices?', options: ['LoRA', 'SGD', 'AdamW'], answer: 'LoRA' }
            ]
          }
        ]
      }
    ]
  },
  skillGapDeepFullStack: {
    targetRole: 'Full Stack Developer',
    overallScores: {
      skillMatch: 68,
      projectMatch: 55,
      resumeMatch: 82,
      certificationMatch: 45,
      interviewMatch: 64,
      readiness: 58,
      hiringProbability: 'Medium-High',
      salaryPotential: '₹8 – ₹15 LPA'
    },
    readinessMeters: {
      internship: 65,
      placement: 58,
      dsa: 72,
      core: 68,
      projects: 55,
      communication: 80
    },
    multiRoleMatch: [
      { role: 'Frontend Developer', score: 85 },
      { role: 'Full Stack Developer', score: 68 },
      { role: 'Backend Developer', score: 58 },
      { role: 'Software Engineer', score: 72 },
      { role: 'DevOps Engineer', score: 38 },
      { role: 'AI Engineer', score: 32 }
    ],
    categories: [
      {
        name: 'Programming Languages',
        skills: [
          { name: 'JavaScript', strength: 85, confidence: 80, relevance: 'Very High', level: 'Advanced' },
          { name: 'TypeScript', strength: 40, confidence: 30, relevance: 'Very High', level: 'Beginner' },
          { name: 'Python', strength: 70, confidence: 60, relevance: 'High', level: 'Intermediate' }
        ]
      },
      {
        name: 'Frontend Development',
        skills: [
          { name: 'HTML & CSS', strength: 95, confidence: 90, relevance: 'High', level: 'Advanced' },
          { name: 'React.js', strength: 80, confidence: 75, relevance: 'Very High', level: 'Advanced' },
          { name: 'Next.js', strength: 20, confidence: 15, relevance: 'Very High', level: 'Beginner' },
          { name: 'Tailwind CSS', strength: 85, confidence: 80, relevance: 'High', level: 'Advanced' }
        ]
      },
      {
        name: 'Backend & Databases',
        skills: [
          { name: 'Node.js & Express', strength: 65, confidence: 60, relevance: 'Very High', level: 'Intermediate' },
          { name: 'PostgreSQL', strength: 30, confidence: 25, relevance: 'High', level: 'Beginner' },
          { name: 'MongoDB', strength: 70, confidence: 65, relevance: 'High', level: 'Intermediate' },
          { name: 'Redis', strength: 10, confidence: 10, relevance: 'Moderate', level: 'Beginner' }
        ]
      },
      {
        name: 'DevOps & Cloud',
        skills: [
          { name: 'Docker', strength: 15, confidence: 10, relevance: 'High', level: 'Beginner' },
          { name: 'AWS', strength: 25, confidence: 20, relevance: 'High', level: 'Beginner' },
          { name: 'GitHub Actions', strength: 10, confidence: 5, relevance: 'Moderate', level: 'Beginner' }
        ]
      }
    ],
    gapAnalysis: {
      missingSkills: [
        { name: 'TypeScript', priority: 'High', difficulty: 'Medium', time: '2 Weeks', prerequisites: ['JavaScript'] },
        { name: 'Next.js (App Router)', priority: 'High', difficulty: 'Medium', time: '3 Weeks', prerequisites: ['React.js'] },
        { name: 'PostgreSQL & Prisma', priority: 'High', difficulty: 'Medium', time: '2 Weeks', prerequisites: ['SQL Basics'] },
        { name: 'Docker', priority: 'Medium', difficulty: 'Hard', time: '2 Weeks', prerequisites: ['Linux Basics'] },
        { name: 'Redis Caching', priority: 'Medium', difficulty: 'Medium', time: '1 Week', prerequisites: ['Node.js'] },
        { name: 'AWS App Runner', priority: 'Low', difficulty: 'Hard', time: '3 Weeks', prerequisites: ['Docker', 'Cloud Concepts'] }
      ],
      partiallyLearned: [
        { name: 'Node.js & Express', strength: 65, confidence: 60 },
        { name: 'AWS', strength: 25, confidence: 20 }
      ],
      strongSkills: [
        { name: 'JavaScript', strength: 85, confidence: 80 },
        { name: 'React.js', strength: 80, confidence: 75 },
        { name: 'Tailwind CSS', strength: 85, confidence: 80 }
      ],
      weakSkills: [
        { name: 'TypeScript', strength: 40, confidence: 30 },
        { name: 'PostgreSQL', strength: 30, confidence: 25 }
      ],
      blockers: [
        'Lack of TypeScript strict-mode code implementation in active projects',
        'No production database scaling or pooling validation',
        'Lacks containerized deployment (Docker) configuration files'
      ]
    },
    dependencies: [
      { skill: 'React.js', prereqs: ['JavaScript', 'HTML & CSS'] },
      { skill: 'Next.js', prereqs: ['React.js', 'TypeScript'] },
      { skill: 'TypeScript', prereqs: ['JavaScript'] },
      { skill: 'Prisma ORM', prereqs: ['PostgreSQL'] },
      { skill: 'Redis Caching', prereqs: ['Node.js'] },
      { skill: 'AWS App Runner', prereqs: ['Docker'] }
    ],
    emergingTech: [
      { name: 'AI SDK integration (Vercel)', demandTrend: 'Exploding', salaryImpact: '+15%', futureRelevance: 'Very High' },
      { name: 'WebSockets (Socket.io)', demandTrend: 'Steady', salaryImpact: '+8%', futureRelevance: 'High' },
      { name: 'Vector Embeddings in SQL', demandTrend: 'Rapid Growth', salaryImpact: '+12%', futureRelevance: 'High' }
    ],
    projectGap: {
      currentProjects: [
        { name: 'Weather Dashboard', url: 'github.com/rohit/weather-dashboard', validated: true, score: 78 },
        { name: 'Simple Visual Landing Page', url: 'github.com/rohit/landing-page', validated: false, score: 45 }
      ],
      missingProjects: [
        { name: 'Real-Time SaaS Analytics Dashboard', tech: 'Next.js, Tailwind, Recharts, PostgreSQL, Redis', description: 'Multi-user dashboard displaying metrics using WebSockets, connection pooling, and key expiry caches.' },
        { name: 'Collaborative Document Editor', tech: 'Next.js, TypeScript, Express, WebSockets, MongoDB', description: 'Rich text collaborative workspace showing edits in real-time, matching team workflows.' }
      ]
    },
    certifications: {
      current: ['Meta Front-End Developer'],
      recommended: [
        { name: 'Vercel Next.js Professional Certification', provider: 'Vercel', relevance: 'Very High' },
        { name: 'AWS Certified Developer - Associate', provider: 'Amazon Web Services', relevance: 'High' }
      ]
    },
    companyReadiness: [
      { company: 'Meta', readiness: 58, prepPlan: ['Practice System Design of scaling feed architectures', 'Master React Concurrent mode features', 'Solve 150 LeetCode Medium/Hard questions'] },
      { company: 'OrbitCloud', readiness: 78, prepPlan: ['Prepare Next.js hydration issues details', 'Understand PostgreSQL join optimizations'] },
      { company: 'TCS', readiness: 92, prepPlan: ['Review basic OOP concepts', 'Demonstrate general CSS layout rules'] }
    ],
    marketDemand: [
      { skill: 'Next.js', demandScore: 94, hiringImpact: 88, salaryImpact: 85, futureDemand: 92 },
      { skill: 'TypeScript', demandScore: 92, hiringImpact: 90, salaryImpact: 82, futureDemand: 95 },
      { skill: 'Docker', demandScore: 82, hiringImpact: 78, salaryImpact: 78, futureDemand: 88 },
      { skill: 'PostgreSQL', demandScore: 78, hiringImpact: 74, salaryImpact: 70, futureDemand: 82 }
    ],
    economicImpact: {
      unlockedOpportunities: 1420,
      salaryGrowth: [
        { skill: 'Next.js', increasePercent: 14 },
        { skill: 'TypeScript', increasePercent: 12 },
        { skill: 'Docker', increasePercent: 10 },
        { skill: 'AWS Developer Certification', increasePercent: 18 }
      ]
    },
    learningPath: ['TypeScript', 'Next.js App Router', 'PostgreSQL & Prisma', 'Docker', 'Redis Caching'],
    mentorsAdvice: [
      'Focus on TypeScript transition first. Adding strict typing increases codebase stability and is required by Meta and major startups.',
      'Stop building simple visual landing pages. Shift focus to building the SaaS Analytics Dashboard project to validate PostgreSQL and connection pooling.',
      'Do the Vercel Next.js Professional Badge to easily clear startup technical filter checks.'
    ],
    verificationQuizzes: [
      {
        topic: 'TypeScript',
        quiz: [
          { question: 'What TypeScript configuration parameter disables "any" types?', options: ['"noImplicitAny": true', '"strictNullChecks": true', '"noAny": true'], answer: '"noImplicitAny": true' },
          { question: 'How do you create an immutable type tuple in TS?', options: ['readonly [number, string]', 'const [number, string]', 'fixed [number, string]'], answer: 'readonly [number, string]' }
        ]
      }
    ],
    verificationTasks: [
      {
        id: 'auth-task',
        title: 'Build secure JWT Auth middleware in Express using TypeScript',
        description: 'Implement user login verification verifying JWT signatures, extract payloads, and attach request context.',
        requirements: ['Written in TypeScript', 'Strict typing definitions used', 'Handles token expiry exceptions gracefully'],
        evaluationRubric: 'Strict types (35%), Error handling (35%), Signature validation accuracy (30%)'
      }
    ]
  },
  skillGapDeepAI: {
    targetRole: 'AI/ML Engineer',
    overallScores: {
      skillMatch: 72,
      projectMatch: 64,
      resumeMatch: 80,
      certificationMatch: 52,
      interviewMatch: 68,
      readiness: 66,
      hiringProbability: 'High',
      salaryPotential: '₹10 – ₹20 LPA'
    },
    readinessMeters: {
      internship: 72,
      placement: 66,
      dsa: 78,
      core: 74,
      projects: 64,
      communication: 82
    },
    multiRoleMatch: [
      { role: 'AI Engineer', score: 72 },
      { role: 'Machine Learning Engineer', score: 68 },
      { role: 'Data Scientist', score: 64 },
      { role: 'Software Engineer', score: 70 },
      { role: 'Full Stack Developer', score: 55 },
      { role: 'DevOps Engineer', score: 32 }
    ],
    categories: [
      {
        name: 'Programming Languages',
        skills: [
          { name: 'Python', strength: 92, confidence: 85, relevance: 'Very High', level: 'Advanced' },
          { name: 'SQL', strength: 70, confidence: 65, relevance: 'High', level: 'Intermediate' },
          { name: 'C++', strength: 45, confidence: 35, relevance: 'Moderate', level: 'Beginner' }
        ]
      },
      {
        name: 'AI & Machine Learning',
        skills: [
          { name: 'scikit-learn', strength: 85, confidence: 80, relevance: 'Very High', level: 'Advanced' },
          { name: 'PyTorch', strength: 40, confidence: 30, relevance: 'Very High', level: 'Beginner' },
          { name: 'TensorFlow', strength: 75, confidence: 68, relevance: 'High', level: 'Intermediate' }
        ]
      },
      {
        name: 'Generative AI & NLP',
        skills: [
          { name: 'LangChain', strength: 25, confidence: 20, relevance: 'Very High', level: 'Beginner' },
          { name: 'Pinecone (Vector DB)', strength: 30, confidence: 25, relevance: 'Very High', level: 'Beginner' },
          { name: 'HuggingFace API', strength: 60, confidence: 55, relevance: 'High', level: 'Intermediate' }
        ]
      },
      {
        name: 'MLOps & DevOps',
        skills: [
          { name: 'Docker', strength: 20, confidence: 15, relevance: 'High', level: 'Beginner' },
          { name: 'FastAPI Serving', strength: 65, confidence: 58, relevance: 'High', level: 'Intermediate' },
          { name: 'MLflow', strength: 10, confidence: 5, relevance: 'Moderate', level: 'Beginner' }
        ]
      }
    ],
    gapAnalysis: {
      missingSkills: [
        { name: 'PyTorch Neural Networks', priority: 'High', difficulty: 'Hard', time: '3 Weeks', prerequisites: ['Python', 'Linear Algebra'] },
        { name: 'LangChain RAG Systems', priority: 'High', difficulty: 'Medium', time: '2 Weeks', prerequisites: ['Python', 'LLM API basics'] },
        { name: 'Pinecone Vector Setup', priority: 'High', difficulty: 'Easy', time: '1 Week', prerequisites: ['Embeddings Concepts'] },
        { name: 'QLoRA Fine-tuning', priority: 'Medium', difficulty: 'Hard', time: '3 Weeks', prerequisites: ['PyTorch', 'HuggingFace Transformers'] },
        { name: 'Docker MLOps Serving', priority: 'Medium', difficulty: 'Medium', time: '2 Weeks', prerequisites: ['Linux', 'Docker Basics'] },
        { name: 'MLflow Pipeline tracking', priority: 'Low', difficulty: 'Medium', time: '1 Week', prerequisites: ['scikit-learn'] }
      ],
      partiallyLearned: [
        { name: 'TensorFlow', strength: 75, confidence: 68 },
        { name: 'HuggingFace API', strength: 60, confidence: 55 }
      ],
      strongSkills: [
        { name: 'Python', strength: 92, confidence: 85 },
        { name: 'scikit-learn', strength: 85, confidence: 80 },
        { name: 'FastAPI Serving', strength: 65, confidence: 58 }
      ],
      weakSkills: [
        { name: 'PyTorch', strength: 40, confidence: 30 },
        { name: 'Pinecone', strength: 30, confidence: 25 }
      ],
      blockers: [
        'No verified multi-document vector search pipeline implementation',
        'Lack of quantization (QLoRA) models code evaluation profiles',
        'Missing GPU memory serving container templates in local projects'
      ]
    },
    dependencies: [
      { skill: 'PyTorch', prereqs: ['Python', 'Calculus & Algebra'] },
      { skill: 'Transformers (HF)', prereqs: ['PyTorch'] },
      { skill: 'LangChain', prereqs: ['Python', 'LLM APIs'] },
      { skill: 'QLoRA Fine-tuning', prereqs: ['Transformers (HF)', 'PyTorch'] },
      { skill: 'Docker MLOps', prereqs: ['Docker Basics'] }
    ],
    emergingTech: [
      { name: 'Agentic Workflows (LangGraph)', demandTrend: 'Exploding', salaryImpact: '+22%', futureRelevance: 'Very High' },
      { name: 'Model Distillation (GPT-4 to custom)', demandTrend: 'High Growth', salaryImpact: '+18%', futureRelevance: 'Very High' },
      { name: 'Quantization at the Edge (ONNX)', demandTrend: 'Rapid Growth', salaryImpact: '+12%', futureRelevance: 'High' }
    ],
    projectGap: {
      currentProjects: [
        { name: 'AI Resume Analyzer', url: 'github.com/rohit/ai-resume', validated: true, score: 85 },
        { name: 'ML Stock Predictor', url: 'github.com/rohit/stock-predictor', validated: false, score: 55 }
      ],
      missingProjects: [
        { name: 'Semantic Knowledge Base & Agentic RAG', tech: 'LangChain, Pinecone, FastAPI, HuggingFace, React', description: 'Secure multi-document knowledge base with vector search, semantic parsing, and memory agents.' },
        { name: 'Llama-3 GPU Model Hosting container', tech: 'Python, FastAPI, HuggingFace PEFT, Docker, Pydantic', description: 'Quantized LLM chat serving endpoint with concurrency benchmarks, request batching, and input filters.' }
      ]
    },
    certifications: {
      current: ['Google Cloud Foundations'],
      recommended: [
        { name: 'DeepLearning.AI Generative AI Specialization', provider: 'DeepLearning.AI', relevance: 'Very High' },
        { name: 'Google Professional Machine Learning Engineer', provider: 'Google', relevance: 'Very High' }
      ]
    },
    companyReadiness: [
      { company: 'Google', readiness: 66, prepPlan: ['Master advanced multi-GPU pipeline operations', 'Understand Transformer attention mathematics in detail', 'Solve 180 LeetCode Medium/Hard algorithmic questions'] },
      { company: 'NeuroStack Labs', readiness: 84, prepPlan: ['Practice quantization concepts (QLoRA vs GGUF)', 'Implement robust request batching endpoints'] },
      { company: 'Wipro', readiness: 95, prepPlan: ['Review basic database queries (SQL)', 'Practice standard Python OOP constructs'] }
    ],
    marketDemand: [
      { skill: 'PyTorch', demandScore: 96, hiringImpact: 92, salaryImpact: 90, futureDemand: 95 },
      { skill: 'LLMs & RAG', demandScore: 98, hiringImpact: 94, salaryImpact: 92, futureDemand: 98 },
      { skill: 'FastAPI Serving', demandScore: 84, hiringImpact: 80, salaryImpact: 74, futureDemand: 85 },
      { skill: 'Vector Databases', demandScore: 88, hiringImpact: 82, salaryImpact: 78, futureDemand: 90 }
    ],
    economicImpact: {
      unlockedOpportunities: 1840,
      salaryGrowth: [
        { skill: 'PyTorch Neural Nets', increasePercent: 16 },
        { skill: 'LangChain / Vector DB RAG', increasePercent: 18 },
        { skill: 'QLoRA Fine-tuning', increasePercent: 22 },
        { skill: 'DeepLearning.AI GenAI Specialization', increasePercent: 12 }
      ]
    },
    learningPath: ['PyTorch Neural Networks', 'Agentic RAG & LangChain', 'Pinecone Vector Setup', 'Model Fine-tuning (LoRA)', 'FastAPI CUDA Deployment'],
    mentorsAdvice: [
      'Transition models from TensorFlow to PyTorch. PyTorch is the industry-standard for deep learning research and deployment.',
      'Construct a proof-of-work project validating vector databases (like Pinecone) and RAG setups. Just calling simple text models lacks recruiter hiring impact.',
      'Complete the DeepLearning.AI GenAI credential to validate fine-tuning theoretical benchmarks.'
    ],
    verificationQuizzes: [
      {
        topic: 'PyTorch',
        quiz: [
          { question: 'Which PyTorch method propagates loss values backwards?', options: ['loss.backward()', 'loss.step()', 'loss.grad_zero()'], answer: 'loss.backward()' },
          { question: 'What class encapsulates neural network weights & layers in PyTorch?', options: ['nn.Module', 'torch.Tensor', 'nn.Linear'], answer: 'nn.Module' }
        ]
      }
    ],
    verificationTasks: [
      {
        id: 'rag-task',
        title: 'Build PyTorch multi-class classifier model',
        description: 'Initialize a custom neural network with 3 hidden layers, define ReLU triggers, cross entropy loss, and train for 5 epochs.',
        requirements: ['Inherits from nn.Module', 'Tracks loss metrics per epoch', 'Validates model checkpoint outputs'],
        evaluationRubric: 'Correct layer mappings (35%), Checkpoint management (35%), optimizer/learning rate configuration (30%)'
      }
    ]
  },
  chat: { reply: 'Focus on one target role, tailor your resume keywords, build proof-of-work projects, and practice interviews weekly.' },

  careerChat: { reply: 'Based on your profile, I recommend focusing on building a production-ready project that showcases your skills. Your resume shows strong React knowledge — leverage that by building a Next.js + PostgreSQL SaaS app. This will significantly improve your hiring probability for Full Stack Developer roles. Want me to generate a step-by-step project plan?' },

  jobMatch: {
    jobs: [
      { id: 'j1', title: 'AI/ML Engineer Intern', company: 'NeuroStack Labs', location: 'Bangalore (Remote)', type: 'Internship', salary: '₹25,000–40,000/month', matchScore: 94, atsScore: 89, hiringProbability: 87, skills: ['Python', 'PyTorch', 'FastAPI', 'LangChain'], missingSkills: ['MLflow', 'Docker'], postedDays: 2, urgent: true, description: 'Build production AI/ML pipelines using PyTorch and LangChain with real-time RAG systems.', status: 'not_applied', saved: false },
      { id: 'j2', title: 'Full Stack Developer', company: 'OrbitCloud', location: 'Hyderabad', type: 'Full-time', salary: '₹8–14 LPA', matchScore: 87, atsScore: 82, hiringProbability: 74, skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'], missingSkills: ['Next.js', 'PostgreSQL'], postedDays: 5, urgent: false, description: 'Design and deploy scalable full-stack applications using modern React and Node.js ecosystems.', status: 'not_applied', saved: false },
      { id: 'j3', title: 'Frontend Developer', company: 'TechCraft India', location: 'Remote', type: 'Full-time', salary: '₹6–10 LPA', matchScore: 92, atsScore: 90, hiringProbability: 81, skills: ['React', 'Tailwind CSS', 'TypeScript', 'Next.js'], missingSkills: ['Storybook'], postedDays: 1, urgent: true, description: 'Craft pixel-perfect, highly interactive UIs for enterprise SaaS platforms.', status: 'not_applied', saved: false },
      { id: 'j4', title: 'ML Research Intern', company: 'DataForge AI', location: 'Mumbai (Hybrid)', type: 'Internship', salary: '₹20,000–35,000/month', matchScore: 82, atsScore: 76, hiringProbability: 69, skills: ['Python', 'scikit-learn', 'TensorFlow', 'NumPy'], missingSkills: ['PyTorch', 'Research paper reading'], postedDays: 7, urgent: false, description: 'Work alongside research scientists on cutting-edge ML models for enterprise NLP tasks.', status: 'not_applied', saved: false },
      { id: 'j5', title: 'Software Engineer', company: 'Infosys', location: 'Pune', type: 'Full-time', salary: '₹5–8 LPA', matchScore: 78, atsScore: 84, hiringProbability: 91, skills: ['Java', 'Spring Boot', 'SQL', 'REST APIs'], missingSkills: ['Spring Security', 'Microservices'], postedDays: 3, urgent: false, description: 'Develop enterprise-grade backend services for Fortune 500 clients using Java Spring ecosystem.', status: 'not_applied', saved: false },
      { id: 'j6', title: 'Backend Developer', company: 'Razorpay', location: 'Bangalore', type: 'Full-time', salary: '₹12–20 LPA', matchScore: 71, atsScore: 68, hiringProbability: 58, skills: ['Node.js', 'PostgreSQL', 'Redis', 'Kafka'], missingSkills: ['Kafka', 'Redis Advanced', 'Distributed Systems'], postedDays: 10, urgent: false, description: 'Build and scale payment infrastructure handling millions of daily transactions.', status: 'not_applied', saved: false }
    ]
  },

  learningPath: {
    recommended: [
      { id: 'lp1', track: 'AI Engineering', phase: 'Phase 1', topic: 'Agentic RAG & LangChain', priority: 'High', estimatedHours: 12, resources: 8 },
      { id: 'lp2', track: 'Full Stack', phase: 'Phase 1', topic: 'TypeScript & Next.js App Router', priority: 'High', estimatedHours: 16, resources: 10 }
    ]
  },

  learningTrack: {
    trackId: 'ai-engineering',
    title: 'AI Engineering',
    description: 'Master production AI systems: RAG pipelines, LLM fine-tuning, vector databases, and MLOps deployment.',
    totalHours: 120,
    phases: [
      {
        id: 'phase-1',
        title: 'Phase 1: Foundations & Generative AI',
        topics: [
          { id: 't1', title: 'Python & NumPy Mastery', completed: false, hours: 8, difficulty: 'Beginner', resources: [{ title: 'Python Official Docs', url: 'https://docs.python.org', type: 'docs', free: true }, { title: 'NumPy Tutorial - freeCodeCamp', url: 'https://youtube.com/watch?v=QUT1VHiLmmI', type: 'video', free: true }], quiz: [{ q: 'What is a NumPy ndarray?', options: ['A Python list', 'An N-dimensional array', 'A dictionary'], answer: 'An N-dimensional array' }] },
          { id: 't2', title: 'LangChain & RAG Pipelines', completed: false, hours: 14, difficulty: 'Intermediate', resources: [{ title: 'LangChain Docs', url: 'https://python.langchain.com', type: 'docs', free: true }, { title: 'Build RAG with LangChain', url: 'https://youtube.com', type: 'video', free: true }], quiz: [{ q: 'What does RAG stand for?', options: ['Retrieval-Augmented Generation', 'Random Access Generation', 'Recursive AI Graph'], answer: 'Retrieval-Augmented Generation' }] },
          { id: 't3', title: 'Vector Databases & Pinecone', completed: false, hours: 10, difficulty: 'Intermediate', resources: [{ title: 'Pinecone Docs', url: 'https://docs.pinecone.io', type: 'docs', free: true }], quiz: [{ q: 'What index type does Pinecone use for fast search?', options: ['B-Tree', 'HNSW', 'Hash Table'], answer: 'HNSW' }] }
        ]
      },
      {
        id: 'phase-2',
        title: 'Phase 2: Deep Learning & Fine-Tuning',
        topics: [
          { id: 't4', title: 'PyTorch Neural Networks', completed: false, hours: 18, difficulty: 'Advanced', resources: [{ title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials', type: 'docs', free: true }], quiz: [{ q: 'Which method computes gradients in PyTorch?', options: ['optimizer.step()', 'loss.backward()', 'model.train()'], answer: 'loss.backward()' }] },
          { id: 't5', title: 'LLM Fine-Tuning with LoRA', completed: false, hours: 20, difficulty: 'Expert', resources: [{ title: 'HuggingFace PEFT Guide', url: 'https://huggingface.co/docs/peft', type: 'docs', free: true }], quiz: [{ q: 'What does LoRA stand for?', options: ['Low-Rank Adaptation', 'Linear Optimization Routine', 'Layer-wise Recursive Attention'], answer: 'Low-Rank Adaptation' }] }
        ]
      }
    ],
    projects: [
      { title: 'Semantic Document Search Engine', level: 'Intermediate', tech: ['LangChain', 'Pinecone', 'FastAPI', 'React'], hours: 15 },
      { title: 'Custom LLM Fine-Tuning Pipeline', level: 'Advanced', tech: ['PyTorch', 'HuggingFace', 'MLflow', 'Docker'], hours: 25 }
    ]
  },

  quizGenerate: {
    topic: 'React.js',
    questions: [
      { id: 'q1', question: 'What hook is used to manage side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], answer: 'useEffect', explanation: 'useEffect runs after every render and is used for API calls, subscriptions, and DOM manipulation.', difficulty: 'Beginner' },
      { id: 'q2', question: 'What is the purpose of React.memo?', options: ['To memoize state', 'To prevent re-renders if props unchanged', 'To cache API responses', 'To create global state'], answer: 'To prevent re-renders if props unchanged', explanation: 'React.memo wraps a component to prevent unnecessary re-renders when props have not changed, improving performance.', difficulty: 'Intermediate' },
      { id: 'q3', question: 'Which hook replaces the need for Redux in simple state management?', options: ['useState', 'useContext + useReducer', 'useMemo', 'useCallback'], answer: 'useContext + useReducer', explanation: 'The combination of useContext and useReducer can handle complex state management without external libraries for many use cases.', difficulty: 'Advanced' }
    ]
  },

  certRecommend: [
    { id: 'cert1', name: 'Google Professional Machine Learning Engineer', provider: 'Google Cloud', level: 'Professional', duration: '3-6 months prep', cost: '$200 exam fee', careerImpact: 92, salaryImpact: '+18%', hiringImpact: 88, relevance: 'Very High', url: 'https://cloud.google.com/certification/machine-learning-engineer', category: 'AI/ML', skills: ['TensorFlow', 'Vertex AI', 'MLOps', 'BigQuery ML'], popularity: 94 },
    { id: 'cert2', name: 'AWS Certified Developer – Associate', provider: 'Amazon Web Services', level: 'Associate', duration: '2-3 months prep', cost: '$150 exam fee', careerImpact: 87, salaryImpact: '+15%', hiringImpact: 84, relevance: 'High', url: 'https://aws.amazon.com/certification/certified-developer-associate/', category: 'Cloud', skills: ['Lambda', 'DynamoDB', 'API Gateway', 'CloudFormation'], popularity: 91 },
    { id: 'cert3', name: 'Meta Front-End Developer Certificate', provider: 'Meta / Coursera', level: 'Professional', duration: '7 months', cost: 'Free (Coursera Financial Aid)', careerImpact: 79, salaryImpact: '+10%', hiringImpact: 76, relevance: 'High', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer', category: 'Frontend', skills: ['React', 'JavaScript', 'CSS', 'Figma'], popularity: 88 },
    { id: 'cert4', name: 'DeepLearning.AI Generative AI Specialization', provider: 'DeepLearning.AI', level: 'Specialization', duration: '4 months', cost: 'Free (Audit)', careerImpact: 94, salaryImpact: '+22%', hiringImpact: 91, relevance: 'Very High', url: 'https://www.deeplearning.ai/courses/generative-ai-with-llms/', category: 'AI/ML', skills: ['LLMs', 'Fine-tuning', 'RLHF', 'RAG'], popularity: 97 },
    { id: 'cert5', name: 'Microsoft Azure Fundamentals (AZ-900)', provider: 'Microsoft', level: 'Fundamentals', duration: '1 month prep', cost: '$165 exam fee', careerImpact: 72, salaryImpact: '+8%', hiringImpact: 70, relevance: 'Moderate', url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/', category: 'Cloud', skills: ['Azure Services', 'Cloud Concepts', 'Security', 'Pricing'], popularity: 82 }
  ],

  certImpact: {
    certificationName: 'Google Professional ML Engineer',
    overallImpact: 92,
    careerGrowth: { score: 94, description: 'Opens doors to senior ML roles at FAANG, unicorn startups, and research labs.', timeToPromotion: '6-12 months', roleUnlocks: ['Senior ML Engineer', 'AI Research Engineer', 'MLOps Lead'] },
    salaryImpact: { percentage: 18, estimatedRange: '₹14–25 LPA (entry-level with cert)', marketPremium: 'High demand, 23% fewer certified professionals vs open roles' },
    hiringImpact: { score: 88, additionalOpportunities: 1240, filterPassRate: '+34% ATS pass rate' },
    industryRelevance: { score: 95, topCompanies: ['Google', 'Amazon', 'Flipkart', 'Microsoft', 'PhonePe'], demandTrend: 'Rapidly Growing' },
    linkedInBoost: { profileViews: '+45%', recruiterMessages: '+60%', connectionRequests: '+28%' }
  },

  linkedInPost: {
    post: "🎉 Thrilled to announce that I have successfully earned the Google Professional Machine Learning Engineer certification!\n\nThis journey has been incredible — from mastering PyTorch neural networks to deploying production ML pipelines on Vertex AI. I dedicated 4 months of consistent learning, building hands-on projects, and deepening my understanding of MLOps best practices.\n\n💡 Key learnings:\n✅ End-to-end ML pipeline design on GCP\n✅ Vertex AI model training & deployment\n✅ MLflow experiment tracking at scale\n✅ BigQuery ML for data-first modeling\n\nGrateful for the amazing resources and the incredible AI/ML community. Looking forward to applying these skills in my next role!\n\n#MachineLearning #GoogleCloud #MLOps #AI #CareerGrowth #Certification #TechCareer"
  },

  coverLetter: {
    letter: "Dear Hiring Manager,\n\nI am writing to express my strong interest in the AI/ML Engineer Intern position at NeuroStack Labs. With a solid foundation in Python, TensorFlow, and hands-on experience building production-ready ML pipelines, I am excited about the opportunity to contribute to your innovative AI research team.\n\nDuring my academic projects, I developed a semantic document search engine using LangChain and Pinecone that reduced retrieval latency by 40% compared to traditional keyword search. This project not only sharpened my understanding of RAG architectures but also gave me practical experience with production-grade vector indexing strategies — directly aligned with your team's work on enterprise NLP systems.\n\nI am particularly drawn to NeuroStack Labs' mission of democratizing AI for enterprise workflows. Your recent work on agentic AI systems resonates deeply with my interests in building intelligent, context-aware pipelines that solve real-world problems at scale.\n\nI would love the opportunity to discuss how my skills and projects can contribute to your team's goals. Thank you for your time and consideration.\n\nWarm regards,\n[Your Name]"
  },

  progressInsights: [
    { type: 'strength', title: 'Strong Learning Momentum', description: 'You have completed 68% of your roadmap in 6 weeks — 24% faster than average learners targeting the same role.' },
    { type: 'weakness', title: 'Interview Practice Gap', description: 'You have only completed 2 mock interviews this month. Top candidates practice 3–5 times/week before placements.' },
    { type: 'opportunity', title: 'Certification Unlocks 1,240 New Jobs', description: 'Adding the AWS Developer Associate cert to your profile opens 1,240 additional job opportunities in your target region.' },
    { type: 'action', title: 'Complete Docker This Week', description: 'Finishing Docker basics (6 hours) increases your Career Score from 72% to 81% and unlocks DevOps roles.' },
    { type: 'strength', title: 'Resume is ATS-Optimized', description: 'Your resume scores 88/100 on ATS compatibility — you are in the top 15% of candidates for your target role.' }
  ],

  goalScore: {
    overall: 72,
    internshipReadiness: 78,
    placementReadiness: 64,
    jobReadiness: 58,
    breakdown: {
      skills: { score: 68, weight: 25, label: 'Skills Progress' },
      projects: { score: 59, weight: 20, label: 'Projects Progress' },
      resume: { score: 88, weight: 15, label: 'Resume Strength' },
      certifications: { score: 45, weight: 10, label: 'Certification Progress' },
      github: { score: 73, weight: 10, label: 'GitHub Strength' },
      interview: { score: 68, weight: 10, label: 'Interview Readiness' },
      jobReadiness: { score: 75, weight: 10, label: 'Job Readiness' }
    },
    missingRequirements: [
      { type: 'skill', name: 'Docker', impact: '+4%', priority: 'High' },
      { type: 'skill', name: 'AWS', impact: '+6%', priority: 'High' },
      { type: 'project', name: 'Full Stack SaaS App', impact: '+8%', priority: 'High' },
      { type: 'certification', name: 'AWS Developer Associate', impact: '+5%', priority: 'Medium' },
      { type: 'interview', name: '3 More Mock Interviews', impact: '+4%', priority: 'Medium' }
    ]
  },

  careerPrediction: {
    internshipDate: 'August 2026',
    placementDate: 'November 2026',
    jobDate: 'January 2027',
    expectedSalary: { min: '₹8 LPA', max: '₹15 LPA', average: '₹11.5 LPA' },
    careerGrowthPotential: 'High',
    hiringProbability: 74,
    accelerators: [
      { action: 'Complete Docker + AWS (2 weeks)', impact: 'Internship readiness in 3 weeks instead of 6' },
      { action: 'Build Full Stack SaaS Project', impact: '+12% placement readiness' },
      { action: 'AWS Developer Associate Cert', impact: '+8% job readiness, unlocks 1,240 roles' }
    ]
  },

  goalOptimizer: [
    { action: 'Learn Docker & Kubernetes (2 weeks)', currentScore: 72, projectedScore: 81, skillsUnlocked: ['Docker', 'Container Orchestration'], jobsUnlocked: 890, salaryImpact: '+₹1.5 LPA' },
    { action: 'Build Full Stack SaaS App (3 weeks)', currentScore: 72, projectedScore: 86, skillsUnlocked: ['PostgreSQL', 'Next.js', 'Redis'], jobsUnlocked: 1420, salaryImpact: '+₹2.5 LPA' },
    { action: 'AWS Developer Associate Cert (4 weeks)', currentScore: 72, projectedScore: 85, skillsUnlocked: ['AWS Lambda', 'DynamoDB', 'CloudFormation'], jobsUnlocked: 1240, salaryImpact: '+₹2 LPA' },
    { action: 'Complete 5 Mock Interviews', currentScore: 72, projectedScore: 78, skillsUnlocked: [], jobsUnlocked: 0, salaryImpact: '+₹0.5 LPA (negotiation confidence)' }
  ],
  goalGenerate: [
    { title: 'Complete DSA Fundamentals', description: 'Master arrays, linked lists, trees, graphs, and dynamic programming patterns. Solve 150+ LeetCode problems.', category: 'Engineering', priority: 'critical', difficulty: 'intermediate', targetCompany: '', targetRole: 'Software Engineer', estimatedHours: 120, deadline: '', icon: 'code', color: '#EF4444' },
    { title: 'Build Production Portfolio', description: 'Create a responsive developer portfolio with 3+ projects, blog, and contact form deployed on Vercel.', category: 'Projects', priority: 'high', difficulty: 'intermediate', targetCompany: '', targetRole: 'Full Stack Developer', estimatedHours: 40, deadline: '', icon: 'globe', color: '#8B5CF6' },
    { title: 'Master React & Next.js', description: 'Complete advanced React patterns, hooks, state management, SSR/SSG with Next.js App Router.', category: 'Engineering', priority: 'high', difficulty: 'advanced', targetCompany: '', targetRole: 'Frontend Developer', estimatedHours: 80, deadline: '', icon: 'layers', color: '#3B82F6' },
    { title: 'Get AWS Cloud Practitioner Certified', description: 'Study AWS fundamentals, pass the CLF-C02 exam. Covers EC2, S3, IAM, Lambda, CloudFormation.', category: 'Certifications', priority: 'medium', difficulty: 'beginner', targetCompany: 'Amazon', targetRole: 'Cloud Engineer', estimatedHours: 30, deadline: '', icon: 'cloud', color: '#F59E0B' },
    { title: 'Land First Tech Internship', description: 'Apply to 50+ internships, optimize resume for ATS, practice coding rounds, prepare HR answers.', category: 'Career', priority: 'critical', difficulty: 'intermediate', targetCompany: '', targetRole: 'Software Engineering Intern', estimatedHours: 60, deadline: '', icon: 'briefcase', color: '#10B981' },
  ],
  todayGoals: [
    { title: 'Solve 3 DSA Problems', description: 'Focus on array and string medium-level problems on LeetCode', category: 'Practice', estimatedMinutes: 90, priority: 'high' },
    { title: 'Complete React Hooks Module', description: 'Finish useCallback, useMemo, and custom hooks lesson', category: 'Learning', estimatedMinutes: 45, priority: 'medium' },
    { title: 'Update Resume with Latest Project', description: 'Add your portfolio project with metrics and tech stack', category: 'Career', estimatedMinutes: 20, priority: 'high' },
    { title: 'Watch System Design Basics', description: 'Study load balancer, caching, and CDN patterns', category: 'Learning', estimatedMinutes: 30, priority: 'medium' },
    { title: 'Apply to 2 Internship Positions', description: 'Submit tailored applications on company career pages', category: 'Career', estimatedMinutes: 25, priority: 'critical' },
  ],

  interviewSessionFullStack: {
    role: 'Full Stack Developer',
    questions: [
      { id: 'q1', text: 'Explain the difference between Virtual DOM and Shadow DOM in React.', category: 'Technical', difficulty: 'Intermediate', hints: 'Focus on rendering optimization vs encapsulation.', correctAnswerExplanation: 'Virtual DOM is a React concept used to speed up updates in memory before applying changes, while Shadow DOM is a web standard for component styles encapsulation.' },
      { id: 'q2', text: 'Why is it important to use transaction pools and indices in relational databases like PostgreSQL?', category: 'System Design', difficulty: 'Advanced', hints: 'Discuss connection overhead and search complexity.', correctAnswerExplanation: 'Indices decrease search time to O(log N) from linear scans, and pooling prevents overhead by reusing active connections.' },
      { id: 'q3', text: 'Tell me about a time you had to optimize a slow API. What steps did you take?', category: 'Behavioral', difficulty: 'Intermediate', hints: 'Use the STAR method (Situation, Task, Action, Result).', correctAnswerExplanation: 'Describe using tools (e.g. pg_stat_statements or profiling) to locate latency blockers, adding caches (Redis) or index tables, and showing a 40%+ latency decrease.' }
    ]
  },
  interviewSessionAI: {
    role: 'AI/ML Engineer',
    questions: [
      { id: 'q1', text: 'Explain the difference between dot product and cosine similarity in vector embeddings.', category: 'Technical', difficulty: 'Advanced', hints: 'Discuss magnitude and direction variations.', correctAnswerExplanation: 'Dot product is magnitude-dependent, matching absolute scale, while cosine similarity normalizes vectors, evaluating direction only.' },
      { id: 'q2', text: 'How do you prevent overfitting in deep neural networks during training?', category: 'Technical', difficulty: 'Intermediate', hints: 'Discuss dropout, normalization, and datasets adjustments.', correctAnswerExplanation: 'Overfitting is mitigated using dropout layers, L1/L2 regularization, early stopping parameters, and expanding training data volumes.' },
      { id: 'q3', text: 'Design a scalable real-time RAG pipeline serving documents context. What vector database indexing would you choose?', category: 'System Design', difficulty: 'Expert', hints: 'Discuss indexing speed vs search latency trade-offs.', correctAnswerExplanation: 'Use hierarchical navigable small world (HNSW) index in Pinecone or pgvector for sub-linear search time, with caching and query rewriting filters.' }
    ]
  },
  interviewEvaluation: {
    score: 82,
    feedback: 'Excellent response structure. Your technical depth in React is commendable, but your discussion of database transactions could benefit from more specific metrics.',
    breakdown: { technical: 85, hr: 80, communication: 82, confidence: 80, problemSolving: 85, projectDiscussion: 78, leadership: 75 },
    starEvaluation: {
      situation: { score: 85, feedback: 'Clearly defined the scaling constraints of the API layer.' },
      task: { score: 80, feedback: 'Identified the target transaction locks accurately.' },
      action: { score: 82, feedback: 'Explained connection pool modifications and indexing schemas step-by-step.' },
      result: { score: 80, feedback: 'Noted latency drops, but could quantify concurrent user volume limits better.' }
    },
    speechAnalytics: {
      wpm: 125,
      fillerWordsCount: 3,
      longPauses: 2,
      repeatedWords: 1,
      improvementTips: [
        'Slow down slightly when detailing complex database join diagrams to project technical stability.',
        'Avoid filler words like "um" and "like" during the opening context setup.'
      ]
    },
    postureFeedback: [
      'Great direct eye contact maintained during the technical walkthrough.',
      'Slightly slouching posture observed during the HR situational summary.'
    ],
    weaknesses: ['Vague metrics on project performance outcomes', 'Needs deeper SQL transactional lock knowledge'],
    strongPoints: ['Strong React lifecycle understanding', 'Excellent structured STAR method response alignment'],
    hiringProbability: 78,
    salaryPotential: '₹12 – ₹16 LPA',
    customRoadmap: [
      'Build a project incorporating pg_stat_statements evaluation to practice performance tuning.',
      'Complete mock interviews focusing entirely on transactional locking queries.'
    ]
  }
};

// ─── AI Project Mentor schema hint ───────────────────────────────────────────
const PROJECT_MENTOR_SCHEMA = `{
  "projectName": "",
  "description": "",
  "techStack": {
    "frontend": [],
    "backend": [],
    "database": [],
    "devops": []
  },
  "databaseDesign": {
    "type": "Relational|Document|Key-Value",
    "description": "",
    "tablesOrCollections": [
      {
        "name": "",
        "fields": [
          { "name": "", "type": "", "description": "" }
        ],
        "relationships": []
      }
    ]
  },
  "apiStructure": {
    "endpoints": [
      { "method": "GET|POST|PUT|DELETE", "path": "", "description": "", "requestBody": "", "responseBody": "" }
    ]
  },
  "folderStructure": {
    "tree": ""
  },
  "developmentRoadmap": [
    { "phase": "", "tasks": [] }
  ],
  "deploymentStrategy": {
    "hosting": "",
    "steps": []
  }
}`;

// ─── Industry Trends schema hint ─────────────────────────────────────────────
const INDUSTRY_TRENDS_SCHEMA = `{
  "trendingSkills": [
    { "name": "", "growthRate": "", "demandIndex": "" }
  ],
  "trendingTechnologies": [
    { "name": "", "category": "", "description": "" }
  ],
  "mostDemandedJobs": [
    { "title": "", "openings": "", "topCompanies": [] }
  ],
  "salaryInsights": [
    { "role": "", "entryLevel": "", "midLevel": "", "seniorLevel": "" }
  ],
  "futureOpportunities": [
    { "trend": "", "description": "", "timeframe": "" }
  ]
}`;

// ─── Roadmap deep-analysis schema hint ────────────────────────────────────────
const ROADMAP_DEEP_SCHEMA = `{
  "targetRole": "",
  "currentProfile": { "level": "Beginner|Intermediate|Advanced|Industry Ready", "strengths": [], "weaknesses": [] },
  "skillGap": { "currentSkills": [], "requiredSkills": [], "missingSkills": [], "learningPriorities": [] },
  "gamification": { "level": 1, "levelName": "Beginner|Learner|Developer|Advanced Developer|Industry Ready|Job Ready|Professional", "xp": 0, "streak": { "current": 1, "best": 1 } },
  "timeEstimation": { "skillCompletion": "", "roadmapCompletion": "", "internshipReadiness": "", "placementReadiness": "" },
  "dailyPlan": { "tasks": [], "estimatedHours": 0.0 },
  "weeklyGoals": [],
  "monthlyMilestones": [],
  "recommendedCertifications": [{ "name": "", "provider": "", "relevance": "High|Very High|Moderate" }],
  "jobMarket": { "demand": [{ "name": "", "status": "High|Very High|Moderate|Growing" }], "salaryTrend": "", "hiringProbability": "" },
  "readiness": { "internship": 0, "placement": 0 },
  "careerPredictions": { "internshipDate": "", "placementDate": "", "expectedGrowth": "" },
  "interviewPrep": { "technical": [], "hr": [], "companyPrep": "" },
  "projectRecommendations": [{ "name": "", "level": "Beginner|Intermediate|Advanced|Industry-Level", "tech": "", "description": "" }],
  "skillTree": [
    {
      "phase": "",
      "topics": [
        {
          "name": "",
          "completed": false,
          "description": "",
          "modules": [],
          "resources": [{ "title": "", "type": "", "link": "", "free": true }],
          "quiz": [{ "question": "", "options": [], "answer": "" }]
        }
      ]
    }
  ]
}`;

// ─── Skill Gap deep-analysis schema hint ─────────────────────────────────────
const SKILL_GAP_DEEP_SCHEMA = `{
  "targetRole": "",
  "overallScores": { "skillMatch": 0, "projectMatch": 0, "resumeMatch": 0, "certificationMatch": 0, "interviewMatch": 0, "readiness": 0, "hiringProbability": "High|Medium-High|Medium|Low", "salaryPotential": "" },
  "readinessMeters": { "internship": 0, "placement": 0, "dsa": 0, "core": 0, "projects": 0, "communication": 0 },
  "multiRoleMatch": [{ "role": "", "score": 0 }],
  "categories": [{ "name": "", "skills": [{ "name": "", "strength": 0, "confidence": 0, "relevance": "Very High|High|Moderate|Low", "level": "Beginner|Intermediate|Advanced" }] }],
  "gapAnalysis": {
    "missingSkills": [{ "name": "", "priority": "Critical|High|Medium|Low", "difficulty": "Easy|Medium|Hard", "time": "", "prerequisites": [] }],
    "partiallyLearned": [{ "name": "", "strength": 0, "confidence": 0 }],
    "strongSkills": [{ "name": "", "strength": 0, "confidence": 0 }],
    "weakSkills": [{ "name": "", "strength": 0, "confidence": 0 }],
    "blockers": []
  },
  "dependencies": [{ "skill": "", "prereqs": [] }],
  "emergingTech": [{ "name": "", "demandTrend": "", "salaryImpact": "", "futureRelevance": "Very High|High|Moderate" }],
  "projectGap": {
    "currentProjects": [{ "name": "", "url": "", "validated": true, "score": 0 }],
    "missingProjects": [{ "name": "", "tech": "", "description": "" }]
  },
  "certifications": { "current": [], "recommended": [{ "name": "", "provider": "", "relevance": "Very High|High|Moderate" }] },
  "companyReadiness": [{ "company": "", "readiness": 0, "prepPlan": [] }],
  "marketDemand": [{ "skill": "", "demandScore": 0, "hiringImpact": 0, "salaryImpact": 0, "futureDemand": 0 }],
  "economicImpact": { "unlockedOpportunities": 0, "salaryGrowth": [{ "skill": "", "increasePercent": 0 }] },
  "learningPath": [],
  "mentorsAdvice": [],
  "verificationQuizzes": [{ "topic": "", "quiz": [{ "question": "", "options": [], "answer": "" }] }],
  "verificationTasks": [{ "id": "", "title": "", "description": "", "requirements": [], "evaluationRubric": "" }]
}`;

// ─── Interview Session schema hint ──────────────────────────────────────────
const INTERVIEW_SESSION_SCHEMA = `{
  "role": "",
  "questions": [{
    "id": "",
    "text": "",
    "category": "Technical|HR|Behavioral|Coding|System Design",
    "difficulty": "Beginner|Intermediate|Advanced|Expert",
    "hints": "",
    "correctAnswerExplanation": "",
    "starterCode": ""
  }]
}`;

// ─── Interview Evaluation schema hint ───────────────────────────────────────
const INTERVIEW_EVALUATION_SCHEMA = `{
  "score": 0,
  "feedback": "",
  "breakdown": {
    "technical": 0, "hr": 0, "communication": 0, "confidence": 0, "problemSolving": 0, "projectDiscussion": 0, "leadership": 0
  },
  "starEvaluation": {
    "situation": { "score": 0, "feedback": "" },
    "task": { "score": 0, "feedback": "" },
    "action": { "score": 0, "feedback": "" },
    "result": { "score": 0, "feedback": "" }
  },
  "speechAnalytics": {
    "wpm": 0, "fillerWordsCount": 0, "longPauses": 0, "repeatedWords": 0, "improvementTips": []
  },
  "postureFeedback": [],
  "weaknesses": [],
  "strongPoints": [],
  "hiringProbability": 0,
  "salaryPotential": "",
  "customRoadmap": []
}`;

// ─── Chat & Career Chat schema hint ──────────────────────────────────────────
const CHAT_SCHEMA = `{
  "reply": "Your markdown formatted advice response here"
}`;

// ─── Certification Recommendation schema hint ────────────────────────────────
const CERT_RECOMMEND_SCHEMA = `[
  {
    "id": "",
    "name": "",
    "provider": "",
    "level": "Beginner|Associate|Professional|Specialization",
    "duration": "",
    "cost": "",
    "careerImpact": 0,
    "salaryImpact": "",
    "hiringImpact": 0,
    "relevance": "Very High|High|Moderate",
    "url": "",
    "category": "AI/ML|Cloud|Frontend|Backend|DevOps",
    "skills": [],
    "popularity": 0
  }
]`;

// ─── Certification Impact schema hint ────────────────────────────────────────
const CERT_IMPACT_SCHEMA = `{
  "certificationName": "",
  "overallImpact": 0,
  "careerGrowth": { "score": 0, "description": "", "timeToPromotion": "", "roleUnlocks": [] },
  "salaryImpact": { "percentage": 0, "estimatedRange": "", "marketPremium": "" },
  "hiringImpact": { "score": 0, "additionalOpportunities": 0, "filterPassRate": "" },
  "industryRelevance": { "score": 0, "topCompanies": [], "demandTrend": "" },
  "linkedInBoost": { "profileViews": "", "recruiterMessages": "", "connectionRequests": "" }
}`;

// ─── LinkedIn Post schema hint ──────────────────────────────────────────────
const LINKEDIN_POST_SCHEMA = `{
  "post": "The text content of the generated LinkedIn post"
}`;

// ─── Cover Letter schema hint ────────────────────────────────────────────────
const COVER_LETTER_SCHEMA = `{
  "letter": "The text content of the generated cover letter"
}`;

// ─── Job Match schema hint ───────────────────────────────────────────────────
const JOB_MATCH_SCHEMA = `{
  "jobs": [
    {
      "id": "",
      "title": "",
      "company": "",
      "type": "Internship|Full Time|Freelance|Contract",
      "location": "",
      "salary": "",
      "experience": "",
      "description": "",
      "matchScore": 0,
      "atsScore": 0,
      "hiringProbability": 0,
      "missingSkills": [],
      "url": "",
      "urgent": true
    }
  ]
}`;

// ─── Learning Path schema hint ──────────────────────────────────────────────
const LEARNING_PATH_SCHEMA = `{
  "recommended": [
    { "id": "", "topic": "", "track": "", "estimatedHours": 0 }
  ]
}`;

// ─── Learning Track schema hint ──────────────────────────────────────────────
const LEARNING_TRACK_SCHEMA = `{
  "title": "",
  "description": "",
  "totalHours": 0,
  "phases": [
    {
      "id": "",
      "title": "",
      "topics": [
        {
          "id": "",
          "title": "",
          "hours": 0,
          "difficulty": "Beginner|Intermediate|Advanced|Expert",
          "resources": [
            { "title": "", "type": "docs|video|course", "url": "", "free": true }
          ]
        }
      ]
    }
  ]
}`;

// ─── Quiz Generate schema hint ───────────────────────────────────────────────
const QUIZ_GENERATE_SCHEMA = `{
  "topic": "",
  "questions": [
    { "id": "", "question": "", "options": [], "answer": "", "explanation": "", "difficulty": "Beginner|Intermediate|Advanced" }
  ]
}`;

// ─── Goal Generate schema hint ───────────────────────────────────────────────
const GOAL_GENERATE_SCHEMA = `[
  {
    "title": "",
    "description": "",
    "category": "",
    "priority": "critical|high|medium|low",
    "difficulty": "beginner|intermediate|advanced|expert",
    "targetCompany": "",
    "targetRole": "",
    "estimatedHours": 0,
    "deadline": "",
    "icon": "",
    "color": ""
  }
]`;

// ─── Today Goals schema hint ─────────────────────────────────────────────────
const TODAY_GOALS_SCHEMA = `[
  { "title": "", "description": "", "category": "", "estimatedMinutes": 0, "priority": "critical|high|medium|low" }
]`;

// ─── Goal Score schema hint ──────────────────────────────────────────────────
const GOAL_SCORE_SCHEMA = `{
  "overall": 0,
  "internshipReadiness": 0,
  "placementReadiness": 0,
  "jobReadiness": 0,
  "breakdown": {
    "skills": { "score": 0, "weight": 0, "label": "" },
    "projects": { "score": 0, "weight": 0, "label": "" },
    "resume": { "score": 0, "weight": 0, "label": "" },
    "certifications": { "score": 0, "weight": 0, "label": "" },
    "github": { "score": 0, "weight": 0, "label": "" },
    "interview": { "score": 0, "weight": 0, "label": "" },
    "jobReadiness": { "score": 0, "weight": 0, "label": "" }
  },
  "missingRequirements": [
    { "type": "", "name": "", "impact": "", "priority": "" }
  ]
}`;

// ─── Career Prediction schema hint ───────────────────────────────────────────
const CAREER_PREDICTION_SCHEMA = `{
  "internshipDate": "",
  "placementDate": "",
  "jobDate": "",
  "expectedSalary": { "min": "", "max": "", "average": "" },
  "careerGrowthPotential": "High|Medium|Low",
  "hiringProbability": 0,
  "accelerators": [
    { "action": "", "impact": "" }
  ]
}`;

// ─── Goal Optimizer schema hint ──────────────────────────────────────────────
const GOAL_OPTIMIZER_SCHEMA = `[
  {
    "action": "",
    "currentScore": 0,
    "projectedScore": 0,
    "skillsUnlocked": [],
    "jobsUnlocked": 0,
    "salaryImpact": ""
  }
]`;

// ─── Main AI generation function ──────────────────────────────────────────────
export async function generateCareerJson(type, prompt, schemaHint = '') {
  const isGeminiPlaceholder = !process.env.GEMINI_API_KEY || 
    process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || 
    process.env.GEMINI_API_KEY === '' || 
    process.env.GEMINI_API_KEY.toLowerCase().startsWith('your-') ||
    process.env.GEMINI_API_KEY.toLowerCase().startsWith('replace-');

  if (isGeminiPlaceholder) {
    if (type === 'projectMentor') return fallback.projectMentor;
    if (type === 'industryTrends') return fallback.industryTrends;
    if (type === 'roadmapDeep') {
      const p = prompt.toLowerCase();
      const isAI = p.includes('ai') || p.includes('ml') || p.includes('machine') || p.includes('intelligence') || p.includes('data') || p.includes('python');
      return isAI ? fallback.roadmapDeepAI : fallback.roadmapDeepFullStack;
    }
    if (type === 'skillGapDeep') {
      const p = prompt.toLowerCase();
      const isAI = p.includes('ai') || p.includes('ml') || p.includes('machine') || p.includes('intelligence') || p.includes('data') || p.includes('python');
      return isAI ? fallback.skillGapDeepAI : fallback.skillGapDeepFullStack;
    }
    if (type === 'interviewSession') {
      const p = prompt.toLowerCase();
      const isAI = p.includes('ai') || p.includes('ml') || p.includes('machine') || p.includes('intelligence') || p.includes('data') || p.includes('python');
      return isAI ? fallback.interviewSessionAI : fallback.interviewSessionFullStack;
    }
    if (type === 'learningPath') return fallback.learningPath;
    if (type === 'learningTrack') return fallback.learningTrack;
    if (type === 'quizGenerate') return fallback.quizGenerate;
    if (type === 'certRecommend') return fallback.certRecommend;
    if (type === 'certImpact') return fallback.certImpact;
    if (type === 'linkedInPost') return fallback.linkedInPost;
    if (type === 'coverLetter') return fallback.coverLetter;
    if (type === 'progressInsights') return fallback.progressInsights;
    if (type === 'goalScore') return fallback.goalScore;
    if (type === 'careerPrediction') return fallback.careerPrediction;
    if (type === 'goalOptimizer') return fallback.goalOptimizer;
    if (type === 'goalGenerate') return fallback.goalGenerate;
    if (type === 'todayGoals') return fallback.todayGoals;
    if (type === 'careerChat') return fallback.careerChat;
    return fallback[type] || fallback.chat;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const schema = schemaHint || (
      type === 'projectMentor' ? PROJECT_MENTOR_SCHEMA :
      type === 'industryTrends' ? INDUSTRY_TRENDS_SCHEMA :
      type === 'roadmapDeep' ? ROADMAP_DEEP_SCHEMA :
      type === 'skillGapDeep' ? SKILL_GAP_DEEP_SCHEMA :
      type === 'interviewSession' ? INTERVIEW_SESSION_SCHEMA :
      type === 'interviewEvaluation' ? INTERVIEW_EVALUATION_SCHEMA : 
      type === 'chat' ? CHAT_SCHEMA :
      type === 'careerChat' ? CHAT_SCHEMA :
      type === 'certRecommend' ? CERT_RECOMMEND_SCHEMA :
      type === 'certImpact' ? CERT_IMPACT_SCHEMA :
      type === 'linkedInPost' ? LINKEDIN_POST_SCHEMA :
      type === 'coverLetter' ? COVER_LETTER_SCHEMA :
      type === 'jobMatch' ? JOB_MATCH_SCHEMA :
      type === 'learningPath' ? LEARNING_PATH_SCHEMA :
      type === 'learningTrack' ? LEARNING_TRACK_SCHEMA :
      type === 'quizGenerate' ? QUIZ_GENERATE_SCHEMA :
      type === 'goalGenerate' ? GOAL_GENERATE_SCHEMA :
      type === 'todayGoals' ? TODAY_GOALS_SCHEMA :
      type === 'goalScore' ? GOAL_SCORE_SCHEMA :
      type === 'careerPrediction' ? CAREER_PREDICTION_SCHEMA :
      type === 'goalOptimizer' ? GOAL_OPTIMIZER_SCHEMA : ''
    );
    const isJsonPrompt = !!schema;
    const systemPrompt = isJsonPrompt
      ? `You are an elite career mentor, technical advisor, and recruiter. Analyze the request below and return a valid JSON object strictly matching this schema. Be thorough and specific.\n\nSchema:\n${schema}\n\nRequest:\n${prompt}\n\nReturn ONLY valid JSON, no markdown, no explanation.`
      : `Return a helpful response for a career guidance request.\nPrompt: ${prompt}`;
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    if (isJsonPrompt) {
      return JSON.parse(text);
    }
    return text;
  } catch (error) {
    console.warn(`Gemini fallback used for ${type}: ${error.message}`);
    return fallback[type] || fallback.chat;
  }
}
