import React from "react";
import { motion } from "framer-motion";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: "in-progress" | "planned" | "completed";
  icon: string;
  eta?: string;
}

const roadmapItems: RoadmapItem[] = [
  {
    id: "r1",
    title: "AI Skill Matching v2",
    description:
      "Deep learning models to predict the best learning pairs based on past successful sessions and skill proximity.",
    status: "in-progress",
    icon: "🤖",
    eta: "Q2 2026",
  },
  {
    id: "r2",
    title: "Video Session Recording",
    description:
      "Securely record and replay your learning sessions for future reference, with automatic transcript generation.",
    status: "in-progress",
    icon: "📹",
    eta: "Q2 2026",
  },
  {
    id: "r3",
    title: "SkillSwap Mobile App",
    description:
      "Full mobile experience for both iOS and Android to swap skills on the go.",
    status: "planned",
    icon: "📱",
    eta: "Q3 2026",
  },
  {
    id: "r4",
    title: "Group Learning Clusters",
    description:
      "Collaborative learning rooms where multiple students can learn FROM a single teacher or learn TOGETHER.",
    status: "planned",
    icon: "👥",
  },
  {
    id: "r5",
    title: "Light & Dark Mode",
    description:
      "Full system-wide theme support for comfortable learning in any environment.",
    status: "completed",
    icon: "🌓",
  },
  {
    id: "r6",
    title: "Interactive Whiteboard",
    description:
      "Real-time collaborative drawing and diagramming tools integrated directly into video sessions.",
    status: "completed",
    icon: "🎨",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const RoadmapPage: React.FC = () => {
  const sections = [
    {
      title: "🚀 In Progress",
      status: "in-progress",
      color: "from-sky-500 to-blue-600",
    },
    {
      title: "🔜 Planned",
      status: "planned",
      color: "from-purple-500 to-indigo-600",
    },
    {
      title: "✅ Completed",
      status: "completed",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 sm:px-12 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-500 text-sm font-bold mb-6"
          >
            THE FUTURE OF SKILLSWAP
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Product Roadmap
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            We're building the world's best platform for reciprocal learning.
            Here's what we've done and where we're headed next.
          </motion.p>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {sections.map((section) => (
            <div key={section.status} className="flex flex-col gap-6">
              <h2
                className={`text-xl font-bold flex items-center gap-3 pb-2 border-b-2 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100`}
              >
                {section.title}
              </h2>
              <div className="flex flex-col gap-4">
                {roadmapItems
                  .filter((item) => item.status === section.status)
                  .map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4 mb-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                            {item.title}
                          </h3>
                          {item.eta && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full">
                              Target: {item.eta}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 p-10 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-center border border-white/10"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Have a feature suggestion?
          </h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Our roadmap is shaped by the community. We'd love to hear what
            features would make your learning journey better.
          </p>
          <button className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-sky-500 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/5">
            Submit Feedback
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default RoadmapPage;
