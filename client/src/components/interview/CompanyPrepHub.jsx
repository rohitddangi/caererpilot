import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Briefcase, CheckCircle2, ChevronRight, Play, Terminal, HelpCircle, Star, Sparkles } from 'lucide-react';

export default function CompanyPrepHub({ onStartMock }) {
  const [selectedCompany, setSelectedCompany] = useState('Google');

  const companies = {
    Google: {
      readiness: 62,
      difficulty: 'Expert',
      pattern: '1 HR round, 3-4 DSA coding rounds (Trees, Graphs, DP), 1 Googlyness (behavioral/leadership) round.',
      tips: [
        'Practice time/space complexity analysis tradeoffs strictly.',
        'Focus on advanced graph structures (Dijkstra, MST, Union-Find) and dynamic programming.',
        'Adopt the STAR method for Googlyness questions, highlighting team harmony.'
      ],
      questions: [
        'Explain how to locate short paths in a distributed network grid.',
        'Tell me about a time you resolved a major deadlock issue in production workflows.',
        'Design a system that limits API requests dynamically across multiple datacenters.'
      ]
    },
    Amazon: {
      readiness: 68,
      difficulty: 'Expert',
      pattern: '1 Phone filter screen, 3 technical coding rounds (System Design + Coding), 1 Leadership Principles round.',
      tips: [
        'Familiarize yourself with Amazon Leadership Principles (customer obsession, ownership).',
        'Practice designing microservices and distributed database scaling strategies.',
        'Solve 150 LeetCode Medium algorithms questions.'
      ],
      questions: [
        'Design a scalable e-commerce inventory lookup microservice.',
        'Discuss a time you disagreed with a manager. How did you resolve the conflict?',
        'How would you manage schema migrations with zero-downtime constraints?'
      ]
    },
    Microsoft: {
      readiness: 70,
      difficulty: 'Advanced',
      pattern: '1 online test, 2-3 DSA/System Design coding rounds, 1 Director managerial check.',
      tips: [
        'Focus on array algorithms, string parsers, linked lists, stacks, and queues.',
        'Practice coding clean, error-free architectures on a whiteboard/blank editor.',
        'Study caching (Redis) and SQL relational database transactional parameters.'
      ],
      questions: [
        'Reverse nodes in k-group subsets inside a linked list.',
        'How would you design a distributed cache system with LRU invalidation?',
        'Tell me about a project where you took major technical risks.'
      ]
    },
    TCS: {
      readiness: 92,
      difficulty: 'Beginner',
      pattern: '1 Cognitive test, 1 Technical interview (OOP basics, HTML, SQL), 1 HR managerial check.',
      tips: [
        'Study Object-Oriented Programming (OOP) properties: Encapsulation, Polymorphism.',
        'Prepare basic SQL queries: JOIN operations, GROUP BY, aggregators.',
        'Highlight communication and learning velocity during HR rounds.'
      ],
      questions: [
        'What is polymorphism? Provide a real-world programming example.',
        'Explain the difference between clustered and non-clustered database index tables.',
        'Are you comfortable relocating to different project client offices?'
      ]
    },
    Accenture: {
      readiness: 88,
      difficulty: 'Intermediate',
      pattern: '1 online assessment, 1 Technical round (projects discussions + SQL), 1 HR/Cognitive check.',
      tips: [
        'Prepare to defend all projects listed in your resume in detail.',
        'Be ready to write basic SQL queries and explain database schema normalizations.',
        'Review basic cloud service architectures (AWS/GCP foundational layers).'
      ],
      questions: [
        'Explain the architectural layers of your Weather Dashboard project.',
        'Write a SQL query to find the second-highest salary from an Employee table.',
        'How do you manage configuration credentials securely in production deployments?'
      ]
    }
  };

  const activeComp = companies[selectedCompany];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Companies side selection grid */}
      <div>
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-gold" />
              Target Company Directory
            </h3>
            <p className="text-[10px] text-neutral-400">
              Select a target employer to review custom recruitment patterns and question blocks.
            </p>
          </div>

          <div className="space-y-2">
            {Object.keys(companies).map((name) => {
              const comp = companies[name];
              const isSelected = selectedCompany === name;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedCompany(name)}
                  className={`w-full flex justify-between items-center p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-gold bg-gold/10 text-white'
                      : 'border-white/5 bg-white/5 text-neutral-400 hover:border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{name}</span>
                    <span className="text-[9px] text-neutral-400 font-semibold uppercase">Difficulty: {comp.difficulty}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gold font-bold text-xs">{comp.readiness}%</span>
                    <span className="text-[8px] text-neutral-500 uppercase font-semibold block">Readiness</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target details and custom questions */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />

          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <div>
              <span className="text-[9px] uppercase font-bold text-gold px-2.5 py-0.5 rounded-md bg-gold/10 border border-gold/20 tracking-wider">
                Recruitment profile
              </span>
              <h2 className="text-lg font-bold text-white mt-1.5">{selectedCompany} Preparation Guide</h2>
            </div>
            
            <button
              onClick={() => onStartMock({ role: 'Full Stack Developer', company: selectedCompany, type: 'Technical' })}
              className="px-4.5 py-2 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold rounded-xl text-xs hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md shadow-gold/5"
            >
              <Play className="h-3 w-3 fill-black" />
              Launch Mock Round
            </button>
          </div>

          {/* Recruitment pattern */}
          <div>
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Standard Pipeline Pattern</h4>
            <p className="text-xs text-neutral-200 leading-relaxed font-semibold">{activeComp.pattern}</p>
          </div>

          {/* Prep check list tips */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Preparation Checklists
            </h4>
            <ul className="space-y-2">
              {activeComp.tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-neutral-300 leading-relaxed flex items-start gap-2">
                  <span className="text-gold font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expected Question bank */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-gold" />
              Frequently Asked Questions
            </h4>
            <div className="space-y-2.5">
              {activeComp.questions.map((q, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-xs text-neutral-300 leading-relaxed font-semibold">
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
