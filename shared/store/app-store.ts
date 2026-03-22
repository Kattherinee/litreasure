import { create } from "zustand";

type AppStoreState = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
