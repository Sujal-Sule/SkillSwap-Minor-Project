import React, { useRef, useState } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import GlassyButton from "../components/GlassyButton";
import Logo from "../components/Logo";
import PressureText from "../components/PressureText";
import AnimatedText from "../components/AnimatedText";
import { categories } from "../data/categories";
import { skills } from "../data/mockData";
import SkillTag from "../components/SkillTag";
import {
  AcademicCapIcon,
  SparklesIcon,
  TokenIcon,
  UsersIcon,
} from "../components/icons";
import type { Rating, User, Skill } from "../types";
import DraggableTestimonials from "../components/DraggableTestimonials";
import Footer from "../components/Footer";

interface LandingPageProps {
  onGetStarted: () => void;
}

// Mock Data for Landing Page — rewritten with concrete outcomes
const landingPageTestimonials: (Rating & { rater: User; outcome?: string })[] =
  [
    {
      id: "lp-r1",
      sessionId: "s-lp1",
      raterId: "u-lp1",
      ratedId: "platform",
      stars: 5,
      feedback:
        "Taught a weekend workshop on React and used the tokens to finally learn guitar. Best trade I've ever made — saved me hundreds on music lessons.",
      outcome: "Learned Guitar in 4 Weeks",
      rater: {
        id: "u-lp1",
        name: "Krishna Sule",
        avatarUrl: "/person 1.png",
      } as User,
    },
    {
      id: "lp-r2",
      sessionId: "s-lp2",
      raterId: "u-lp2",
      ratedId: "platform",
      stars: 5,
      feedback:
        "As a designer, I connected with a developer to build my portfolio. The 1-on-1 sessions were worth more than any $500 Udemy course.",
      outcome: "Saved $500 on Courses",
      rater: {
        id: "u-lp2",
        name: "Virat Sharma",
        avatarUrl: "/person 2.png",
      } as User,
    },
    {
      id: "lp-r3",
      sessionId: "s-lp3",
      raterId: "u-lp3",
      ratedId: "platform",
      stars: 4,
      feedback:
        "The AI Coach planned my Python learning path perfectly. Finished in 2 weeks instead of 2 months. Seriously a game-changer.",
      outcome: "Learned Python in 2 Weeks",
      rater: {
        id: "u-lp3",
        name: "Rajnandani Kushwah",
        avatarUrl: "female 2.png",
      } as User,
    },
    {
      id: "lp-r4",
      sessionId: "s-lp4",
      raterId: "u-lp4",
      ratedId: "platform",
      stars: 5,
      feedback:
        "Went from zero to deploying my first project. The live sessions made all the difference — real feedback from real people, not just YouTube comments.",
      outcome: "Deployed First Project",
      rater: {
        id: "u-lp4",
        name: "Priya Patel",
        avatarUrl: "female 1.png",
      } as User,
    },
  ];

// Animation Variants
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Section Components
const HeroSection: React.FC<
  LandingPageProps & { scrollToSection: (id: string) => void }
