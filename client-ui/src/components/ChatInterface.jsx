import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    text: "Hello! I'm Maestro, your AI study assistant. I'm here to help you understand concepts, solve problems, or answer any questions about your practice session. What would you like to explore?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

function Avatar({ role }) {
  if (role === 'assistant') {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f99c00] to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-[#f99c00]/20">
        <Icon icon="solar:magic-stick-3-bold" width="14" className="text-white" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-lg shadow-blue-500/20">
      S
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const parts = msg.text.split('\n').filter(Boolean);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar role={msg.role} />
      <div className={`max-w-[85%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[#f99c00] text-[#0B1120] rounded-br-md font-medium'
              : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-md'
          }`}
        >
          {parts.map((line, i) => {
            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#f99c00]">$1</strong>');
            return (
              <p
                key={i}
                className={i > 0 ? 'mt-2' : ''}
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            );
          })}
        </div>
        <span className={`text-[10px] text-slate-500 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {msg.time}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <Avatar role="assistant" />
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-[#f99c00] rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatInterface({ isOpen, onClose, initialMessage }) {
  const [messages, setMessages] = useState(() => {
    if (initialMessage) {
      return [{
        id: 1,
        role: 'assistant',
        text: initialMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }];
    }
    return INITIAL_MESSAGES;
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isTyping || messages.length) scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    inputRef.current?.focus();

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const replies = [
      "Great question! Let me break that down for you step by step.\n\nFirst, identify the forces acting on the object. Then apply Newton's second law to find the acceleration.",
      "That's a common area of confusion. The key insight is to separate the horizontal and vertical components.\n\n**Horizontal:** constant velocity\n**Vertical:** constant acceleration (g = 9.8 m/s²)",
      "Exactly right! You're making great progress. Would you like to try a more challenging problem to test your understanding?",
      "Good thinking! Let's verify that with the formula. Remember to check your units at the end — that's where most mistakes happen.",
      "Here's a helpful tip: when dealing with inclined planes, always draw a free body diagram first. It makes identifying the force components much easier.",
    ];

    const botMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      text: replies[Math.floor(Math.random() * replies.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, botMsg]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages(initialMessage ? [{
      id: Date.now(),
      role: 'assistant',
      text: initialMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }] : INITIAL_MESSAGES);
  };

  // Quick action suggestions
  const quickActions = [
    { label: 'Explain step by step', icon: 'solar:list-check-linear' },
    { label: 'Give me a hint', icon: 'solar:lightbulb-linear' },
    { label: 'Check my answer', icon: 'solar:check-circle-linear' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div 
        className={`
          fixed lg:absolute inset-y-0 right-0 z-50
          w-full sm:w-96 lg:w-[400px]
          bg-[#0a0f1a] border-l border-white/5
          flex flex-col
          shadow-2xl shadow-black/50
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-gradient-to-r from-[#0a0f1a] to-[#111827] shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f99c00] to-amber-600 flex items-center justify-center shadow-lg shadow-[#f99c00]/20">
                <Icon icon="solar:magic-stick-3-bold" width="20" className="text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0f1a]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Maestro AI</h2>
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ready to help
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              title="New conversation"
            >
              <Icon icon="solar:restart-linear" width="18" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              title="Close chat"
            >
              <Icon icon="solar:close-circle-linear" width="20" />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setInputValue(action.label)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-[#f99c00]/10 hover:border-[#f99c00]/30 text-xs text-slate-300 hover:text-[#f99c00] whitespace-nowrap transition-all shrink-0"
              >
                <Icon icon={action.icon} width="14" />
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-4 border-t border-white/5 bg-[#0a0f1a] shrink-0">
          <div className="flex items-end gap-2 bg-white/5 border border-white/10 hover:border-white/15 focus-within:border-[#f99c00]/40 focus-within:ring-2 focus-within:ring-[#f99c00]/10 rounded-xl px-4 py-3 transition-all">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Maestro anything..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none resize-none leading-relaxed py-0.5 min-h-[20px] max-h-[100px]"
              style={{ scrollbarWidth: 'none' }}
            />

            <button
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                inputValue.trim()
                  ? 'bg-[#f99c00] hover:bg-[#e88d00] text-[#0B1120] hover:scale-105 active:scale-95 shadow-lg shadow-[#f99c00]/20'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Icon icon="solar:arrow-up-linear" width="18" />
            </button>
          </div>

          <p className="text-[10px] text-slate-600 text-center mt-2">
            Press Enter to send
          </p>
        </div>
      </div>
    </>
  );
}
