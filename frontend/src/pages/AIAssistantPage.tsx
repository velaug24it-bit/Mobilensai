import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Radio, 
  HelpCircle, 
  ArrowRight, 
  ShieldAlert, 
  TrendingDown, 
  Sliders, 
  User, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AIAssistantPage: React.FC = () => {
  const { chatMessages, sendAIMessage, currentJourney, selectedZone } = useApp();
  const [inputText, setInputText] = useState('');

  const suggestedQuestions = [
    { text: "Where is my bus?", category: "Transit Tracking", icon: Radio },
    { text: "When will the next bus arrive?", category: "Schedules", icon: Radio },
    { text: "Can I catch the 12A?", category: "Catchability", icon: HelpCircle },
    { text: "Will I make my train?", category: "Transfer Risk", icon: HelpCircle },
    { text: "Why did my friction increase?", category: "Friction Analytics", icon: TrendingDown },
    { text: "Why is this route showing elevated risk?", category: "Road Safety", icon: ShieldAlert },
    { text: "Show me a route with less walking.", category: "Routing Alternatives", icon: Sparkles },
    { text: "Show me a route with lower risk exposure.", category: "Road Safety", icon: ShieldAlert },
    { text: "What happens if bus frequency increases?", category: "What-If Simulation", icon: Sliders },
    { text: "How can this area be improved?", category: "City Interventions", icon: Sparkles }
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;
    sendAIMessage(query);
    setInputText('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Bot className="w-3 h-3" />
              MobiLens Assistant
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              🟣 AI ANALYSIS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Conversational Mobility & Transit Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ask natural language questions about your active journey, live bus locations, transfer buffers, road safety exposure, and city interventions.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <span className="text-amber-400 font-bold block mb-0.5">🟡 Notice:</span>
          Simulated demonstration data — not real-world transit prediction.
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 block">
          Frequently Asked Questions (Click to Ask):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {suggestedQuestions.map((q, idx) => {
            const Icon = q.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q.text)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-400/40 text-left text-xs transition-all shadow-sm group"
              >
                <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-semibold mb-1">
                  <Icon className="w-3 h-3" />
                  <span className="truncate">{q.category}</span>
                </div>
                <div className="text-white font-medium group-hover:text-cyan-300 line-clamp-2">
                  "{q.text}"
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin">
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser ? 'bg-cyan-500 text-slate-950' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`p-4 rounded-2xl text-xs space-y-1.5 ${
                  isUser 
                    ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 rounded-tr-none' 
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold">{isUser ? 'You' : 'MobiLens AI Assistant'}</span>
                    <span className="font-mono">{msg.time}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 rounded-b-2xl">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about live buses, transfer risk, friction, road safety, or interventions..."
              className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
