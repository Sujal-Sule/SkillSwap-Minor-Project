import React, { useState, useEffect, useMemo, useRef } from "react";
import type { User, Skill } from "../types";
import Modal from "./Modal";
import SkillInput from "./SkillInput";
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  UserCircleIcon,
  SparklesIcon,
} from "./icons";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: User) => void;
  allSkills: Skill[];
  addNewSkill: (newSkill: Skill) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  allSkills,
  addNewSkill,
}) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [teaches, setTeaches] = useState<Skill[]>(user.teaches);
  const [learns, setLearns] = useState<Skill[]>(user.learns);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
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
    onClose();
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
        const canvas = document.createElement("canvas");
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
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setAvatarUrl(compressedDataUrl);
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const availableSkills = useMemo(() => {
    const teachesIds = new Set(teaches.map((s) => s.id));
    const learnsIds = new Set(learns.map((s) => s.id));
    return allSkills.filter(
      (s) => !teachesIds.has(s.id) && !learnsIds.has(s.id),
    );
  }, [teaches, learns, allSkills]);

  const handleAddSkill = (skill: Skill, list: "teaches" | "learns") => {
    if (list === "teaches") {
      setTeaches((prev) => [...prev, skill]);
    } else {
      setLearns((prev) => [...prev, skill]);
    }
  };

  const handleRemoveSkill = (skillId: string, list: "teaches" | "learns") => {
    if (list === "teaches") {
      setTeaches((prev) => prev.filter((s) => s.id !== skillId));
    } else {
      setLearns((prev) => prev.filter((s) => s.id !== skillId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-8 py-6 bg-slate-50 dark:bg-slate-900/50 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Edit Profile
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              This is how others see you on SkillSwap
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 animate-pulse"
                title="Live Preview"
              />
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* LEFT COLUMN: Identity (5 cols) */}
            <div className="md:col-span-12 lg:col-span-5 space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:items-start group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  Profile Picture
                </label>
                <div className="relative">
                  <div
                    className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <img
                      src={
                        avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ArrowUpTrayIcon className="w-8 h-8 text-white mb-1" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-full shadow-lg border border-slate-700 hover:bg-sky-600 transition-colors"
                    title="Change Photo"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center sm:text-left">
                  Square image recommended. <br />
                  JPG, PNG, or GIF. Max 5MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </div>

              {/* Basic Info Inputs */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="e.g. Jane Doe"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label
                      htmlFor="bio"
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Bio
                    </label>
                    <span
                      className={`text-xs ${bio.length > 250 ? "text-amber-500" : "text-slate-400"}`}
                    >
                      {bio.length}/300
                    </span>
                  </div>
                  <textarea
                    id="bio"
                    rows={5}
                    value={bio}
                    maxLength={300}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400 resize-none leading-relaxed"
                    placeholder="Tell others what makes you unique..."
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Brief description for your profile. URLs are hyperlinked.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Skills (7 cols) */}
            <div className="md:col-span-12 lg:col-span-7 space-y-8">
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-sky-500" />
                  Skills & Expertise
                </h3>

                <div className="space-y-8">
                  <SkillInput
                    label="Skills Keep You Busy (Teaching)"
                    selectedSkills={teaches}
                    availableSkills={availableSkills}
                    onAddSkill={(skill) => handleAddSkill(skill, "teaches")}
                    onRemoveSkill={(skillId) =>
                      handleRemoveSkill(skillId, "teaches")
                    }
                    onSkillCreated={addNewSkill}
                  />

                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700/50" />

                  <SkillInput
                    label="Skills You're Developing (Learning)"
                    selectedSkills={learns}
                    availableSkills={availableSkills}
                    onAddSkill={(skill) => handleAddSkill(skill, "learns")}
                    onRemoveSkill={(skillId) =>
                      handleRemoveSkill(skillId, "learns")
                    }
                    onSkillCreated={addNewSkill}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FooterActions */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-8 py-5 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
