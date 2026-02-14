import React, { useState, useMemo } from "react";
import type { Skill } from "../types";
import {
  XMarkIcon,
  AcademicCapIcon,
  UserCircleIcon,
  HashtagIcon,
} from "./icons";
import { validateAndSuggestSkill } from "../services/geminiService";

interface SkillInputProps {
  label: string;
  selectedSkills: Skill[];
  availableSkills: Skill[];
  onAddSkill: (skill: Skill) => void;
  onRemoveSkill: (skillId: string) => void;
  onSkillCreated: (newSkill: Skill) => void;
}

const SkillInput: React.FC<SkillInputProps> = ({
  label,
  selectedSkills,
  availableSkills,
  onAddSkill,
  onRemoveSkill,
  onSkillCreated,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredSkills = useMemo(() => {
    if (!inputValue) return [];
    return availableSkills
      .filter((skill) =>
        skill.name.toLowerCase().includes(inputValue.toLowerCase()),
      )
      .slice(0, 5);
  }, [inputValue, availableSkills]);

  const handleAdd = (skill: Skill) => {
    onAddSkill(skill);
    setInputValue("");
    setIsDropdownOpen(false);
    setError(null);
  };

  const handleCreateSkill = async () => {
    if (isCreating || !inputValue.trim()) return;

    setIsCreating(true);
    setError(null);
    setIsDropdownOpen(false);

    try {
      const result = await validateAndSuggestSkill(inputValue);
      if (result.isValid) {
        const newSkill: Skill = {
          id: `s_${result.suggestedName.toLowerCase().replace(/\s+/g, "-")}`,
          name: result.suggestedName,
          categoryId: result.categoryId || "c5", // Use AI category or default
        };
        onSkillCreated(newSkill);
        onAddSkill(newSkill);
        setInputValue("");
      } else {
        setError(result.reason || "This doesn't seem to be a valid skill.");
      }
    } catch (err) {
      setError("Could not validate the skill. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const showCreateButton =
    inputValue.trim().length > 2 &&
    filteredSkills.length === 0 &&
    !availableSkills.some(
      (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase(),
    );

  // Determine Icon based on label context
  const SkillIcon = label.toLowerCase().includes("teach")
    ? AcademicCapIcon
    : label.toLowerCase().includes("learn")
      ? UserCircleIcon
      : HashtagIcon;

  return (
    <div>
      {/* Removed the label from here as it's now handled by the parent layout or can be re-added if needed for context, 
                but based on the new design, the parent container has the section header. 
                However, keeping a screen-reader friendly label or a visual sub-label might be good. 
                Let's keep it but style it subtly if the parent already has a big header. 
                Actually, the new EditProfileModal passes headers like "Skills Keep You Busy (Teaching)".
                So we should display it.
            */}
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide opacity-80">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
          placeholder="Add a new skill (e.g. React, UX Design)..."
          className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />

        {/* Search Icon or similar indicator could go here absolute right */}

        {/* Dropdown Logic */}
        {isDropdownOpen && (filteredSkills.length > 0 || showCreateButton) && (
          <ul className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
            {filteredSkills.map((skill) => (
              <li key={skill.id}>
                <button
                  type="button"
                  onClick={() => handleAdd(skill)}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-900/50 hover:text-sky-700 dark:hover:text-sky-400 font-medium transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                >
                  {skill.name}
                </button>
              </li>
            ))}
            {showCreateButton && (
              <li>
                <button
                  type="button"
                  onClick={handleCreateSkill}
                  className="w-full text-left px-4 py-3 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/50 flex items-center font-semibold"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Validating...
                    </>
                  ) : (
                    `+ Create "${inputValue.trim()}"`
                  )}
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-500 dark:text-rose-400 mt-2 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">
          <XMarkIcon className="w-3 h-3" /> {error}
        </p>
      )}

      {/* Selected Skills Chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {selectedSkills.length > 0 ? (
          selectedSkills.map((skill) => (
            <div
              key={skill.id}
              className="group flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg pl-3 pr-1.5 py-1.5 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500 transition-all animate-in fade-in zoom-in-95 duration-200"
            >
              <SkillIcon className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {skill.name}
              </span>
              <button
                type="button"
                onClick={() => onRemoveSkill(skill.id)}
                className="p-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/50 text-slate-400 hover:text-rose-500 transition-colors ml-1"
                title="Remove skill"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-400 italic mt-2 opacity-60 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            No skills added yet. Start typing to add some.
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillInput;
