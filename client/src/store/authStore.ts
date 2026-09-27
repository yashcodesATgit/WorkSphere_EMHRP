import { create } from 'zustand';
import { tokenStorage } from '../lib/axios';

export type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user, token) => {
    tokenStorage.set(token, user.role);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    tokenStorage.remove();
    set({ user: null, isAuthenticated: false });
  },
}));
