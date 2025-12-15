import React from 'react';
import Logo from './Logo';

interface NavItem {
    id: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    count: number;
}

interface SidebarProps {
    navItems: NavItem[];
    currentPage: string;
    setCurrentPage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, currentPage, setCurrentPage }) => {
    return (
        <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex-col p-6 hidden md:flex">
            <div className="mb-10">
                <Logo size={48} />
            </div>
            
            <nav className="flex-1 flex flex-col">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`relative flex items-center w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                            currentPage === item.id 
                            ? 'bg-slate-800 text-white' 
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        }`}
                    >
                        <item.icon className={`w-5 h-5 mr-3 ${currentPage === item.id ? 'text-sky-400' : 'text-slate-500'}`} />
                        {item.label}
                        {item.count > 0 && (
                             <span className="ml-auto text-xs font-bold w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;