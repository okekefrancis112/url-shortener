// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, LoginCredentials, SignupCredentials } from '@/utils/auth';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>; // Make this async
  initialize: () => void; // Add initialize method
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initialize: () => {
        // Check if we're in browser environment
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const user = authService.getCurrentUser();
              set({ user, isAuthenticated: true });
            } catch (error) {
              console.error('Failed to initialize auth:', error);
              localStorage.removeItem('token');
              set({ user: null, isAuthenticated: false });
            }
          }
        }
      },

      checkAuth: async () => {
        return new Promise<void>((resolve) => {
          if (typeof window === 'undefined') {
            set({ isLoading: false });
            resolve();
            return;
          }

          set({ isLoading: true });

          try {
            const token = localStorage.getItem('token');

            if (!token) {
              set({ user: null, isAuthenticated: false, isLoading: false });
              resolve();
              return;
            }

            // Verify token is still valid (not expired)
            const user = authService.getCurrentUser();
            if (user) {
              // Check if token is expired
              const currentTime = Date.now() / 1000;
              if (user.exp && user.exp < currentTime) {
                // Token expired
                localStorage.removeItem('token');
                set({ user: null, isAuthenticated: false, isLoading: false });
              } else {
                set({ user, isAuthenticated: true, isLoading: false });
              }
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          } catch (error) {
            console.error('Error checking auth:', error);
            set({ user: null, isAuthenticated: false, isLoading: false });
          } finally {
            resolve();
          }
        });
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          authService.storeToken(response.token);
          const user = authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      signup: async (credentials: SignupCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.signup(credentials);
          authService.storeToken(response.token);
          const user = authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Failed to rehydrate auth store:', error);
          }
        };
      },
    }
  )
);