import React from 'react';
import type { User, Rating } from '../types';
import SkillTag from '../components/SkillTag';
import DraggableTestimonials from '../components/DraggableTestimonials';

interface UserProfilePageProps {
    user: User;
    goBack: () => void;
    ratings: Rating[];
    users: User[];
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, goBack, ratings, users }) => {
    if (!user) return null;

    const userRatings = ratings.filter(r => r.ratedId === user.id).map(rating => ({
        ...rating,
        rater: users.find(u => u.id === rating.raterId)
    })).filter(r => r.rater) as (Rating & { rater: User })[];

    const averageRating = userRatings.length > 0
        ? (userRatings.reduce((acc, r) => acc + r.stars, 0) / userRatings.length).toFixed(1)
        : 'No ratings yet';

    return (
        <div className="container mx-auto max-w-4xl">
            <button
                onClick={goBack}
                className="mb-6 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
                &larr; Back
            </button>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <img src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full border-4 border-sky-500" />
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                         <div className="mt-2 flex items-center justify-center md:justify-start space-x-2 text-slate-500 dark:text-slate-400">
                            <span className="text-amber-500 dark:text-amber-400 font-bold text-lg">★ {averageRating}</span>
                            <span>({userRatings.length} reviews)</span>
                        </div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-xl">{user.bio}</p>
                    </div>
                </div>
                
                <div className="mt-10 border-t pt-8 border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Skills They Teach</h3>
                            <div className="flex flex-wrap">
                                {user.teaches.map(skill => <SkillTag key={skill.id} skill={skill} variant="teach" />)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Skills They Want to Learn</h3>
                            <div className="flex flex-wrap">
                                {user.learns.map(skill => <SkillTag key={skill.id} skill={skill} variant="learn" />)}
                            </div>
                        </div>
                    </div>
                </div>

                 {userRatings.length > 0 && (
                    <div className="mt-10 border-t pt-8 border-slate-200 dark:border-slate-700">
                        <h3 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">What Others Say</h3>
                        <DraggableTestimonials testimonials={userRatings} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;