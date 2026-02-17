import React, { useState, useEffect } from "react";
import Logo from "./Logo";

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Faster progress: reaches 100% in ~0.75s
      });
    }, 15);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background transition-colors duration-300">
      <div className="animate-pulse">
        <Logo size={160} />
      </div>

      <div className="w-64 bg-surface rounded-full h-2 mt-12 overflow-hidden border border-border">
        <div
          className="bg-sky-500 h-2 rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-4 text-text-muted tracking-widest text-sm font-mono">
        LOADING... {progress}%
      </p>
    </div>
  );
};

export default LoadingScreen;
