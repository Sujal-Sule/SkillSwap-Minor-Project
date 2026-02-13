import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import type { User, Rating } from '../types';

type Testimonial = Rating & { rater: User; outcome?: string };

interface DraggableTestimonialsProps {
    testimonials: Testimonial[];
}

const DraggableTestimonials: React.FC<DraggableTestimonialsProps> = ({ testimonials }) => {
    const constraintsRef = useRef(null);

    return (
        <div ref={constraintsRef} className="overflow-x-auto pb-4 cursor-grab active:cursor-grabbing hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <motion.div
                className="flex gap-4"
            >
                {testimonials.map((testimonial, index) => (
                    <div
                        key={testimonial.id}
                        className="flex-shrink-0 w-[320px] bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-200 dark:hover:border-sky-500/30"
                    >
                        {/* Outcome Badge */}
                        {testimonial.outcome && (
                            <div className="mb-4">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200 dark:border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {testimonial.outcome}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center space-x-4 mb-4">
                            <img src={testimonial.rater.avatarUrl} alt={testimonial.rater.name} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-md" />
                            <div>
                                <div className="flex items-center gap-1">
                                    <p className="font-bold text-slate-900 dark:text-white">{testimonial.rater.name}</p>
                                    <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex text-amber-400 text-sm">
                                    {'★'.repeat(testimonial.stars)}{'☆'.repeat(5 - testimonial.stars)}
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">"{testimonial.feedback}"</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default DraggableTestimonials;