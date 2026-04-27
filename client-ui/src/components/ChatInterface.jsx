import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

const CONVERSATIONS = [
  { id: 1, title: 'Kinematics Study Help', preview: 'Explain projectile motion...', time: '2m ago', unread: 2, active: true },
  { id: 2, title: 'Integration Techniques', preview: 'How do I solve ∫x²dx?', time: '1h ago', unread: 0, active: false },
  { id: 3, title: 'Exam Prep Strategy', preview: 'What should I focus on?', time: 'Yesterday', unread: 0, active: false },
  { id: 4, title: 'Derivatives Deep Dive', preview: 'Chain rule examples...', time: '3d ago', unread: 0, active: false },
  { id: 5, title: 'Thermodynamics Q&A', preview: 'Carnot cycle explained', time: '1w ago', unread: 0, active: false },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    text: "Hey Sarah! Ready to tackle Kinematics today? I can walk you through projectile motion, vectors, or we can run a quick practice set. What would you like?",
    time: '10:42 AM',
    status: 'read',
  },
  {
    id: 2,
    role: 'user',
    text: 'Can you explain projectile motion step by step? I keep getting confused with the vertical and horizontal components.',
    time: '10:43 AM',
    status: 'read',
  },
  {
    id: 3,
    role: 'assistant',
    text: "Absolutely! The key insight is that horizontal and vertical motion are completely **independent**.\n\n**Horizontal:** constant velocity (no acceleration, ignoring air resistance)\n**Vertical:** constant acceleration downward at g = 9.8 m/s²\n\nSo you split every problem into two separate equations and solve them independently — the only thing they share is **time**.",
    time: '10:43 AM',
    status: 'read',
  },
  {
    id: 4,
    role: 'user',
    text: 'That makes sense! Can you give me a practice problem?',
    time: '10:45 AM',
    status: 'read',
  },
  {
    id: 5,
    role: 'assistant',
    text: "Sure! Here's one:\n\nA ball is launched horizontally from a cliff 80 m high at 20 m/s. How far from the base of the cliff does it land?\n\nTry it yourself first — remember to find time from the vertical, then use it in the horizontal. Let me know when you're ready for the solution! 🎯",
    time: '10:45 AM',
    status: 'read',
  },
];

