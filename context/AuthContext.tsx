import { createContext } from 'react';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, username: string) => Promise<void>;
  adminLogin: () => void;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  loading: true,
  login: () => { },
  loginWithGoogle: async () => { },
  loginWithEmail: async () => { },
  signupWithEmail: async () => { },
  adminLogin: () => { },
  logout: () => { },
  updateUser: () => { },
});