import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resources from "./locales.json";

const defaultLanguage =
  typeof window !== "undefined" ? window.navigator.language : "en";

i18n.use(initReactI18next).init({
  lng: defaultLanguage,
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
