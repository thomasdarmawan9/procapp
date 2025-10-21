"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "id";

type PreferencesState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale })
    }),
    {
      name: "proc-preferences"
    }
  )
);
