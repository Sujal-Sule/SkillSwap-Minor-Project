import React from 'react';
import type { User } from '../types';
import { motion, LayoutGroup } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { NavLink, useNavigate } from 'react-router-dom';

interface NavItem {
    id: string; // doubling as path segment usually or mappable
    path: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    count: number;
}

interface HeaderProps {
    currentUser: User;
    isAdmin: boolean;
    logout: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    navItems: NavItem[];
}

const Header: React.FC<HeaderProps> = ({ currentUser, isAdmin, logout, theme, toggleTheme, navItems }) => {
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-0 right-0 p-4 z-40">
            <div className="glassy-nav-container rounded-2xl mx-auto max-w-7xl">
                <div className="flex items-center justify-between h-16 px-6">
                    {/* Left side: Logo and Nav */}
                    <div className="flex items-center space-x-8">
                        <div onClick={() => navigate('/')} className="cursor-pointer">
                            <Logo size={40} />
                        </div>
                        <LayoutGroup>
                            <nav className="hidden md:flex items-center space-x-2">
                                {navItems.map(item => (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        className={({ isActive }) => `relative px-3 py-2 text-sm font-semibold rounded-md transition-colors ${isActive
                                            ? 'text-white'
                                            : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {item.label}
                                                {isActive && (
                                                    <motion.span
                                                        layoutId="active-nav-underline"
                                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-sky-400 rounded-full"
                                                    />
                                                )}
                                                {item.count > 0 && (
                                                    <span className="absolute -top-1 -right-1 block h-4 w-4 text-[10px] rounded-full bg-red-500 text-white flex items-center justify-center border-2 border-slate-800">
                                                        {item.count > 9 ? '9+' : item.count}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </nav>
                        </LayoutGroup>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-semibold text-white">{currentUser.name}</div>
                                {!isAdmin && <div className="text-sm font-bold text-amber-400">{currentUser.tokens} Tokens</div>}
                            </div>
                            <img className="h-10 w-10 rounded-full" src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + currentUser.id} alt={currentUser.name} />
                            <button onClick={logout} className="hidden sm:block px-3 py-2 text-sm font-medium text-slate-300 bg-white/10 rounded-md hover:bg-white/20 transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;