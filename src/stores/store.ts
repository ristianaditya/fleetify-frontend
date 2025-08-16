import { create } from 'zustand';

type ValidPage = 'Department' | 'Employee' | 'Dashboard' | 'Attendance History' | 'Attendance';

interface PageActiveState {
  pageActive: ValidPage;
  setPageActive: (page: ValidPage) => void;
}

export const pageActiveStore = create<PageActiveState>((set) => ({
  pageActive: "Dashboard",
  setPageActive: (page: ValidPage) => set({ pageActive: page }),
}));