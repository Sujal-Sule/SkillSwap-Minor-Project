import React, { useState } from 'react';
import type { User, Skill } from '../types';
import Modal from './Modal';

interface ScheduleSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    targetUser: User;
    onSubmit: (teacher: User, skill: Skill, time: Date, duration: number) => void;
}

const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({ isOpen, onClose, currentUser, targetUser, onSubmit }) => {
    const [selectedSkillId, setSelectedSkillId] = useState<string>(targetUser.teaches[0]?.id || '');
    const [dateTime, setDateTime] = useState('');
    const [duration, setDuration] = useState<number>(60);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedSkill = targetUser.teaches.find(s => s.id === selectedSkillId);
        if (selectedSkill && dateTime) {
            onSubmit(targetUser, selectedSkill, new Date(dateTime), duration);
        }
    };

    const hasTokens = currentUser.tokens > 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Schedule a session with ${targetUser.name}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {!hasTokens && (
                    <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4" role="alert">
                        <p className="font-bold">Not Enough Tokens</p>
                        <p>You need at least 1 token to schedule a session. Earn more by teaching other users!</p>
                    </div>
                )}
                <div>
                    <label htmlFor="skill" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Which skill do you want to learn?
                    </label>
                    <select
                        id="skill"
                        name="skill"
                        value={selectedSkillId}
                        onChange={(e) => setSelectedSkillId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                        disabled={!hasTokens}
                    >
                        {targetUser.teaches.map(skill => (
                            <option key={skill.id} value={skill.id}>
                                {skill.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Duration
                    </label>
                    <select
                        id="duration"
                        name="duration"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                        disabled={!hasTokens}
                    >
                        {[15, 30, 45, 60, 90, 120].map(mins => (
                            <option key={mins} value={mins}>
                                {mins} minutes
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="datetime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Proposed date and time
                    </label>
                    <input
                        type="datetime-local"
                        id="datetime"
                        name="datetime"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        min={new Date().toISOString().slice(0, 16)}
                        disabled={!hasTokens}
                    />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p>A session costs <span className="font-bold text-amber-500 dark:text-amber-400">1 token</span>, which will be deducted once {targetUser.name.split(' ')[0]} accepts.</p>
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!selectedSkillId || !dateTime || !hasTokens}
                        className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:bg-sky-800 disabled:cursor-not-allowed transition-colors"
                    >
                        Propose Session
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ScheduleSessionModal;