import React from 'react';
import type { User } from '../types';
import { PlusIcon } from './icons';

interface UserSuggestionCardProps {
    user: User;
    onConnect: (userId: string) => void;
}

const UserSuggestionCard: React.FC<UserSuggestionCardProps> = ({ user, onConnect }) => {
    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center flex flex-col items-center">
            <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full mb-4 border-2 border-slate-300 dark:border-slate-600" />
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex-1">{user.name}</p>
            <button 
                onClick={() => onConnect(user.id)}
                className="w-full flex items-center justify-center mt-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-lg hover:bg-sky-600 hover:text-white dark:hover:text-white transition-colors text-sm"
            >
                <PlusIcon className="w-4 h-4 mr-1.5" />
                Connect
            </button>
        </div>
    );
};

export default UserSuggestionCard;