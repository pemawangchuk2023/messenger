import { create } from 'zustand';

interface ActiveListStore {
  members: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  set: (ids: string[]) => void;
}

const useActiveList = create<ActiveListStore>((set) => ({
  members: [],
  add: (id: string) => set((state) => ({ members: [...state.members, id] })),
  remove: (id: string) =>
    set((state) => ({
      members: [...state.members.filter((member) => member !== id)],
    })),
  set: (ids: string[]) => set({ members: ids }),
}));

export default useActiveList;
