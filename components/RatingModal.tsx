import React, { useState } from 'react';
import type { Session, User } from '../types';
import Modal from './Modal';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session;
    targetUser: User;
    onSubmit: (sessionId: string, stars: number, feedback: string) => void;
    title?: string;
    placeholder?: string;
}

const StarIcon: React.FC<{ filled: boolean, onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void }> = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
    <button type="button" onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <svg className={`w-8 h-8 cursor-pointer transition-colors ${filled ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    </button>
);

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, session, targetUser, onSubmit, title, placeholder }) => {
    const [stars, setStars] = useState(0);
    const [hoverStars, setHoverStars] = useState(0);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (stars > 0) {
            onSubmit(session.id, stars, feedback);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title || `Rate your session with ${targetUser.name}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Overall Rating</label>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(starValue => (
                            <StarIcon
                                key={starValue}
                                filled={(hoverStars || stars) >= starValue}
                                onClick={() => setStars(starValue)}
                                onMouseEnter={() => setHoverStars(starValue)}
                                onMouseLeave={() => setHoverStars(0)}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Share your feedback (optional)
                    </label>
                    <textarea
                        id="feedback"
                        name="feedback"
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        placeholder={placeholder || `How was your experience learning ${session.skill.name} from ${targetUser.name}?`}
                    />
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
                        disabled={stars === 0}
                        className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:bg-sky-800 disabled:cursor-not-allowed transition-colors"
                    >
                        Submit Review
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default RatingModal;