> = ({ onGetStarted, scrollToSection }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerRef.current.style.setProperty(
        "--mouse-x",
        `${e.clientX - rect.left}px`,
      );
      containerRef.current.style.setProperty(
        "--mouse-y",
        `${e.clientY - rect.top}px`,
      );
    }
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="spotlight-bg relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Small Pre-Header (Top Line) */}
      <motion.div variants={itemVariants} className="mb-6">
        <span className="py-2 px-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-slate-700">
          Built by learners. For learners.
        </span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        variants={itemVariants}
        className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl leading-tight"
      >
        We Couldn’t Afford to Learn. <br className="hidden md:block" />
        So We Built a Way to <span className="gradient-text">
          Swap Skills
        </span>{" "}
        Instead.
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        variants={itemVariants}
        className="mt-8 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed"
      >
        SkillSwap was created for students, creators, and curious minds who have
        something to teach but can't keep paying for expensive courses.
        <br className="hidden md:block" />
        <span className="block mt-4 font-medium text-slate-800 dark:text-slate-100">
          Teach what you know. Earn skill tokens. Learn what you don't. No money
          required.
        </span>
      </motion.p>

      {/* Buttons */}
      <motion.div
        variants={itemVariants}
        className="mt-12 flex flex-col sm:flex-row items-center gap-6"
      >
        <GlassyButton
          text="Start Swapping Skills — Free"
          onClick={onGetStarted}
          className="w-full sm:w-auto min-w-[200px]"
        />
        <button
          onClick={() => scrollToSection("how-it-works")}
          className="px-8 py-4 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-all hover:border-sky-500 hover:text-sky-500 dark:hover:border-sky-400 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          See How It Works
        </button>
      </motion.div>

      {/* Trust Line */}
      <motion.p
        variants={itemVariants}
        className="mt-8 text-sm text-slate-500 dark:text-slate-400 font-medium"
      >
        No credit card • Real people • 1 hour taught = 1 hour learned
      </motion.p>
    </motion.div>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      icon: AcademicCapIcon,
      title: "Teach & Share",
      description:
        "Share your expertise in live 1-on-1 sessions. Help others grow while reinforcing your own mastery.",
    },
    {
      icon: TokenIcon,
      title: "Earn Skill Tokens",
      description:
        "Every session you teach earns you Skill Tokens — your currency in this knowledge economy.",
    },
    {
      icon: SparklesIcon,
      title: "Learn & Grow",
      description:
        "Spend your tokens to learn anything on the platform. Guitar, Python, cooking — you name it.",
    },
  ];
  return (
    <motion.section
      id="how-it-works"
      className="py-24 px-4 -mt-32 pt-52 relative z-10 landing-section-alt"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container mx-auto text-center">
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white"
        >
          How It Works
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 italic"
        >
          Teach once. Learn forever.
        </motion.p>
        <div className="mt-16 grid md:grid-cols-3 gap-8 md:gap-4 relative">
          {/* Dashed lines for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-12">
            <svg width="100%" height="100%" className="overflow-visible">
              <line
                x1="20%"
                y1="0"
                x2="80%"
                y2="0"
                strokeWidth="1"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative flex flex-col items-center"
            >
              <div className="relative z-10 flex items-center justify-center w-28 h-28 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-xl shadow-sky-500/5">
                <step.icon className="w-14 h-14 text-sky-500 dark:text-sky-400" />
              </div>
              <h3 className="mt-8 text-2xl font-extrabold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Token Example Callout */}
        <motion.div
          variants={itemVariants}
          className="mt-14 mx-auto max-w-md p-5 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30"
        >
          <p className="text-lg font-semibold text-sky-700 dark:text-sky-300">
            💡 1 hour teaching = 1 token = 1 hour learning
          </p>
          <p className="mt-1 text-sm text-sky-600/80 dark:text-sky-400/80">
            Your skills finally pay rent.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: UsersIcon,
      title: "Peer-to-Peer Sessions",
      description:
        "Engage in live video sessions. Get personalized guidance and real-time feedback from real people.",
      benefit: "No more watching pre-recorded videos alone.",
      color: "sky",
    },
    {
      icon: SparklesIcon,
      title: "AI Learning Coach",
      description:
        "Get personalized learning plans and stay on track with an intelligent AI coach that knows your goals.",
      benefit: "Stop wasting time on the wrong tutorials.",
      color: "purple",
    },
    {
      icon: TokenIcon,
      title: "Token Economy",
      description:
        "A fair, transparent system where your skills and time are valued. Teach to earn, spend to learn.",
      benefit: "Never pay $500 for a course you could trade a skill for.",
      color: "amber",
    },
  ];
  return (
    <motion.section
      id="features"
      className="py-32 px-4 bg-slate-50 dark:bg-slate-950 relative z-20"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container mx-auto text-center">
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white"
        >
          Everything You Need to Succeed
        </motion.h2>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-left group hover:border-sky-300 dark:hover:border-sky-500/50 transition-colors duration-300"
            >
              <div
                className={`inline-block p-3 bg-${feature.color}-100 dark:bg-${feature.color}-500/20 rounded-lg`}
              >
                <feature.icon
                  className={`w-8 h-8 text-${feature.color}-500 dark:text-${feature.color}-400`}
                />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
              <p className="mt-3 text-sm font-semibold text-sky-600 dark:text-sky-400 italic">
                → {feature.benefit}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

const CategoriesSection = () => {
  const displayCategories = categories.filter((c) => c.id !== "c5"); // Exclude "User-Defined" for landing page
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredSkills = activeCategory
    ? skills.filter((s) => s.categoryId === activeCategory)
    : skills;

  return (
    <motion.section
      id="skills"
      className="py-24 px-4 bg-white dark:bg-slate-900 relative overflow-hidden z-20"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container mx-auto text-center">
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white"
        >
          Explore a World of Skills
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400"
        >
          From cutting-edge technology to timeless creative arts — find your
          passion, curated by category.
        </motion.p>

        {/* Category Tabs */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
              activeCategory === null
                ? "bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/25"
                : "bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500"
            }`}
          >
            All Skills
          </button>
          {displayCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border flex items-center gap-2 ${
                activeCategory === cat.id
                  ? "bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/25"
                  : "bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Skills Marquee */}
        <div className="mt-16 relative w-full overflow-hidden mask-gradient-x">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-scroll">
            {/* First set of skills */}
            <div className="flex gap-4 px-4">
              {filteredSkills.map((skill) => (
                <SkillTag
                  key={`s1-${skill.id}`}
                  skill={skill}
                  className="text-base px-6 py-3 whitespace-nowrap"
                />
              ))}
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="flex gap-4 px-4">
              {filteredSkills.map((skill) => (
                <SkillTag
                  key={`s2-${skill.id}`}
                  skill={skill}
                  className="text-base px-6 py-3 whitespace-nowrap"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const TestimonialsSection = () => {
  return (
    <motion.section
      className="py-32 px-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 relative z-20"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto">
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white text-center"
        >
          Real Results from Real Swappers
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="mt-4 max-w-xl mx-auto text-lg text-slate-600 dark:text-slate-400 text-center"
        >
          Don't just take our word for it — see what our community has achieved.
        </motion.p>
        <motion.div variants={itemVariants} className="mt-12">
          <DraggableTestimonials testimonials={landingPageTestimonials} />
        </motion.div>
      </div>
    </motion.section>
  );
};

const UrgencyBanner: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <motion.section
      className="py-12 px-4"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      <motion.div
        variants={itemVariants}
        className="container mx-auto max-w-3xl text-center py-8 px-6 rounded-2xl urgency-glow-border bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-sky-500/10 dark:from-sky-500/5 dark:via-purple-500/5 dark:to-sky-500/5 border border-sky-300/50 dark:border-sky-500/30"
      >
        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          🚀 Early access users earn{" "}
          <span className="text-sky-500">5 bonus tokens</span>
        </p>
        <p className="mt-2 text-slate-600 dark:text-slate-400 text-lg">
          Limited spots remaining — start for free today.
        </p>
        <div className="mt-6">
          <GlassyButton text="Claim Your Bonus" onClick={onGetStarted} />
        </div>
      </motion.div>
    </motion.section>
  );
};

const CTASection: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <motion.section
      className="py-24 px-4 text-center landing-section-alt"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      <motion.h2
        variants={itemVariants}
        className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white"
      >
        Your Skills Are Worth More Than You Think
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="mt-4 max-w-xl mx-auto text-lg text-slate-600 dark:text-slate-400"
      >
        Join a community where what you know pays for what you want to learn.
      </motion.p>
      <motion.div variants={itemVariants} className="mt-10">
        <GlassyButton text="Get Your First Skill Free" onClick={onGetStarted} />
      </motion.div>
    </motion.section>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <HeroSection
        onGetStarted={onGetStarted}
        scrollToSection={scrollToSection}
      />
      <HowItWorksSection />
      <UrgencyBanner onGetStarted={onGetStarted} />
      <FeaturesSection />
      <CategoriesSection />
      <TestimonialsSection />
      <CTASection onGetStarted={onGetStarted} />
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

export default LandingPage;
