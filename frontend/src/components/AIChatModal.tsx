import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, CornerDownLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AIChatModal: React.FC = () => {
  const { isAIAssistantOpen, setIsAIAssistantOpen, chatMessages, sendAIMessage } = useApp();
  const [inputValue, setInputValue] = useState('');

  if (!isAIAssistantOpen) return null;

  const quickPrompts = [
    "Where is my bus?",
    "Can I catch the 15?",
    "Which bus comes next?",
    "Will I miss my connection?",
    "Why did my friction increase?",
    "Why is the TCR to FXEC journey difficult?",
    "Which intervention helps Zone 17?"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendAIMessage(text);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9990] w-96 max-w-[calc(100vw-3rem)] h-[560px] bg-[#111827] border-2 border-cyan-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
      {/* Chat Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>MobiLens AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </h3>
            <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
              Local Prototype Intelligence
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAIAssistantOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-3 bg-[#0B0F19]/60 border-b border-slate-800/80 overflow-x-auto scrollbar-none flex gap-1.5">
        {quickPrompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-full text-[11px] bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 border border-slate-700/60 whitespace-nowrap transition-colors flex-shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
        {chatMessages.map((msg, idx) => {
          const isAI = msg.role === 'assistant';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                isAI ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}>
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                isAI
                  ? 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-sm'
                  : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-sm font-medium'
              }`}>
                <p>{msg.text}</p>
                <span className="text-[9px] text-slate-400 mt-1 block text-right">
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about journeys, friction, or interventions..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
