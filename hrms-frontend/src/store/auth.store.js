import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: ({ user, token, refreshToken }) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        }),

      setToken: (token) => set({ token }),

      setTokens: ({ token, refreshToken }) =>
        set((state) => ({
          token: token ?? state.token,
          refreshToken: refreshToken ?? state.refreshToken,
        })),

      setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'hrms-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
