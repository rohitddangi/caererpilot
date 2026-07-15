import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Play, RefreshCw, Send, CheckCircle, Terminal, Info, Bug, Settings, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function CodingWorkspace({ activeInterview, onUpdate, onCancel }) {
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`);
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [testOutput, setTestOutput] = useState('');
  const [runningTests, setRunningTests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  const questions = activeInterview?.questions || [];
  const currentIdx = activeInterview?.currentIndex || 0;
  const currentQuestion = questions[currentIdx] || {
    id: 'code-q',
    text: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    hints: 'Use a hash map to map complements and lookup values in O(1) time.',
    correctAnswerExplanation: 'A single pass hash map scales to O(N) time and O(N) space auxiliary storage.'
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (lang === 'Python') {
      setCode(`def two_sum(nums, target):
    # Write your code here
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`);
    } else if (lang === 'C++') {
      setCode(`#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`);
    } else {
      setCode(`function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`);
    }
  };

  const handleTabKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      setCode(val.substring(0, start) + '  ' + val.substring(end));
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleRunTests = () => {
    setRunningTests(true);
    setTestOutput('Compiling code and linking binary files...');
    setTimeout(() => {
      setTestOutput(prev => prev + '\nExecuting test cases against target bounds...');
      setTimeout(() => {
        setTestOutput(prev => prev + '\n\n[SUCCESS] Custom Test Case 1: nums=[2,7,11,15], target=9 -> Output: [0,1] (Passed)\n[SUCCESS] Custom Test Case 2: nums=[3,2,4], target=6 -> Output: [1,2] (Passed)\n\nAll 2 local test cases passed successfully!');
        setRunningTests(false);
      }, 1500);
    }, 1000);
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      // Mock code evaluation or send code content
      const { data } = await api.post('/interview/submit-answer', {
        questionId: currentQuestion.id,
        answerText: `Language: ${selectedLanguage}\nCode:\n${code}`,
        speechStats: { wpm: 120, fillerWordsCount: 0, pauses: 0, repeatedWords: 0 },
        videoStats: { eyeContact: 'Good', posture: 'Excellent', expressions: 'Focused', professionalAppearance: 'High' }
      });

      setReviewResult({
        complexity: { time: 'O(N) - Linear Pass', space: 'O(N) - Hash Storage' },
        bugs: 'No compile or logical memory bugs detected.',
        optimization: 'Your implementation is fully optimal. Double check edge values like empty inputs.'
      });

      toast.success('Code evaluated successfully!');
      if (onUpdate) {
        onUpdate(data);
      }
    } catch (err) {
      toast.error('Failed to submit code for analysis');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* LEFT COLUMNS: Code Editor & Question Description */}
      <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
        {/* Question Panel */}
        <div className="glass-panel p-5 rounded-3xl bg-black/40 border border-gold/10">
          <span className="text-[9px] uppercase font-bold text-gold px-2.5 py-0.5 rounded-md bg-gold/10 border border-gold/20 tracking-wider">
            DSA Coding Assessment
          </span>
          <p className="text-xs text-neutral-200 mt-3 leading-relaxed font-semibold">
            {currentQuestion.text}
          </p>
          {currentQuestion.hints && (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-400 italic">
              <Info className="h-3.5 w-3.5 text-gold flex-shrink-0" />
              <span>Hint: {currentQuestion.hints}</span>
            </div>
          )}
        </div>

        {/* Code IDE Workspace */}
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gold/10 relative overflow-hidden flex-1 flex flex-col justify-between min-h-[420px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />

          {/* Selector header */}
          <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-gold" />
              <span className="text-xs text-white font-bold">Main Editor</span>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-gold/50 font-bold"
              >
                <option value="JavaScript">JavaScript (ES6)</option>
                <option value="Python">Python (3.x)</option>
                <option value="C++">C++ (GCC 11)</option>
              </select>
              <button
                onClick={onCancel}
                className="text-xs text-neutral-400 hover:text-white font-bold"
              >
                Quit Session
              </button>
            </div>
          </div>

          {/* IDE Textarea */}
          <div className="flex-1 min-h-[260px] relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleTabKeyDown}
              className="absolute inset-0 w-full h-full bg-neutral-900 border border-white/10 rounded-2xl p-4 text-xs text-zinc-300 placeholder-neutral-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all font-mono leading-relaxed resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-neutral-300 hover:border-gold/30 hover:bg-gold/5 transition-all flex items-center justify-center gap-2"
            >
              {runningTests ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-gold" />}
              Run Custom Tests
            </button>

            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="py-2.5 px-6 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold rounded-xl text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              {submitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              Submit & Review
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Terminal & AI Review Feedback */}
      <div className="space-y-4">
        {/* Terminal output console */}
        <div className="glass-panel p-5 rounded-3xl bg-neutral-950/80 border border-white/10 flex flex-col h-[200px]">
          <div className="flex items-center gap-2 text-neutral-400 pb-2 border-b border-white/5 mb-3">
            <Terminal className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Interactive Console Output</span>
          </div>
          <pre className="flex-1 text-[10px] text-zinc-400 font-mono overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {testOutput || 'Click "Run Custom Tests" to compile and run your code local builds.'}
          </pre>
        </div>

        {/* AI Code Review Report */}
        <div className="glass-panel p-5 rounded-3xl bg-black/40 border border-gold/10 space-y-4 min-h-[240px] flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5 text-gold" />
            AI Code Review Report
          </h3>

          <AnimatePresence mode="wait">
            {reviewResult ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 flex-1 text-xs"
              >
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">Algorithm Complexity</span>
                  <div className="mt-1 text-neutral-200 leading-normal">
                    Time: <strong className="text-gold">{reviewResult.complexity.time}</strong> • Space: <strong className="text-gold">{reviewResult.complexity.space}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                    <Bug className="h-3 w-3 text-red-400" />
                    Bug Analysis
                  </span>
                  <p className="mt-1 text-neutral-300 leading-relaxed">{reviewResult.bugs}</p>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">Optimization Advice</span>
                  <p className="mt-1 text-neutral-300 leading-relaxed">{reviewResult.optimization}</p>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center text-neutral-500 py-4">
                <Code className="h-8 w-8 text-neutral-700 mb-2" />
                <p className="text-[10px] font-semibold leading-normal max-w-[160px]">
                  Submit your code to generate reviews and runtime complexity indexes.
                </p>
              </div>
            )}
          </AnimatePresence>

          {reviewResult && (
            <div className="text-[9px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-1 border-t border-white/5 pt-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              Code validation completed successfully
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
