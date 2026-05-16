import { create } from 'zustand';
import { UserProfile, Meter } from '@/types';

interface AppState {
  user: UserProfile | null;
  meters: Meter[];
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setMeters: (meters: Meter[]) => void;
  setLoading: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  meters: [],
  isLoading: false,
  setUser: (user) => set({ user }),
  setMeters: (meters) => set({ meters }),
  setLoading: (status) => set({ isLoading: status }),
}));