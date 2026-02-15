import React from "react";
import { motion } from "framer-motion";

const CommunityPage: React.FC = () => {
  const socialLinks = [
    {
      title: "Join our Discord",
      description:
        "Come chat with over 5,000 learners in real-time. Ask questions, find study buddies, and participate in weekly events.",
      icon: "💬",
      action: "Join Discord",
      color: "bg-[#5865F2]",
    },
    {
      title: "Contribute on GitHub",
      description:
        "SkillSwap is open core. Help us build the platform by contributing to our dashboard, matching algorithms, or documentation.",
      icon: "💻",
      action: "View Repository",
      color: "bg-[#24292e]",
    },
    {
      title: "Community Forum",
      description:
        "Dive deep into specific topics, share your learning journey, and get help from the community in our long-form forum.",
      icon: "🏛️",
      action: "Browse Forum",
      color: "bg-sky-500",
    },
  ];

  const stats = [
    { label: "Active Swappers", value: "12.5k+" },
    { label: "Skills Shared", value: "450+" },
    { label: "Global Reach", value: "128 Countries" },
    { label: "Community Events", value: "Weekly" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-6xl mx-auto px-6">
        {/* Hero */}
        <header className="mb-20 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            The Heart of <span className="text-sky-500">SkillSwap</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            SkillSwap isn't just an app—it's a global movement of proactive
            learners helping each other succeed. Join the conversation and help
            us shape the future of peer-to-peer education.
          </motion.p>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center shadow-sm"
            >
              <div className="text-3xl font-black text-sky-500 mb-2">
                {stat.value}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Links Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {socialLinks.map((link, idx) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="flex flex-col h-full p-10 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className="text-5xl mb-8">{link.icon}</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {link.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-10 flex-grow leading-relaxed">
                {link.description}
              </p>
              <button
                className={`w-full py-4 rounded-2xl text-white font-bold transition-all active:scale-95 shadow-lg ${link.color}`}
              >
                {link.action}
              </button>
            </motion.div>
          ))}
        </section>

        {/* Community Values */}
        <section className="p-12 md:p-20 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">
                Our Community Guiding Principles
              </h2>
              <ul className="space-y-6">
                {[
                  "Reciprocity over transaction",
                  "Growth mindset in every interaction",
                  "Radical inclusion and accessibility",
                  "Building for the long term together",
                ].map((val, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <span className="text-lg text-slate-300">{val}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
              <h4 className="font-bold mb-6 text-sky-400">Community Pledge</h4>
              <p className="text-slate-400 italic leading-relaxed">
                "I promise to share my knowledge freely, learn with curiosity,
                and respect the journey of every peer I encounter on SkillSwap.
                We are all teachers, and we are all students."
              </p>
              <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center font-bold text-sky-500 text-sm">
                  SS
                </div>
                <div className="text-sm font-bold">SkillSwap Founders</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CommunityPage;
