import React from 'react';
import { XMarkIcon } from './icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 relative animate-fade-in-up border border-slate-200 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center">
                        <XMarkIcon className="w-5 h-5" />
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="pt-5">
                    {children}
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Modal;