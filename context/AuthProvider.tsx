// src/context/AuthProvider.tsx
import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../types';
import { signInWithGooglePopup, registerWithEmailAndPassword, loginWithEmailAndPasswordService } from '../services/authServices';

// Helper: exchange Firebase idToken with your backend to get app JWT & user data
// Removed as it is now handled in authServices


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const cached = localStorage.getItem('appUser');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [isAdmin, setIsAdmin] = useState(() => {
        const cachedUser = localStorage.getItem('appUser');
        if (cachedUser) {
            try {
                const user = JSON.parse(cachedUser);
                return !!user.isAdmin;
            } catch (e) {}
        }
        return false;
    });

    const [loading, setLoading] = useState(() => {
        const cached = localStorage.getItem('appUser');
        return !cached;
    });

    useEffect(() => {
        let unsubscribe: () => void;

        const initAuth = async () => {
            try {
                const { getAuthInstance } = await import('../firebaseConfig');
                const auth = getAuthInstance();
                const { onAuthStateChanged } = await import('firebase/auth');
                const { verifyTokenWithBackend } = await import('../services/authServices');

                unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    if (firebaseUser) {
                        try {
                            const idToken = await firebaseUser.getIdToken(); // Use cached token if valid
                            const appUser = await verifyTokenWithBackend(idToken);
                            setCurrentUser(appUser);
                            setIsAdmin(!!(appUser as any).isAdmin);

                            // Keep local storage in sync just in case, though state is primary
                            localStorage.setItem('appToken', idToken);
                            localStorage.setItem('appUser', JSON.stringify(appUser));
                        } catch (error) {
                            console.error("Failed to restore backend session", error);
                            // If backend fetch fails, maybe logout or retry?
                            // logging out to be safe
                            setCurrentUser(null);
                        }
                    } else {
                        setCurrentUser(null);
                        localStorage.removeItem('appToken');
                        localStorage.removeItem('appUser');
                    }
                    setLoading(false);
                });
            } catch (err) {
                console.error("Auth Init Error", err);
                setLoading(false);
            }
        };

        initAuth();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const login = () => {
        // placeholder for username-password or other internal login used by your earlier UI
        // you might call loginWithEmail below instead
        console.log('login placeholder called');
    };

    const adminLogin = () => {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
        // optional: set a fake admin user
        setCurrentUser({
            id: 'admin',
            name: 'Admin',
            email: 'admin@example.com',
            avatarUrl: '',
            bio: 'System Admin',
            teaches: [],
            learns: [],
            tokens: 999,
            connections: [],
            isOnline: true
        } as User);
    };

    const loginWithGoogle = async () => {
        const { user, idToken } = await signInWithGooglePopup();

        // store token & user locally
        localStorage.setItem('appToken', idToken); // or backend token if we had one separate
        localStorage.setItem('appUser', JSON.stringify(user));
        setCurrentUser(user);
        return user;
    };

    const loginWithEmail = async (email: string, password: string) => {
        const { idToken, user } = await loginWithEmailAndPasswordService(email, password);
        // backend verification already done in service, user is the app user
        localStorage.setItem('appToken', idToken);
        localStorage.setItem('appUser', JSON.stringify(user));
        setCurrentUser(user as User);
        setIsAdmin(!!(user as any).isAdmin);
        return user;
    };

    const signupWithEmail = async (email: string, password: string, username: string) => {
        const { idToken, user } = await registerWithEmailAndPassword(email, password, username);

        localStorage.setItem('appToken', idToken);
        localStorage.setItem('appUser', JSON.stringify(user));
        setCurrentUser(user as User);
        return user;
    };

    const logout = async () => {
        localStorage.removeItem('appToken');
        localStorage.removeItem('appUser');
        localStorage.removeItem('isAdmin');
        setCurrentUser(null);
        setIsAdmin(false);
        // optionally sign out from firebase auth:
        try {
            const auth = (await import('../firebaseConfig')).getAuthInstance();
            auth?.signOut?.();
        } catch { }
    };

    const updateUser = async (user: User) => {
        try {
            // Optimistically update local state
            setCurrentUser(user);
            localStorage.setItem('appUser', JSON.stringify(user));

            // Persist to backend
            const { api } = await import('../services/api');
            await api.put('/users/me', user);
        } catch (error) {
            console.error("Failed to update user profile", error);
            // Optionally revert local state or show notification
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAdmin,
                loading,
                login,
                loginWithGoogle,
                loginWithEmail,
                signupWithEmail,
                adminLogin,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
