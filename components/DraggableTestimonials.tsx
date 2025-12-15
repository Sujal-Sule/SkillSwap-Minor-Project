import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import type { User, Rating } from '../types';

type Testimonial = Rating & { rater: User };

interface DraggableTestimonialsProps {
    testimonials: Testimonial[];
}

const DraggableTestimonials: React.FC<DraggableTestimonialsProps> = ({ testimonials }) => {
    const constraintsRef = useRef(null);

    return (
        <div ref={constraintsRef} className="overflow-x-auto pb-4 cursor-grab active:cursor-grabbing hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <motion.div
                className="flex gap-4"
            // Removed drag props for native scrolling, but kept motion for entry animations if desired
            >
                {testimonials.map((testimonial, index) => (
                    <div
                        key={testimonial.id}
                        className="flex-shrink-0 w-[280px] bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-transform hover:-translate-y-1"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <img src={testimonial.rater.avatarUrl} alt={testimonial.rater.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{testimonial.rater.name}</p>
                                <p className="text-amber-500 dark:text-amber-400">{'★'.repeat(testimonial.stars)}{'☆'.repeat(5 - testimonial.stars)}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{testimonial.feedback}"</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default DraggableTestimonials;