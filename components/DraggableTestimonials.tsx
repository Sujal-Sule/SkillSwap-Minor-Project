import React, { useRef, useState } from "react";
import type { User, Rating } from "../types";

type Testimonial = Rating & { rater: User; outcome?: string };

interface DraggableTestimonialsProps {
  testimonials: Testimonial[];
}

const DraggableTestimonials: React.FC<DraggableTestimonialsProps> = ({
  testimonials,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    setIsDown(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchEnd = () => {
    setIsDown(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDown || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={carouselRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className="overflow-x-auto select-none cursor-grab active:cursor-grabbing flex gap-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="flex-shrink-0 w-[380px] bg-background p-6 rounded-[28px] border border-slate-200/10 dark:border-slate-800/10 shadow-[6px_6px_15px_rgba(163,177,198,0.35),_-6px_-6px_15px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_15px_rgba(0,0,0,0.5),_-6px_-6px_15px_rgba(255,255,255,0.02)] transition-all duration-300 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),inset_-3px_-3px_6px_#ffffff] dark:hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4)] group relative overflow-hidden"
        >
          <div className="absolute top-4 right-6 text-6xl text-text-muted/10 font-serif leading-none select-none">
            "
          </div>

          <div className="flex items-start gap-4 mb-4">
            <img
              src={
                testimonial.rater.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.rater.id}`
              }
              alt={testimonial.rater.name}
              className="w-12 h-12 rounded-full border border-slate-200/10 dark:border-slate-800/10 shadow-[2px_2px_5px_rgba(163,177,198,0.25)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.45)]"
            />
            <div>
              <h4 className="font-black text-sm text-text-primary">
                {testimonial.rater.name}
              </h4>
              <div className="text-[9px] text-text-muted font-black uppercase tracking-wider mt-0.5">
                {testimonial.outcome || "Video Session"} • 2 days ago
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-3 bg-background px-3 py-1 rounded-full border border-slate-200/10 dark:border-slate-800/10 shadow-[2px_2px_4px_rgba(163,177,198,0.15),_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.35)] w-fit">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${i < testimonial.stars ? "text-amber-500 fill-amber-500" : "text-slate-300 dark:text-slate-700"}`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-[10px] font-black text-amber-600 dark:text-amber-400">
              {testimonial.stars}.0
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed italic relative z-10 font-medium">
            "{testimonial.feedback}"
          </p>

          {testimonial.rater.connections && (
            <div className="mt-4 flex items-center gap-2 text-[9px] text-emerald-500 font-black uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
              Verified Student
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DraggableTestimonials;
