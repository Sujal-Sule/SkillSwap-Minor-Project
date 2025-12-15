import React, { useState, useEffect } from 'react';
import type { User, Rating } from '../types';
import Modal from './Modal';
import SkillTag from './SkillTag';
import { api } from '../services/api';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    users: User[]; // Needed to lookup rater details
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, users }) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            if (user && isOpen) {
                setLoadingReviews(true);
                try {
                    const ratingsData = await api.get(`/users/${user.id}/ratings`);
                    // Enrich ratings with rater info
                    const enrichedReviews = ratingsData.map((r: Rating) => {
                        const rater = users.find(u => u.id === r.raterId) || {
                            name: 'Unknown User',
                            avatarUrl: 'https://ui-avatars.com/api/?name=Unknown',
                            id: r.raterId
                        };
                        return { ...r, rater };
                    });
                    setReviews(enrichedReviews);
                } catch (error) {
                    console.error("Failed to fetch user reviews", error);
                    setReviews([]);
                } finally {
                    setLoadingReviews(false);
                }
            }
        };

        fetchReviews();
    }, [user, isOpen, users]);

    if (!user) return null;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length).toFixed(1)
        : 'New';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Profile Details">
            <div className="space-y-6">
                {/* Header Profile Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-24 h-24 rounded-full border-4 border-sky-500 object-cover"
                    />
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                        <div className="mt-1 flex items-center justify-center sm:justify-start space-x-2 text-slate-500 dark:text-slate-400">
                            <span className="text-amber-500 font-bold">★ {averageRating}</span>
                            <span>({reviews.length} reviews)</span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <span className={`text-sm ${user.isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {user.isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            {user.bio}
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

                {/* Skills Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Teaches</h4>
                        <div className="flex flex-wrap">
                            {user.teaches.map(skill => (
                                <SkillTag key={skill.id} skill={skill} variant="teach" />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Learns</h4>
                        <div className="flex flex-wrap">
                            {user.learns.map(skill => (
                                <SkillTag key={skill.id} skill={skill} variant="learn" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

                {/* Reviews Section */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Reviews</h4>
                    {loadingReviews ? (
                        <div className="text-center py-4 text-slate-500">Loading reviews...</div>
                    ) : reviews.length > 0 ? (
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {reviews.map((review: any) => (
                                <div key={review.id || Math.random()} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center mb-2">
                                        <img src={review.rater.avatarUrl} alt={review.rater.name} className="w-8 h-8 rounded-full mr-3" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{review.rater.name}</p>
                                            <div className="flex text-amber-500 text-xs">
                                                {'★'.repeat(review.stars)}
                                                <span className="text-slate-300">{'★'.repeat(5 - review.stars)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="italic text-slate-600 dark:text-slate-400 text-sm pl-11">
                                        "{review.feedback}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 italic text-sm">No reviews yet.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default UserProfileModal;