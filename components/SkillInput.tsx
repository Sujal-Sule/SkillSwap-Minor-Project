import React, { useState, useMemo } from 'react';
import type { Skill } from '../types';
import { XMarkIcon } from './icons';
import { validateAndSuggestSkill } from '../services/geminiService';

interface SkillInputProps {
    label: string;
    selectedSkills: Skill[];
    availableSkills: Skill[];
    onAddSkill: (skill: Skill) => void;
    onRemoveSkill: (skillId: string) => void;
    onSkillCreated: (newSkill: Skill) => void;
}

const SkillInput: React.FC<SkillInputProps> = ({ label, selectedSkills, availableSkills, onAddSkill, onRemoveSkill, onSkillCreated }) => {
    const [inputValue, setInputValue] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredSkills = useMemo(() => {
        if (!inputValue) return [];
        return availableSkills.filter(skill =>
            skill.name.toLowerCase().includes(inputValue.toLowerCase())
        ).slice(0, 5);
    }, [inputValue, availableSkills]);

    const handleAdd = (skill: Skill) => {
        onAddSkill(skill);
        setInputValue('');
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
                    id: `s_${result.suggestedName.toLowerCase().replace(/\s+/g, '-')}`,
                    name: result.suggestedName,
                    categoryId: result.categoryId || 'c5', // Use AI category or default
                };
                onSkillCreated(newSkill);
                onAddSkill(newSkill);
                setInputValue('');
            } else {
                setError(result.reason || "This doesn't seem to be a valid skill.");
            }
        } catch (err) {
            setError("Could not validate the skill. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const showCreateButton = inputValue.trim().length > 2 && filteredSkills.length === 0 && !availableSkills.some(s => s.name.toLowerCase() === inputValue.trim().toLowerCase());

    return (
        <div>
            <label className="block text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">{label}</label>
            <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg min-h-[4rem] border border-slate-200 dark:border-slate-700">
                {selectedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedSkills.map(skill => (
                            <div key={skill.id} className="flex items-center group bg-slate-200 dark:bg-slate-600 rounded-full">
                                <span className="text-sm font-medium pl-3 pr-2 py-1 text-slate-700 dark:text-slate-200">
                                    {skill.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onRemoveSkill(skill.id)}
                                    className="p-1 rounded-full hover:bg-rose-300 dark:hover:bg-rose-700 transition-colors"
                                >
                                    <XMarkIcon className="w-3 h-3 text-rose-700 dark:text-rose-200" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 italic">No skills selected.</p>
                )}
            </div>
            <div className="relative mt-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setError(null);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                    placeholder="Type to add a skill..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
                {isDropdownOpen && (filteredSkills.length > 0 || showCreateButton) && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredSkills.map(skill => (
                            <li key={skill.id}>
                                <button
                                    type="button"
                                    onClick={() => handleAdd(skill)}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-100 dark:hover:bg-sky-900"
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
                                    className="w-full text-left px-4 py-2 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900 flex items-center"
                                    disabled={isCreating}
                                >
                                    {isCreating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Validating...
                                        </>
                                    ) : (
                                        `+ Create and add "${inputValue.trim()}"`
                                    )}
                                </button>
                            </li>
                        )}
                    </ul>
                )}
                {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}
            </div>
        </div>
    );
};

export default SkillInput;