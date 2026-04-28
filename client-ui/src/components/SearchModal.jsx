import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { examLevels, physicsTopics, mathematicsTopics, ugandaContextScenarios } from '../data/examStructure';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Build searchable items from exam structure data
  const searchableItems = useMemo(() => {
    const items = [];

    // Add exam levels as quick navigation
    Object.values(examLevels).forEach(level => {
      items.push({
        id: `level-${level.id}`,
        type: 'Level',
        title: level.name,
        description: level.description,
        icon: 'solar:book-2-bold',
        path: '/practice',
        color: level.color
      });
    });

    // Add physics topics
    Object.entries(physicsTopics).forEach(([level, topics]) => {
      topics.forEach(topic => {
        items.push({
          id: topic.id,
          type: 'Physics',
          title: topic.name,
          description: `${topic.subtopics.slice(0, 3).join(', ')} - ${topic.questions} questions`,
          icon: 'solar:flash-bold',
          path: '/practice',
          color: 'from-blue-500 to-cyan-500',
          level
        });
      });
    });

    // Add mathematics topics
    Object.entries(mathematicsTopics).forEach(([level, topics]) => {
      topics.forEach(topic => {
        items.push({
          id: topic.id,
          type: 'Mathematics',
          title: topic.name,
          description: `${topic.subtopics.slice(0, 3).join(', ')} - ${topic.questions} questions`,
          icon: 'solar:calculator-bold',
          path: '/practice',
          color: 'from-rose-500 to-pink-500',
          level
        });
      });
    });

    // Add Uganda context scenarios
    [...ugandaContextScenarios.physics, ...ugandaContextScenarios.mathematics].forEach(scenario => {
      items.push({
        id: scenario.id,
        type: 'Scenario',
        title: scenario.title,
        description: `${scenario.topic} - ${scenario.examLevel}`,
        icon: 'solar:document-text-bold',
        path: '/practice',
        color: 'from-amber-500 to-orange-500'
      });
    });

    // Add navigation pages
    items.push(
      { id: 'nav-dashboard', type: 'Page', title: 'Dashboard', description: 'View your learning progress', icon: 'solar:home-2-bold', path: '/dashboard', color: 'from-slate-500 to-slate-600' },
      { id: 'nav-practice', type: 'Page', title: 'Practice', description: 'Practice questions by topic', icon: 'solar:book-bookmark-bold', path: '/practice', color: 'from-slate-500 to-slate-600' },
      { id: 'nav-analytics', type: 'Page', title: 'Analytics', description: 'Track your performance', icon: 'solar:chart-square-bold', path: '/analytics', color: 'from-slate-500 to-slate-600' },
      { id: 'nav-mock-exams', type: 'Page', title: 'Mock Exams', description: 'Take full practice exams', icon: 'solar:target-bold', path: '/mock-exams', color: 'from-slate-500 to-slate-600' },
      { id: 'nav-profile', type: 'Page', title: 'Profile', description: 'Manage your account', icon: 'solar:user-circle-bold', path: '/profile', color: 'from-slate-500 to-slate-600' }
    );

    return items;
  }, []);

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      // Show recent/suggested items when no query
      return searchableItems.slice(0, 6);
    }

    const lowerQuery = query.toLowerCase();
    return searchableItems
      .filter(item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.type.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);
  }, [query, searchableItems]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredResults[selectedIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[15%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-50">
        <div className="bg-[#111827] border border-white/10 rounded-2xl -black/50 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <Icon icon="solar:magnifier-linear" width="22" className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, questions, pages..."
              className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-base focus:outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-white/5 border border-white/10 rounded px-2 py-1">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto py-2">
            {filteredResults.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Icon icon="solar:ghost-linear" width="40" className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No results found for &quot;{query}&quot;</p>
              </div>
            ) : (
              <div className="space-y-1 px-2">
                {query.trim() === '' && (
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 py-2">Suggestions</p>
                )}
                {filteredResults.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-left transition-all group ${
 selectedIndex === index
 ? 'bg-[#f99c00]/10'
 : 'hover:bg-white/5'
 }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white shrink-0 ${
 selectedIndex === index ? 'scale-110' : ''
 } transition-transform`}>
                      <Icon icon={item.icon} width="20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${
 selectedIndex === index ? 'text-[#f99c00]' : 'text-white'
 }`}>
                          {item.title}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 shrink-0">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                    </div>
                    <Icon 
                      icon="solar:alt-arrow-right-linear" 
                      width="18" 
                      className={`shrink-0 transition-all ${
 selectedIndex === index ? 'text-[#f99c00] translate-x-1' : 'text-slate-600'
 }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5">↑</kbd>
                <kbd className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5">↓</kbd>
                <span className="ml-1">Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5">↵</kbd>
                <span className="ml-1">Select</span>
              </span>
            </div>
            <span className="hidden sm:block">Powered by EduPractice</span>
          </div>
        </div>
      </div>
    </>
  );
}
