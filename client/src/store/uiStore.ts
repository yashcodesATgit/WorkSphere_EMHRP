import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false, // Closed by default on mobile, handled via effects/css for desktop
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  isDarkMode: true, // Dark mode is default, light mode is secondary
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
