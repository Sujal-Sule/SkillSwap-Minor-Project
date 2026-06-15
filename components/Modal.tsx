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
        className="bg-[#d5dbe3] dark:bg-[#121a2e] rounded-[32px] w-full max-w-lg mx-4 p-8 relative animate-fade-in-up border border-white/25 dark:border-white/5 shadow-[8px_8px_20px_rgba(165,177,198,0.25),_-8px_-8px_20px_rgba(255,255,255,0.75)] dark:shadow-[8px_8px_20px_rgba(0,0,0,0.45),_-8px_-8px_20px_rgba(255,255,255,0.02)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-300/30 dark:border-slate-800/20">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary bg-[#d5dbe3] dark:bg-[#121a2e] shadow-[3px_3px_8px_rgba(163,177,198,0.35),_-3px_-3px_8px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),_-3px_-3px_8px_rgba(255,255,255,0.02)] hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.5),_inset_-2px_-2px_5px_#ffffff] dark:hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),_inset_-2px_-2px_5px_rgba(255,255,255,0.02)] border border-slate-200/10 dark:border-slate-800/10 rounded-full p-2 ml-auto inline-flex items-center transition-all duration-300 hover:scale-105 active:scale-95"
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
