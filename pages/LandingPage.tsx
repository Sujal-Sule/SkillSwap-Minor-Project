import React, { useRef, useContext } from 'react';
import { motion, type Variants } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import GlassyButton from '../components/GlassyButton';
import Logo from '../components/Logo';
import PressureText from '../components/PressureText';
import AnimatedText from '../components/AnimatedText';
import { categories } from '../data/categories';
import { skills } from '../data/mockData';
import SkillTag from '../components/SkillTag';
import { AcademicCapIcon, SparklesIcon, TokenIcon, UsersIcon } from '../components/icons';
import type { Rating, User } from '../types';
import DraggableTestimonials from '../components/DraggableTestimonials';


interface LandingPageProps {
    onGetStarted: () => void;
}

// Mock Data for Landing Page
const landingPageTestimonials: (Rating & { rater: User })[] = [
    {
        id: 'lp-r1',
        sessionId: 's-lp1',
        raterId: 'u-lp1',
        ratedId: 'platform',
        stars: 5,
        feedback: "SkillSwap is revolutionary. I taught a weekend workshop on React and used the tokens to finally learn how to play guitar. The community is fantastic!",
        rater: { id: 'u-lp1', name: 'Alex Johnson', avatarUrl: 'https://picsum.photos/seed/alex/200' } as User,
    },
    {
        id: 'lp-r2',
        sessionId: 's-lp2',
        raterId: 'u-lp2',
        ratedId: 'platform',
        stars: 5,
        feedback: "As a designer, I was able to connect with a developer to bring my portfolio to life. The 1-on-1 sessions are incredibly valuable. Highly recommend.",
        rater: { id: 'u-lp2', name: 'Maria Garcia', avatarUrl: 'https://picsum.photos/seed/maria/200' } as User,
    },
    {
        id: 'lp-r3',
        sessionId: 's-lp3',
        raterId: 'u-lp3',
        ratedId: 'platform',
        stars: 4,
        feedback: "The AI Coach feature is a game-changer for keeping me on track with my learning goals. It helped me structure my Python learning plan perfectly.",
        rater: { id: 'u-lp3', name: 'Sam Chen', avatarUrl: 'https://picsum.photos/seed/sam/200' } as User,
    },
     {
        id: 'lp-r4',
        sessionId: 's-lp4',
        raterId: 'u-lp4',
        ratedId: 'platform',
        stars: 5,
        feedback: "I love that my knowledge has tangible value here. Earning tokens feels rewarding, and spending them on new skills is even better. The platform is super intuitive.",
        rater: { id: 'u-lp4', name: 'Priya Patel', avatarUrl: 'https://picsum.photos/seed/priya/200' } as User,
    }
];


// Animation Variants
// FIX: Added 'Variants' type to fix 'ease' property type error.
const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
            staggerChildren: 0.2
        },
    },
};

// FIX: Added 'Variants' type to fix 'ease' property type error.
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};


// Section Components
const HeroSection: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            containerRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            containerRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }
    };

    return (
        <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="spotlight-bg relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="mb-8">
                <Logo size={128} />
            </motion.div>
            <motion.h1 
                variants={itemVariants} 
                className="text-5xl md:text-7xl font-extrabold tracking-tight gradient-text variable-font"
            >
                <PressureText text="The New Economy of Knowledge" />
            </motion.h1>
            <AnimatedText
                text="Trade your skills, not your time. SkillSwap is a peer-to-peer platform where you earn by teaching and spend by learning."
                className="mt-6 max-w-2xl text-lg text-slate-400"
                delay={0.5}
            />
            <motion.div variants={itemVariants} className="mt-10">
                <GlassyButton text="Explore the Platform" onClick={onGetStarted} />
            </motion.div>
        </motion.div>
    );
};

