import React from "react";
import { motion } from "framer-motion";
import {
  LightBulbIcon,
  CalendarIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
} from "./icons";

interface Suggestion {
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSelect }) => {
  const suggestions: Suggestion[] = [
    {
      text: "Help me create a 2-week learning plan",
      icon: CalendarIcon,
    },
    {
      text: "How should I prepare for my next session?",
      icon: AcademicCapIcon,
    },
    {
      text: "Suggest skills based on my profile",
      icon: LightBulbIcon,
    },
    {
      text: "How can I earn more tokens?",
      icon: CurrencyDollarIcon,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(suggestion.text)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl text-sm text-sky-400 hover:text-sky-300 transition-all duration-200"
          >
            <Icon className="w-4 h-4" />
            <span>{suggestion.text}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default SuggestionChips;
