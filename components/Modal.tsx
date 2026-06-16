import React from "react";
import { XMarkIcon } from "./icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-50 flex justify-center items-center backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-[#d5dbe3] dark:bg-[#121a2e] rounded-[32px] w-full max-w-lg mx-4 p-8 relative animate-fade-in-up border border-white/25 dark:border-white/5 shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-300/30 dark:border-slate-800/20">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/10 dark:border-slate-800/10 rounded-full p-2 ml-auto inline-flex items-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
          >
            <XMarkIcon className="w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className="pt-5">{children}</div>
      </div>
      <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(16px) scale(0.97);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
    </div>
  );
};

export default Modal;
