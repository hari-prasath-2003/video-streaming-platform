import { create } from "zustand";

interface UserState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const useUserStore = create<UserState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
}));

export default useUserStore;
