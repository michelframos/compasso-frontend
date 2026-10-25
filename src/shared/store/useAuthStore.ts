import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Instituicao } from '@/modules/core/types';

export interface AuthUser {
  id: number;
  name: string;
  nome?: string;
  email: string;
  role?: string;
  is_super_admin?: boolean;
  deve_trocar_senha?: boolean;
  foto_url?: string | null;
}

export interface ImpersonationState {
  active: boolean;
  superAdminToken: string;
  superAdminUser: AuthUser;
  logId: number;
}

interface StartImpersonationPayload {
  user: AuthUser;
  token: string;
  tenant: Instituicao;
  superAdminToken: string;
  superAdminUser: AuthUser;
  logId: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  tenant: Instituicao | null;
  tenants: Instituicao[];
  impersonation: ImpersonationState | null;
  isAuthenticated: boolean;
  setAuth: (
    user: AuthUser,
    token: string,
    tenant?: Instituicao | null,
    tenants?: Instituicao[],
  ) => void;
  setTenant: (tenant: Instituicao | null) => void;
  setTenants: (tenants: Instituicao[]) => void;
  updateUser: (changes: Partial<AuthUser>) => void;
  startImpersonation: (payload: StartImpersonationPayload) => void;
  restorePlatformSession: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      tenant: null,
      tenants: [],
      impersonation: null,
      isAuthenticated: false,
      setAuth: (user, token, tenant = null, tenants = []) => {
        localStorage.setItem('auth_token', token);
        set({
          user,
          token,
          tenant,
          tenants,
          impersonation: null,
          isAuthenticated: true,
        });
      },
      setTenant: (tenant) => set({ tenant }),
      setTenants: (tenants) => set({ tenants }),
      updateUser: (changes) => set((state) => ({
        user: state.user ? { ...state.user, ...changes } : state.user,
      })),
      startImpersonation: ({
        user,
        token,
        tenant,
        superAdminToken,
        superAdminUser,
        logId,
      }) => {
        localStorage.setItem('auth_token', token);
        set({
          user,
          token,
          tenant,
          tenants: [],
          impersonation: {
            active: true,
            superAdminToken,
            superAdminUser,
            logId,
          },
          isAuthenticated: true,
        });
      },
      restorePlatformSession: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({
          user,
          token,
          tenant: null,
          tenants: [],
          impersonation: null,
          isAuthenticated: true,
        });
      },
      clearAuth: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth-storage');
        set({
          user: null,
          token: null,
          tenant: null,
          tenants: [],
          impersonation: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState) => {
        // A versão 0 guardava e-mail e senha em `pendingLogin`.
        const state = { ...((persistedState ?? {}) as Record<string, unknown>) };
        delete state.pendingLogin;
        return state as unknown as AuthState;
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tenant: state.tenant,
        tenants: state.tenants,
        impersonation: state.impersonation,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
