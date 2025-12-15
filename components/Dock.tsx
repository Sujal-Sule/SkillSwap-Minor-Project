import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, MotionValue } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
    id: string;
    path: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    count: number;
}

interface DockProps {
    navItems: NavItem[];
}

const DockIcon: React.FC<{
    item: NavItem;
    mouseX: MotionValue<number>;
    isActive: boolean;
}> = ({ item, mouseX, isActive }) => {
    const ref = useRef<HTMLAnchorElement>(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const scale = useTransform(distance, [-150, 0, 150], [1, 1.75, 1], {
        clamp: true
    });

    const opacity = useTransform(distance, [-75, 0, 75], [0, 1, 0], { clamp: true });

    const scaleSpring = useSpring(scale, { mass: 0.1, stiffness: 150, damping: 12 });
    const opacitySpring = useSpring(opacity, { mass: 0.1, stiffness: 200, damping: 20 });

    return (
        <div className="relative flex flex-col items-center">
            <motion.div style={{ scale: scaleSpring }}>
                <Link
                    ref={ref}
                    to={item.path}
                    className={`relative block p-3 rounded-full transition-colors duration-200 ${isActive ? 'bg-sky-500/30' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                        }`}
                    aria-label={item.label}
                >
                    <item.icon className={`w-7 h-7 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    {item.count > 0 && (
                        <span className="absolute -top-1 -right-1 block h-5 w-5 text-xs rounded-full bg-red-500 text-white flex items-center justify-center border-2 border-slate-50 dark:border-slate-800">
                            {item.count}
                        </span>
                    )}
                </Link>
            </motion.div>
            <motion.div
                className="absolute bottom-full mb-2 px-2 py-1 bg-slate-800 text-white text-xs font-semibold rounded-md pointer-events-none"
                style={{
                    scale: scaleSpring,
                    opacity: isActive ? 1 : opacitySpring,
                }}
            >
                {item.label}
            </motion.div>
        </div>
    );
};


const Dock: React.FC<DockProps> = ({ navItems }) => {
    const mouseX = useMotionValue(Infinity);
    const location = useLocation();

    return (
        <nav
            onMouseMove={(e) => mouseX.set(e.clientX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className="glassy-dock z-50 md:hidden"
        >
            {navItems.map((item) => (
                <DockIcon
                    key={item.id}
                    item={item}
                    mouseX={mouseX}
                    isActive={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                />
            ))}
        </nav>
    );
};

export default Dock;