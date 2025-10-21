"use client";

import { usePreferencesStore } from "@/stores/preferences-store";
import { getDictionary } from "@/lib/i18n";

export const useTranslation = () => {
  const locale = usePreferencesStore((state) => state.locale);
  const dict = getDictionary(locale);
  return {
    locale,
    t: (key: keyof typeof dict) => dict[key] ?? key
  };
};
