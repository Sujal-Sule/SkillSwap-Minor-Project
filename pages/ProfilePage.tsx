import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { Skill, User, Rating, TokenTransaction } from '../types';
import SkillTag from '../components/SkillTag';
import DraggableTestimonials from '../components/DraggableTestimonials';
import { ArrowDownIcon, ArrowUpIcon, PencilIcon } from '../components/icons';

interface ProfilePageProps {
    ratings: Rating[];
    users: User[];
    tokenTransactions: TokenTransaction[];
    allSkills: Skill[];
    addNewSkill: (newSkill: Skill) => void;
    openEditModal: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ ratings, users, tokenTransactions, openEditModal }) => {
    const { currentUser } = useContext(AuthContext);

    if (!currentUser) return null;

    const myRatings = ratings.filter(r => r.ratedId === currentUser.id).map(rating => ({
        ...rating,
        rater: users.find(u => u.id === rating.raterId)
    })).filter(r => r.rater) as (Rating & { rater: User })[];

    const averageRating = myRatings.length > 0
        ? (myRatings.reduce((acc, r) => acc + r.stars, 0) / myRatings.length).toFixed(1)
        : 'No ratings yet';

    const myTransactions = tokenTransactions
        .filter(t => t.userId === currentUser.id)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <img src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + currentUser.id} alt={currentUser.name} className="w-32 h-32 rounded-full border-4 border-sky-500" />
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-4xl font-bold text-white">{currentUser.name}</h2>
                        <div className="mt-2 flex items-center justify-center md:justify-start space-x-2 text-slate-400">
                            <span className="text-amber-400 font-bold text-lg">★ {averageRating}</span>
                            <span>({myRatings.length} reviews)</span>
                        </div>
                        <p className="mt-4 text-slate-400 max-w-xl">{currentUser.bio}</p>
                    </div>
                    <button
                        onClick={openEditModal}
                        className="flex items-center px-4 py-2 bg-slate-700 text-sky-300 font-semibold rounded-lg hover:bg-slate-600 transition-colors">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit Profile
                    </button>
                </div>

                <div className="mt-10 border-t pt-8 border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-slate-100">Skills I Teach</h3>
                            <div className="flex flex-wrap">
                                {currentUser.teaches.map(skill => <SkillTag key={skill.id} skill={skill} variant="teach" />)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-slate-100">Skills I Want to Learn</h3>
                            <div className="flex flex-wrap">
                                {currentUser.learns.map(skill => <SkillTag key={skill.id} skill={skill} variant="learn" />)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t pt-8 border-slate-700">
                    <h3 className="text-2xl font-semibold mb-4 text-slate-100">Token History</h3>
                    {myTransactions.length > 0 ? (
                        <div className="flow-root max-h-96 overflow-y-auto pr-4">
                            <ul role="list" className="-mb-8">
                                {myTransactions.map((transaction, transactionIdx) => (
                                    <li key={transaction.id}>
                                        <div className="relative pb-8">
                                            {transactionIdx !== myTransactions.length - 1 ? (
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-700" aria-hidden="true" />
                                            ) : null}
                                            <div className="relative flex space-x-4 items-start">
                                                <div>
                                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-slate-800 ${transaction.type === 'earned' ? 'bg-emerald-500' : 'bg-red-500'
                                                        }`}>
                                                        {transaction.type === 'earned' ? <ArrowUpIcon className="h-5 w-5 text-white" /> : <ArrowDownIcon className="h-5 w-5 text-white" />}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-slate-200">{transaction.description}</p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            <time dateTime={transaction.timestamp.toISOString()}>
                                                                {transaction.timestamp.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                            </time>
                                                        </p>
                                                    </div>
                                                    <div className={`text-right text-sm whitespace-nowrap font-bold ${transaction.type === 'earned' ? 'text-emerald-400' : 'text-red-400'
                                                        }`}>
                                                        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                            <p className="text-slate-500">You have no token transactions yet.</p>
                        </div>
                    )}
                </div>


                {myRatings.length > 0 && (
                    <div className="mt-10 border-t pt-8 border-slate-700">
                        <h3 className="text-2xl font-semibold mb-4 text-slate-100">What Others Say</h3>
                        <DraggableTestimonials testimonials={myRatings} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
