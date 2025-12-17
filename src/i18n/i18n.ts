import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LanguageType } from "../store/reducers/settingsReducer";
import enResource from "./resources/en.json";
import frResource from "./resources/fr.json";
import arResource from "./resources/ar.json";
import ruResource from "./resources/ru.json";

const resources = {
  en: enResource,
  fr: frResource,
  ar: arResource,
  ru: ruResource,
};

export const initI18n = (lang: LanguageType) => {
  i18n.use(initReactI18next).init({
    resources,
    lng: lang,
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });
  return i18n;
};
