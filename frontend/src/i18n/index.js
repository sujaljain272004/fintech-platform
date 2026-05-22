import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./translations";

const savedLanguage = localStorage.getItem("finlink-language") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem("finlink-language", language);
});

export default i18n;
