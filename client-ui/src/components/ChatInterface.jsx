import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useLocalization } from '../contexts/LocalizationContext';

export default function ChatInterface({ isOpen, onClose, initialMessage }) {
  const { t } = useLocalization();
  const [messages, setMessages] = useState([
    { role: 'ai', content: initialMessage || "Hello Sarah! I'm Maestro. I'm here if you have any follow-up questions about this scenario or need a hint.", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        role: 'ai',
        content: `Great question! Let me help you with that. Based on your solution, here are some insights...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Chat Panel */}
      <div className={`fixed bottom-0 right-0 top-0 w-full sm:w-96 lg:w-1/3 bg-gradient-to-b from-[#111827] to-[#0D0F1B] border-l border-white/5 flex flex-col shadow-2xl z-40 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0 lg:border-l lg:rounded-none`}>
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-white/5 bg-[#0B1120]/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f99c00] to-orange-600 flex items-center justify-center text-white">
              <Icon icon="solar:magic-stick-3-bold" width="20" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{t('chat.maestro')}</h3>
              <p className="text-xs text-emerald-400">{t('chat.online')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <Icon icon="solar:close-circle-linear" width="24" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs sm:max-w-sm px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[#f99c00] text-[#0B1120] rounded-br-none'
                    : 'bg-white/5 text-slate-100 border border-white/10 rounded-bl-none'
                } group relative`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                <span className={`text-xs mt-2 block ${msg.role === 'user' ? 'text-[#0B1120]/60' : 'text-slate-500'}`}>
                  {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 rounded-bl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-white/5 bg-[#0B1120]/50 p-4 sm:p-5 sticky bottom-0">
          <div className="flex gap-2 sm:gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.typeMessage')}
              rows="1"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 focus:border-transparent resize-none max-h-24 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="px-3 sm:px-4 py-2.5 bg-[#f99c00] hover:bg-[#f88c00] disabled:bg-slate-600 disabled:cursor-not-allowed text-[#0B1120] rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 min-w-max"
            >
              {isLoading ? (
                <Icon icon="solar:loader-bold" width="18" className="animate-spin" />
              ) : (
                <Icon icon="solar:send-linear" width="18" />
              )}
              <span className="hidden sm:inline text-sm">{t('chat.send')}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">{t('chat.pressEnter')}</p>
        </div>
      </div>
    </>
  );
}