function Avatar({ role }) {
  if (role === 'assistant') {
    return (
      <div className="w-8 h-8 rounded-full bg-[#f99c00]/15 border border-[#f99c00]/30 flex items-center justify-center shrink-0">
        <Icon icon="solar:star-bold" width="15" className="text-[#f99c00]" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 text-xs font-bold">
      S
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const parts = msg.text.split('\n').filter(Boolean);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      <Avatar role={msg.role} />
      <div className={`max-w-[75%] sm:max-w-[65%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[#f99c00] text-[#0B1120] rounded-tr-sm font-medium'
              : 'bg-white/8 border border-white/8 text-slate-200 rounded-tl-sm'
          }`}
        >
          {parts.map((line, i) => {
            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return (
              <p
                key={i}
                className={i > 0 ? 'mt-2' : ''}
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            );
          })}
        </div>
        <div className={`flex items-center gap-1.5 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[11px] text-slate-600">{msg.time}</span>
          {isUser && (
            <Icon
              icon={msg.status === 'read' ? 'solar:check-read-linear' : 'solar:check-linear'}
              width="14"
              className={msg.status === 'read' ? 'text-[#f99c00]' : 'text-slate-600'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <Avatar role="assistant" />
      <div className="bg-white/8 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
          />
        ))}
      </div>
    </div>
  );
}

function ConversationItem({ conv, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded-xl transition-all group flex gap-3 items-start ${
        active
          ? 'bg-[#f99c00]/10 border border-[#f99c00]/20'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${active ? 'bg-[#f99c00]/20 text-[#f99c00]' : 'bg-white/8 text-slate-400'}`}>
        {conv.title.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-sm font-medium truncate ${active ? 'text-[#f99c00]' : 'text-slate-200'}`}>
            {conv.title}
          </span>
          <span className="text-[11px] text-slate-600 shrink-0">{conv.time}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 truncate">{conv.preview}</p>
          {conv.unread > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#f99c00] text-[#0B1120] text-[10px] font-bold flex items-center justify-center shrink-0">
              {conv.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ChatbotUI() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConv, setActiveConv] = useState(1);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    if (isTyping || messages.length) scrollToBottom();
  }, [messages, isTyping]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
  };

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    inputRef.current?.focus();

    await new Promise((r) => setTimeout(r, 1400 + Math.random() * 600));

    const replies = [
      "Great question! Let me break that down for you step by step.",
      "That's a common sticking point. The trick is to isolate each variable before substituting.",
      "Exactly right! You're connecting the concepts well. Want to try a harder version?",
      "Good thinking — let's verify that with the formula and see if the numbers check out.",
    ];

    const botMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      text: replies[Math.floor(Math.random() * replies.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, botMsg]);

    setMessages((prev) =>
      prev.map((m) => (m.id === userMsg.id ? { ...m, status: 'read' } : m))
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    const newId = Date.now();
    const newConv = {
      id: newId,
      title: 'New Conversation',
      preview: 'Start typing...',
      time: 'Just now',
      unread: 0,
      active: true,
    };
    setConversations((prev) => [newConv, ...prev.map((c) => ({ ...c, active: false }))]);
    setActiveConv(newId);
    setMessages([]);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-full w-full bg-[#0B1120] overflow-hidden">

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          w-72 md:w-64 lg:w-72
          bg-[#080E1A] border-r border-white/5
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#f99c00]/15 border border-[#f99c00]/30 flex items-center justify-center">
              <Icon icon="solar:star-bold" width="14" className="text-[#f99c00]" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">StudyAI</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-[#f99c00] transition-all"
              title="New chat"
            >
              <Icon icon="solar:pen-new-square-linear" width="17" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-all md:hidden"
            >
              <Icon icon="solar:close-circle-linear" width="17" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-2">
            <Icon icon="solar:magnifer-linear" width="15" className="text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search conversations"
              className="bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none w-full"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5 scrollbar-thin">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-2 py-2">
            Recent
          </p>
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              active={conv.id === activeConv}
              onClick={() => {
                setActiveConv(conv.id);
                setSidebarOpen(false);
              }}
            />
          ))}
        </div>

        {/* User profile */}
        <div className="px-3 py-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
              S
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200 truncate">Sarah Johnson</p>
              <p className="text-xs text-slate-600 truncate">Free plan</p>
            </div>
            <Icon icon="solar:settings-linear" width="16" className="text-slate-600 shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Chat header */}
        <header className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile/tablet */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-all md:hidden"
            >
              <Icon icon="solar:hamburger-menu-linear" width="20" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#f99c00]/15 border border-[#f99c00]/30 flex items-center justify-center shrink-0">
                <Icon icon="solar:star-bold" width="14" className="text-[#f99c00]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  {conversations.find((c) => c.id === activeConv)?.title ?? 'New Chat'}
                </p>
                <p className="text-[11px] text-emerald-400 leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Online
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="w-9 h-9 rounded-xl hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-all hidden sm:flex">
              <Icon icon="solar:magnifer-linear" width="18" />
            </button>
            <button className="w-9 h-9 rounded-xl hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-all hidden sm:flex">
              <Icon icon="solar:bookmark-linear" width="18" />
            </button>
            <button className="w-9 h-9 rounded-xl hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <Icon icon="solar:menu-dots-bold" width="18" />
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 space-y-5"
        >
          {/* Date separator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[11px] text-slate-600 font-medium shrink-0">Today</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#f99c00]/10 border border-[#f99c00]/20 flex items-center justify-center">
                <Icon icon="solar:star-bold" width="28" className="text-[#f99c00]" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">Start a new conversation</p>
                <p className="text-slate-500 text-sm">Ask anything about your studies</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 w-full max-w-md">
                {['Explain a concept', 'Practice problems', 'Exam strategy', 'Quick quiz'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInputValue(s)}
                    className="px-4 py-2.5 rounded-xl border border-white/8 bg-white/5 hover:bg-white/10 hover:border-[#f99c00]/20 text-sm text-slate-300 hover:text-white transition-all text-left"
                  >
                    {s} →
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
          )}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom FAB */}
        {showScrollBtn && (
          <div className="absolute bottom-24 right-6 sm:right-8 z-20">
            <button
              onClick={() => scrollToBottom()}
              className="w-9 h-9 rounded-full bg-[#111827] border border-white/10 hover:border-[#f99c00]/40 flex items-center justify-center text-slate-400 hover:text-[#f99c00] shadow-lg transition-all hover:scale-110 active:scale-95"
            >
              <Icon icon="solar:arrow-down-linear" width="18" />
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="px-3 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 border-t border-white/5 bg-[#0B1120] shrink-0">
          {/* Quick suggestions — visible when few messages */}
          {messages.length <= 2 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {['Projectile motion', 'Integration by parts', 'Newton\'s laws'].map((s) => (
                <button
                  key={s}
                  onClick={() => setInputValue(s)}
                  className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-400 hover:text-slate-200 whitespace-nowrap transition-all shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 sm:gap-3 bg-white/5 border border-white/8 hover:border-white/12 focus-within:border-[#f99c00]/40 rounded-2xl px-3 sm:px-4 py-2.5 transition-all">
            {/* Attachment */}
            <button className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all shrink-0 mb-0.5 hidden sm:flex">
              <Icon icon="solar:paperclip-linear" width="18" />
            </button>

            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none resize-none leading-relaxed py-1 min-h-[24px] max-h-[120px]"
              style={{ scrollbarWidth: 'none' }}
            />

            {/* Voice */}
            <button className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all shrink-0 mb-0.5">
              <Icon icon="solar:microphone-linear" width="18" />
            </button>

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 mb-0.5 ${
                inputValue.trim()
                  ? 'bg-[#f99c00] hover:bg-[#f88c00] text-[#0B1120] hover:scale-110 active:scale-95'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Icon icon="solar:arrow-up-linear" width="16" />
            </button>
          </div>

          <p className="text-[11px] text-slate-700 text-center mt-2 hidden sm:block">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
