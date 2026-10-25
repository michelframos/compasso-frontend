import axios from 'axios';
import { useAuthStore } from '@/shared/store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const { token, tenant } = useAuthStore.getState();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenant?.slug && !isPlatformRequest(config.url)) {
    config.headers['X-Tenant-Slug'] = tenant.slug;
  }

  return config;
});

function isPlatformRequest(url?: string): boolean {
  if (!url) {
    return false;
  }

  return url.includes('/platform/') || url.startsWith('platform/');
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }

    if (error.response?.status === 403 && error.response.data?.code === 'troca_senha_obrigatoria') {
      useAuthStore.getState().updateUser({ deve_trocar_senha: true });
    }

    return Promise.reject(error);
  },
);

export default api;
