import { create } from "zustand";
import type { Account } from "@/lib/user";

interface UserState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  /** Cached GET /api/user/me, shared across screens. */
  account: Account | null;
  setAccount: (account: Account | null) => void;
}

const useUserStore = create<UserState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  account: null,
  setAccount: (account) => set({ account }),
}));

export default useUserStore;
