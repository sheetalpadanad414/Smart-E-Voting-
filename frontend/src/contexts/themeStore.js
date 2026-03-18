import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => {
        const newMode = !state.isDarkMode;
        // Update document class for Tailwind dark mode
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: newMode };
      }),
      setDarkMode: (value) => set(() => {
        if (value) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: value };
      })
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on initial load
        if (state?.isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  )
);

export default useThemeStore;
