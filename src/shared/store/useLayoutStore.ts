import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LayoutState {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isCollapsed: true, // Começa fechado por padrão, igual ao estado local
      setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: 'layout-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
