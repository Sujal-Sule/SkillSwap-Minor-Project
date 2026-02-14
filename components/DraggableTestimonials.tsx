import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { User, Rating } from "../types";

type Testimonial = Rating & { rater: User; outcome?: string };

interface DraggableTestimonialsProps {
  testimonials: Testimonial[];
}

const DraggableTestimonials: React.FC<DraggableTestimonialsProps> = ({
  testimonials,
}) => {
  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, [testimonials]);

  return (
    <div ref={carousel} className="cursor-grab overflow-hidden">
      <motion.div
        drag="x"
        dragConstraints={{ right: 0, left: -width }}
        whileTap={{ cursor: "grabbing" }}
        className="flex gap-6 pl-2"
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="flex-shrink-0 w-[400px] bg-slate-800/40 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-sky-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/5 group relative overflow-hidden"
          >
            {/* Decorative Quote Mark */}
            <div className="absolute top-6 right-8 text-6xl text-slate-700/20 font-serif leading-none select-none">
              "
            </div>

            <div className="flex items-start gap-4 mb-6">
              <img
                src={testimonial.rater.avatarUrl}
                alt={testimonial.rater.name}
                className="w-14 h-14 rounded-full border-2 border-slate-600 group-hover:border-sky-500/50 transition-colors shadow-lg"
              />
              <div>
                <h4 className="font-bold text-lg text-slate-100">
                  {testimonial.rater.name}
                </h4>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  {testimonial.outcome || "Video Session"} •{" "}
                  <span className="text-slate-500">2 days ago</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4 bg-amber-500/5 w-fit px-2 py-1 rounded-md border border-amber-500/10">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < testimonial.stars ? "text-amber-400 fill-amber-400" : "text-slate-700"}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm font-bold text-amber-100">
                {testimonial.stars}.0
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed italic relative z-10">
              "{testimonial.feedback}"
            </p>

            {/* Verified Badge - mocked connection check logic or just existing logic */}
            {testimonial.rater.connections && (
              <div className="mt-6 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                Verified Student
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default DraggableTestimonials;
