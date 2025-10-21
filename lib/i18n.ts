import en from "@/locales/en.json";
import id from "@/locales/id.json";
import type { Locale } from "@/stores/preferences-store";

const dictionaries = {
  en,
  id
};

export type DictionaryKey = keyof typeof en;

export const getDictionary = (locale: Locale) => dictionaries[locale] ?? dictionaries.en;

export const translate = (key: DictionaryKey, locale: Locale = "en") => {
  const dict = getDictionary(locale);
  return dict[key] ?? key;
};
