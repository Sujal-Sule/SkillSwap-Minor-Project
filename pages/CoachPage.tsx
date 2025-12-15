import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getCoachResponse } from '../services/geminiService';
import { PaperAirplaneIcon, SparklesIcon } from '../components/icons';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface CoachMessage {
    sender: 'user' | 'coach';
    text: string;
}

const CoachPage: React.FC = () => {
    const { currentUser } = useContext(AuthContext);
    const [messages, setMessages] = useState<CoachMessage[]>([
        {
            sender: 'coach',
            text: "Hi! I'm your AI learning coach. How can I help you on your learning journey today? You can ask me for advice on staying motivated, learning tips, or how to approach a new skill.",
        },
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    if (!currentUser) return null;

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || isLoading) return;

        const userMessage: CoachMessage = {
            sender: 'user',
            text: newMessage,
        };
        
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsLoading(true);

        try {
            const coachResponseText = await getCoachResponse(currentUser.id, newMessage);
            const coachMessage: CoachMessage = {
                sender: 'coach',
                text: coachResponseText,
            };
            setMessages(prev => [...prev, coachMessage]);
        } catch (error) {
            const errorMessage: CoachMessage = {
                sender: 'coach',
                text: "Sorry, I'm having a little trouble connecting right now. Let's try again in a moment.",
            };
            setMessages(prev => [...prev, errorMessage]);
            console.error("Error getting coach response:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-210px)] md:h-[calc(100vh-144px)] max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-700">
                 <div className="w-10 h-10 rounded-full mr-3 bg-sky-500 flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-white"/>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Learning Coach</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                         {msg.sender === 'coach' && (
                            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                                <SparklesIcon className="w-5 h-5 text-white"/>
                            </div>
                        )}
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                                msg.sender === 'user'
                                    ? 'bg-sky-600 text-white rounded-br-lg'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'
                            }`}
                        >
                             {msg.sender === 'coach' ? (
                                <MarkdownRenderer text={msg.text} />
                            ) : (
                                <p className="text-sm">{msg.text}</p>
                            )}
                        </div>
                        {msg.sender === 'user' && (
                            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                        )}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                         <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                            <SparklesIcon className="w-5 h-5 text-white"/>
                        </div>
                        <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                             <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                             </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask your coach anything..."
                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="ml-4 p-3 bg-sky-600 text-white rounded-full hover:bg-sky-700 disabled:bg-sky-800 disabled:cursor-not-allowed transition-colors"
                        disabled={!newMessage.trim() || isLoading}
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CoachPage;