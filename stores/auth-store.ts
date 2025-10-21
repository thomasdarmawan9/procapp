"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/lib/types";

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  hasRole: (roles: Role | Role[]) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        const list = Array.isArray(roles) ? roles : [roles];
        return list.includes(user.role);
      }
    }),
    {
      name: "proc-auth"
    }
  )
);