const HowItWorksSection = () => {
    const steps = [
        { icon: AcademicCapIcon, title: 'Teach & Share', description: 'Share your expertise in live 1-on-1 sessions. Help others grow and solidify your own knowledge.' },
        { icon: TokenIcon, title: 'Earn Skill Tokens', description: 'For every session you teach, you earn Skill Tokens—the official currency of our knowledge economy.' },
        { icon: SparklesIcon, title: 'Learn & Grow', description: 'Spend your tokens to learn any skill available on the platform from other talented members.' },
    ];
    return (
        <motion.section
            className="py-20 px-4"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="container mx-auto text-center">
                <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">How It Works</motion.h2>
                <motion.p variants={itemVariants} className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                    A simple, powerful loop for lifelong learning and growth.
                </motion.p>
                <div className="mt-16 grid md:grid-cols-3 gap-8 md:gap-4 relative">
                    {/* Dashed lines for desktop */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-12">
                        <svg width="100%" height="100%" className="overflow-visible">
                            <line x1="20%" y1="0" x2="80%" y2="0" strokeWidth="2" className="stroke-slate-300 dark:stroke-slate-700" strokeDasharray="8 8" />
                        </svg>
                    </div>

                    {steps.map((step, index) => (
                        <motion.div key={index} variants={itemVariants} className="relative flex flex-col items-center">
                            <div className="relative z-10 flex items-center justify-center w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700">
                                <step.icon className="w-12 h-12 text-sky-500 dark:text-sky-400" />
                            </div>
                            <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    )
}

const FeaturesSection = () => {
     const features = [
        { icon: UsersIcon, title: 'Peer-to-Peer Sessions', description: 'Engage in live video sessions. Get personalized guidance and real-time feedback.', color: 'sky' },
        { icon: SparklesIcon, title: 'AI Learning Coach', description: 'Get personalized learning plans and motivation from our intelligent AI coach.', color: 'purple' },
        { icon: TokenIcon, title: 'Token Economy', description: 'A fair and transparent system where your skills and time are valued and tradable.', color: 'amber' },
    ];
    return (
        <motion.section 
            className="py-20 px-4 bg-slate-100/50 dark:bg-slate-800/50"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="container mx-auto text-center">
                 <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Everything You Need to Succeed</motion.h2>
                <div className="mt-16 grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div key={index} variants={itemVariants} className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-left">
                           <div className={`inline-block p-3 bg-${feature.color}-100 dark:bg-${feature.color}-500/20 rounded-lg`}>
                                <feature.icon className={`w-8 h-8 text-${feature.color}-500 dark:text-${feature.color}-400`} />
                           </div>
                            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    )
}

const ScrollingSkills: React.FC<{ skills: typeof skills, direction?: 'left' | 'right' }> = ({ skills, direction = 'left' }) => {
    const duplicatedSkills = [...skills, ...skills, ...skills]; // Duplicate for seamless looping
    return (
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <motion.div 
                className="flex gap-4"
                initial={{ x: direction === 'left' ? '0%' : '-100%' }}
                animate={{ x: direction === 'left' ? '-100%' : '0%' }}
                transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
            >
                {duplicatedSkills.map((skill, i) => (
                    <SkillTag key={`${skill.id}-${i}`} skill={skill} className="text-lg whitespace-nowrap" />
                ))}
            </motion.div>
        </div>
    )
};

const CategoriesSection = () => {
    return (
        <motion.section 
            className="py-20 px-4"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="container mx-auto text-center">
                 <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Explore a World of Skills</motion.h2>
                <motion.p variants={itemVariants} className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                    From cutting-edge technology to timeless creative arts, find your passion.
                </motion.p>
                <div className="mt-16 space-y-4">
                   <ScrollingSkills skills={skills.slice(0, 6)} direction="left" />
                   <ScrollingSkills skills={skills.slice(6)} direction="right" />
                </div>
            </div>
        </motion.section>
    );
};

const TestimonialsSection = () => {
    return (
        <motion.section
            className="py-20 px-4 bg-slate-100/50 dark:bg-slate-800/50"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            <div className="container mx-auto">
                <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white text-center">Loved by Learners & Mentors</motion.h2>
                <motion.div variants={itemVariants} className="mt-12">
                     <DraggableTestimonials testimonials={landingPageTestimonials} />
                </motion.div>
            </div>
        </motion.section>
    );
}

const CTASection: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
        <motion.section 
            className="py-24 px-4 text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
        >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Ready to Join the Swap?</motion.h2>
            <motion.p variants={itemVariants} className="mt-4 max-w-xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                Your next skill is just a session away. Start your journey in the new knowledge economy today.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-10">
                <GlassyButton text="Get Started for Free" onClick={onGetStarted} />
            </motion.div>
        </motion.section>
    )
}

const Footer = () => (
    <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto text-center text-slate-500 dark:text-slate-400">
            <Logo size={60} className="mx-auto mb-4" />
            <p>&copy; {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
        </div>
    </footer>
);

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
       <div className="w-full h-full overflow-y-auto">
           <HeroSection onGetStarted={onGetStarted} />
           <HowItWorksSection />
           <FeaturesSection />
           <CategoriesSection />
           <TestimonialsSection />
           <CTASection onGetStarted={onGetStarted} />
           <Footer />
       </div>
    );
};

export default LandingPage;