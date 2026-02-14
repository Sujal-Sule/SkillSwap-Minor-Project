import React, { useState, useContext, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { getCoachResponse } from "../services/geminiService";
import { PaperAirplaneIcon, SparklesIcon } from "../components/icons";
import MarkdownRenderer from "../components/MarkdownRenderer";
import SuggestionChips from "../components/SuggestionChips";

interface CoachMessage {
  sender: "user" | "coach";
  text: string;
}

const CoachPage: React.FC = () => {
  const { currentUser } = useContext(AuthContext);

  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      sender: "coach",
      text: `Hi! I'm your **SkillSwap AI Coach**. How can I help you maximize your learning today?`,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (!currentUser) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || isLoading) return;

    const userMessage: CoachMessage = {
      sender: "user",
      text: newMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    setShowSuggestions(false); // Hide suggestions after first interaction

    try {
      const coachResponseText = await getCoachResponse(
        currentUser.id,
        newMessage,
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

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-surface">
      {/* Premium Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <SparklesIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              SkillSwap AI Coach
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              Your personalized learning strategist
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-500 font-semibold">
              Active
            </span>
          </div>
          <div className="px-3 py-1.5 bg-gradient-to-r from-sky-500/10 to-purple-500/10 border border-sky-500/30 rounded-full">
            <span className="text-xs bg-gradient-to-r from-sky-500 to-purple-500 bg-clip-text text-transparent font-semibold">
              Powered by AI
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "coach" && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-500/20">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
            )}
            <div
              className={`max-w-xl px-5 py-4 rounded-3xl shadow-sm ${
                msg.sender === "user"
                  ? "bg-sky-500 text-white rounded-br-md"
                  : "bg-surface-highlight border border-border text-text-primary rounded-bl-md shadow-lg"
              }`}
            >
              {msg.sender === "coach" ? (
                <MarkdownRenderer text={msg.text} />
              ) : (
                <p className="text-sm leading-relaxed">{msg.text}</p>
              )}
            </div>
            {msg.sender === "user" && (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border-2 border-border"
              />
            )}
          </motion.div>
        ))}

        {/* Suggestion Chips - Show after first message */}
        {showSuggestions && messages.length === 1 && (
          <SuggestionChips onSelect={handleSuggestionClick} />
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-3 justify-start"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-500/20">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="max-w-xl px-5 py-4 rounded-3xl bg-surface-highlight border border-border shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse"></div>
                <div
                  className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Premium Input */}
      <div className="p-6 border-t border-border bg-surface/50 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask for a learning roadmap, skill strategy, or motivation tips..."
            className="flex-1 px-6 py-3.5 bg-background text-text-primary placeholder-text-muted rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-lg focus:shadow-sky-500/20 transition-all duration-200 border border-border"
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-2xl hover:from-sky-700 hover:to-sky-800 disabled:from-sky-800 disabled:to-sky-900 disabled:cursor-not-allowed shadow-lg shadow-sky-500/30 transition-all"
            disabled={!newMessage.trim() || isLoading}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default CoachPage;
