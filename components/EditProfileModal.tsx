import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { User, Skill } from '../types';
import Modal from './Modal';
import SkillInput from './SkillInput';
import { ArrowUpTrayIcon } from './icons';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedUser: User) => void;
    allSkills: Skill[];
    addNewSkill: (newSkill: Skill) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave, allSkills, addNewSkill }) => {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
    const [teaches, setTeaches] = useState<Skill[]>(user.teaches);
    const [learns, setLearns] = useState<Skill[]>(user.learns);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(user.name);
            setBio(user.bio);
            setAvatarUrl(user.avatarUrl);
            setTeaches([...user.teaches]);
            setLearns([...user.learns]);
        }
    }, [user, isOpen]);

    const handleSave = () => {
        const updatedUser: User = {
            ...user,
            name,
            bio,
            avatarUrl,
            teaches,
            learns,
        };
        onSave(updatedUser);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Compress to JPEG with 0.7 quality
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setAvatarUrl(compressedDataUrl);
            };
            if (typeof event.target?.result === 'string') {
                img.src = event.target.result;
            }
        };
        reader.readAsDataURL(file);
    };


    const availableSkills = useMemo(() => {
        const teachesIds = new Set(teaches.map(s => s.id));
        const learnsIds = new Set(learns.map(s => s.id));
        return allSkills.filter(s => !teachesIds.has(s.id) && !learnsIds.has(s.id));
    }, [teaches, learns, allSkills]);

    const handleAddSkill = (skill: Skill, list: 'teaches' | 'learns') => {
        if (list === 'teaches') {
            setTeaches(prev => [...prev, skill]);
        } else {
            setLearns(prev => [...prev, skill]);
        }
    };

    const handleRemoveSkill = (skillId: string, list: 'teaches' | 'learns') => {
        if (list === 'teaches') {
            setTeaches(prev => prev.filter(s => s.id !== skillId));
        } else {
            setLearns(prev => prev.filter(s => s.id !== skillId));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-3">
                <div className="flex items-center space-x-4">
                    <img src={avatarUrl} alt="Current Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600" />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Profile Picture</label>
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="mt-1 inline-flex items-center px-3 py-1.5 text-sm font-medium text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 rounded-md hover:bg-sky-200 dark:hover:bg-sky-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-sky-500"
                        >
                            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                            Upload Image
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                    <textarea
                        id="bio"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>

                <div className="space-y-6">
                    <SkillInput
                        label="Skills I Teach"
                        selectedSkills={teaches}
                        availableSkills={availableSkills}
                        onAddSkill={(skill) => handleAddSkill(skill, 'teaches')}
                        onRemoveSkill={(skillId) => handleRemoveSkill(skillId, 'teaches')}
                        onSkillCreated={addNewSkill}
                    />
                    <SkillInput
                        label="Skills I Want to Learn"
                        selectedSkills={learns}
                        availableSkills={availableSkills}
                        onAddSkill={(skill) => handleAddSkill(skill, 'learns')}
                        onRemoveSkill={(skillId) => handleRemoveSkill(skillId, 'learns')}
                        onSkillCreated={addNewSkill}
                    />
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors">
                    Save Changes
                </button>
            </div>
        </Modal>
    );
};

export default EditProfileModal;