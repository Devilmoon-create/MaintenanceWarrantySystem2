import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  role: number;
  isActive: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (username: string, password: string) => {
        const response = await authApi.login(username, password);
        const { accessToken, refreshToken, user } = response.data;
        
        // Access token: localStorage (volatile)
        localStorage.setItem('accessToken', accessToken);
        // Refresh token: HttpOnly cookie (secure, not accessible via JS)
        document.cookie = `refreshToken=${refreshToken}; Path=/; Secure; SameSite=Strict; HttpOnly`;
        
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        // Remove refresh token from document.cookie
        document.cookie = 'refreshToken=; Path=/; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        // Refresh token: HttpOnly cookie (not accessible via JS)
        document.cookie = `refreshToken=${refreshToken}; Path=/; Secure; SameSite=Strict; HttpOnly`;
        set({ accessToken, refreshToken });
      },

      setUser: (user: User) => {
        set({ user });
      },

      updateUser: (user: User) => {
        set({ user });
      },

      checkAuth: async () => {
        // Access token is in localStorage (volatile)
        const accessToken = localStorage.getItem('accessToken');
        // Refresh token is in HttpOnly cookie (not accessible via JS)
        const refreshToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('refreshToken='))
          ?.split('=')[1];
        
        if (accessToken) {
          try {
            const response = await authApi.me();
            set({
              user: response.data,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
