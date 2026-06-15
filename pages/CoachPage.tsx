import React, { useState, useContext, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { getCoachResponse } from "../services/geminiService";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  TagIcon,
  CalendarDaysIcon,
} from "../components/icons";
import MarkdownRenderer from "../components/MarkdownRenderer";

interface CoachMessage {
  sender: "user" | "coach";
  text: string;
}

const CoachPage: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const storageKey = currentUser ? `coach_messages_${currentUser.id}` : "";

  const [messages, setMessages] = useState<CoachMessage[]>(() => {
    if (currentUser) {
      const cached = sessionStorage.getItem(`coach_messages_${currentUser.id}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error("Error parsing cached coach messages:", e);
        }
      }
    }
    return [
      {
        sender: "coach",
        text: `Hi! I'm your **SkillSwap AI Coach**. How can I help you maximize your learning today?`,
      },
    ];
  });

  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(() => {
    if (currentUser) {
      const cached = sessionStorage.getItem(`coach_messages_${currentUser.id}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          return parsed.length === 1;
        } catch (e) {}
      }
    }
    return true;
  });

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (currentUser && storageKey) {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, currentUser, storageKey]);

  if (!currentUser) return null;

  const handleSendMessage = async (textToSend: string) => {
    if (textToSend.trim() === "" || isLoading) return;

    const userMessage: CoachMessage = {
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const coachResponseText = await getCoachResponse(
        currentUser.id,
        textToSend,
      );
      const coachMessage: CoachMessage = {
        sender: "coach",
        text: coachResponseText,
      };
      setMessages((prev) => [...prev, coachMessage]);
    } catch (error) {
      const errorMessage: CoachMessage = {
        sender: "coach",
        text: "Sorry, I'm having a little trouble connecting right now. Let's try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Error getting coach response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(newMessage);
  };

  // Suggestions customized to user skills
  const getSuggestions = () => {
    const list = [
      {
        text: "How should I prepare for my next peer swap session?",
        icon: AcademicCapIcon,
        color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
      },
      {
        text: "How can I earn more tokens on SkillSwap?",
        icon: CurrencyDollarIcon,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      },
    ];

    if (currentUser.learns && currentUser.learns.length > 0) {
      list.unshift({
        text: `Create a 4-week roadmap to learn ${currentUser.learns[0].name}`,
        icon: CalendarDaysIcon,
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      });
    } else {
      list.unshift({
        text: "Help me create a 2-week learning plan",
        icon: CalendarDaysIcon,
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      });
    }

    if (currentUser.teaches && currentUser.teaches.length > 0) {
      list.push({
        text: `What makes a great teaching session for ${currentUser.teaches[0].name}?`,
        icon: LightBulbIcon,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      });
    }

    return list;
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#e8edf2] dark:bg-[#121a2e] pt-28 pb-6 px-6 lg:px-8 gap-6 overflow-hidden relative font-sans">
      
      {/* Left Sidebar Panel - Learning Strategist Context */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-2 lg:pb-0 scrollbar-thin">
        
        {/* Coach Identity Card */}
        <div className="bg-background rounded-3xl p-6 border border-slate-200/10 dark:border-slate-800/10 shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),_-6px_-6px_16px_rgba(255,255,255,0.03)] flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 animate-pulse blur-sm -z-10 scale-105" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-purple-500 flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-9 h-9 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-emerald-500 border-4 border-[#e8edf2] dark:border-[#121a2e] rounded-full shadow-md animate-bounce" />
          </div>
          
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            SkillSwap AI Coach
          </h2>
          <p className="text-xs text-text-muted font-bold mt-1">
            Your Personalized Learning Strategist
          </p>

          <div className="mt-4 w-full bg-background rounded-2xl p-3 border border-slate-200/10 dark:border-slate-800/10 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.35),_inset_-2px_-2px_5px_rgba(255,255,255,0.85)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.45),_inset_-2px_-2px_5px_rgba(255,255,255,0.02)] flex items-center justify-between">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Status</span>
            <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Active
            </span>
          </div>
        </div>

        {/* User Profile Context Card */}
        <div className="bg-background rounded-3xl p-6 border border-slate-200/10 dark:border-slate-800/10 shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),_-6px_-6px_16px_rgba(255,255,255,0.02)] flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
            <AcademicCapIcon className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              My Profile Context
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold">Balance:</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-500 font-black">
              <CurrencyDollarIcon className="w-4 h-4" />
              {currentUser.tokens} Tokens
            </div>
          </div>

          <div>
            <p className="text-[11px] text-text-muted font-black uppercase tracking-wider mb-2">I want to Learn:</p>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.learns && currentUser.learns.length > 0 ? (
                currentUser.learns.map((skill) => (
                  <span key={skill.id} className="text-[11px] bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-md text-sky-500 font-bold flex items-center gap-1">
                    <TagIcon className="w-3 h-3" />
                    {skill.name}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-text-muted italic">No learning skills added</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-text-muted font-black uppercase tracking-wider mb-2">I can Teach:</p>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.teaches && currentUser.teaches.length > 0 ? (
                currentUser.teaches.map((skill) => (
                  <span key={skill.id} className="text-[11px] bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-md text-purple-500 font-bold flex items-center gap-1">
                    <TagIcon className="w-3 h-3" />
                    {skill.name}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-text-muted italic">No teaching skills added</span>
              )}
            </div>
          </div>
        </div>

        {/* Bounds Reminder Card (Sunken) */}
        <div className="bg-background rounded-3xl p-5 border border-slate-300/10 dark:border-slate-800/10 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.45),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Coach Scope
            </h4>
          </div>
          <p className="text-[11px] leading-relaxed text-text-muted font-medium">
            I am specialized in custom <strong>learning roadmaps</strong>, <strong>study habits</strong>, <strong>swap session prep</strong>, and <strong>token guides</strong>. I will reject requests unrelated to learning or SkillSwap rules.
          </p>
        </div>
      </div>

      {/* Right Chat Console Area */}
      <div className="flex-1 flex flex-col h-full bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/10 dark:border-slate-800/10 rounded-[32px] shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),_-6px_-6px_16px_rgba(255,255,255,0.02)] overflow-hidden">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/30 dark:border-slate-800/40 bg-[#e8edf2]/50 dark:bg-[#121a2e]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
              AI Strategy Console
            </span>
          </div>
        </div>

        {/* Message History Screen */}
        <div
          className="flex-1 p-6 overflow-y-auto space-y-6 min-h-0 scrollbar-thin"
          id="coach-messages-container"
        >
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-3.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "coach" && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-xl px-5 py-4.5 rounded-[26px] ${
                  msg.sender === "user"
                    ? "bg-gradient-to-tr from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10 border border-sky-400/30 dark:border-sky-500/20 text-slate-800 dark:text-slate-100 rounded-br-sm shadow-[4px_4px_10px_rgba(163,177,198,0.35),_-4px_-4px_10px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),_-4px_-4px_10px_rgba(255,255,255,0.02)]"
                    : "bg-[#e8edf2] dark:bg-[#121a2e] shadow-[5px_5px_12px_rgba(163,177,198,0.35),_-5px_-5px_12px_rgba(255,255,255,0.85)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),_-5px_-5px_12px_rgba(255,255,255,0.02)] border border-slate-200/20 dark:border-slate-800/10 text-slate-900 dark:text-slate-100 rounded-bl-sm"
                }`}
              >
                {msg.sender === "coach" ? (
                  <div className="prose prose-slate dark:prose-invert text-xs sm:text-sm max-w-none leading-relaxed">
                    <MarkdownRenderer text={msg.text} />
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">{msg.text}</p>
                )}
              </div>

              {msg.sender === "user" && (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200/20 dark:border-slate-800/10 shadow-md"
                />
              )}
            </motion.div>
          ))}

          {/* Inline Suggestion Chips */}
          {showSuggestions && messages.length === 1 && (
            <div className="pl-12 flex flex-wrap gap-2.5 mt-4">
              {getSuggestions().map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendMessage(suggestion.text)}
                    className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-[11px] font-black border uppercase tracking-wider transition-all duration-200 shadow-[3px_3px_6px_rgba(163,177,198,0.2),_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.35),_-3px_-3px_6px_rgba(255,255,255,0.02)] hover:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),_inset_-2px_-2px_4px_#ffffff] dark:hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),_inset_-2px_-2px_4px_rgba(255,255,255,0.02)] ${suggestion.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{suggestion.text}</span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Loading States */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-3.5 justify-start"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div className="bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/20 dark:border-slate-800/10 shadow-[5px_5px_12px_rgba(163,177,198,0.35),_-5px_-5px_12px_rgba(255,255,255,0.85)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),_-5px_-5px_12px_rgba(255,255,255,0.02)] px-5 py-4 rounded-[26px] rounded-bl-sm">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Tray Area */}
        <div className="p-6 border-t border-slate-200/30 dark:border-slate-800/40 bg-[#e8edf2]/50 dark:bg-[#121a2e]/50">
          <form onSubmit={onSubmitForm} className="flex items-center gap-4">
            
            {/* Sunken track container */}
            <div className="flex-1 flex items-center gap-3 px-5 py-2.5 bg-[#e8edf2] dark:bg-[#121a2e] rounded-2xl border border-slate-300/10 dark:border-slate-800/10 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.45),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask for a learning roadmap, skill strategy, or motivation tips..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-text-muted focus:outline-none py-1 disabled:opacity-50"
                disabled={isLoading}
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              whileHover={newMessage.trim() && !isLoading ? { scale: 1.05 } : {}}
              className={`p-3.5 rounded-2xl transition-all duration-200 shrink-0 ${
                newMessage.trim() && !isLoading
                  ? "bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-[3px_3px_8px_rgba(14,165,233,0.35),_inset_-2px_-2px_4px_rgba(255,255,255,0.2)] hover:from-sky-400 hover:to-indigo-500 active:scale-95"
                  : "bg-background text-text-muted border border-slate-200/10 dark:border-slate-800/10 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.45),_inset_-2px_-2px_4px_rgba(255,255,255,0.02)] opacity-60 cursor-not-allowed"
              }`}
              disabled={!newMessage.trim() || isLoading}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CoachPage;
