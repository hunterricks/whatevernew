import { create } from 'zustand';

interface AppState {
  jobs: Job[];
  proposals: Proposal[];
  setJobs: (jobs: Job[]) => void;
  setProposals: (proposals: Proposal[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  jobs: [],
  proposals: [],
  setJobs: (jobs) => set({ jobs }),
  setProposals: (proposals) => set({ proposals }),
})); 