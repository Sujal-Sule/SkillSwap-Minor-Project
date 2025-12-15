import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { AcademicCapIcon, LightBulbIcon, UsersIcon } from '../components/icons';
import Logo from '../components/Logo';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.356-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.417 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);


const LoginPage: React.FC = () => {
    const { loginWithGoogle, loginWithEmail, signupWithEmail, adminLogin } = useContext(AuthContext);

    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState({ value: '', error: '' });
    const [email, setEmail] = useState({ value: '', error: '' });
    const [password, setPassword] = useState({ value: '', error: '' });
    const [loginError, setLoginError] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validateField = (name: 'username' | 'password' | 'email', value: string): string => {
        switch (name) {
            case 'username':
                if (isSignUp && !value) return 'Username is required.';
                if (isSignUp && value.length < 3) return 'Username must be at least 3 characters.';
                // For login, we accept it as "Username or Email"
                if (!isSignUp && !value) return 'Username or Email is required.';
                return '';
            case 'email':
                if (!value) return isSignUp ? 'Email is required.' : ''; 
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return isSignUp ? 'Invalid email address.' : '';
                return '';
            case 'password':
                if (!value) return 'Password is required.';
                if (value.length < 6) return 'Password must be at least 6 characters.';
                return '';
            default:
                return '';
        }
    };

    useEffect(() => {
        let valid = true;
        
        if (isSignUp) {
            valid = !!(username.value && email.value && password.value && 
                       !validateField('username', username.value) && 
                       !validateField('email', email.value) && 
                       !validateField('password', password.value));
        } else {
            // Login: requires (username OR email) AND password
            // We use the 'email' input state for "Email or Username" in Login mode.
            valid = !!(email.value && password.value && password.value.length >= 6);
        }

        setIsFormValid(valid);
    }, [username.value, email.value, password.value, isSignUp]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'username') setUsername({ value, error: '' });
        else if (name === 'email') setEmail({ value, error: '' });
        else if (name === 'password') setPassword({ value, error: '' });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setIsLoading(true);

        try {
            if (isSignUp) {
                await signupWithEmail(email.value, password.value, username.value);
            } else {
                // Admin backdoor
                if (email.value === 'admin123' && password.value === '123') {
                    adminLogin();
                    return;
                }
                // Check if the input is "sujal_31" which is a username, not email.
                // The backend auth function handles the "sujal_31" check or standard email login.
                await loginWithEmail(email.value, password.value);
            }
        } catch (err: any) {
            let msg = "Authentication failed.";
            if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
            if (err.code === 'auth/email-already-in-use') msg = "Email is already registered.";
            if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
            setLoginError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoginError('');
        try {
            await loginWithGoogle();
        } catch (error: any) {
            setLoginError(error.message || "Failed to sign in with Google.");
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setLoginError('');
        setUsername({ value: '', error: '' });
        setEmail({ value: '', error: '' });
        setPassword({ value: '', error: '' });
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
                className="w-full max-w-4xl p-8 space-y-6 bg-slate-50/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/10 dark:border-white/10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="text-center mb-8 flex flex-col items-center">
                    <Logo size={80} className="mb-4" />
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        {isSignUp ? 'Join the new economy of knowledge.' : 'Your journey continues here.'}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="space-y-4 hidden md:block">
                         <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                                <AcademicCapIcon className={`w-7 h-7 text-sky-500 dark:text-sky-400`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Teach & Earn</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Share your expertise and earn Skill Tokens for every session you host.</p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                                <LightBulbIcon className={`w-7 h-7 text-emerald-500 dark:text-emerald-400`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Learn & Grow</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Use your tokens to learn new skills from other talented members of the community.</p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                                <UsersIcon className={`w-7 h-7 text-amber-500 dark:text-amber-400`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Connect & Collaborate</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Find mentors, chat in real-time, and schedule learning sessions that fit your life.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isSignUp && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        value={username.value}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border rounded-md shadow-sm placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors border-slate-300 dark:border-slate-600`}
                                        placeholder="johndoe"
                                    />
                                </motion.div>
                            )}
                            
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {isSignUp ? "Email Address" : "Email or Username"}
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    autoComplete="email"
                                    value={email.value}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border rounded-md shadow-sm placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors border-slate-300 dark:border-slate-600`}
                                    placeholder={isSignUp ? "you@example.com" : "you@example.com or sujal_31"}
                                />
                            </div>

                            <div>
                                <label htmlFor="password"className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                    value={password.value}
                                    onChange={handleChange}
                                     className={`mt-1 block w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border rounded-md shadow-sm placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors border-slate-300 dark:border-slate-600`}
                                    placeholder="••••••••"
                                />
                            </div>
                            
                            {!isSignUp && (
                                <div className="flex items-center justify-end text-sm">
                                    <a href="#" onClick={(e) => { e.preventDefault(); alert("Password recovery feature is coming soon!"); }} className="font-medium text-sky-600 dark:text-sky-400 hover:underline">
                                        Forgot Password?
                                    </a>
                                </div>
                            )}

                             {loginError && <p className="text-sm text-red-500 dark:text-red-400 text-center">{loginError}</p>}
                            
                            <div>
                                <button
                                    type="submit"
                                    disabled={!isFormValid || isLoading}
                                    className="w-full inline-flex items-center justify-center px-8 py-2.5 text-base font-semibold text-white bg-sky-600 border border-transparent rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-sky-500 transition-all transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                                </button>
                            </div>
                        </form>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-50 dark:bg-slate-800 text-slate-500">OR</span>
                            </div>
                        </div>

                         <div>
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full inline-flex items-center justify-center px-8 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-sky-500 transition-all"
                            >
                                <GoogleIcon />
                                {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                            </button>
                        </div>

                        <div className="text-center mt-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {isSignUp ? "Already have an account?" : "Need an account?"}{' '}
                                <button onClick={toggleMode} className="font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;