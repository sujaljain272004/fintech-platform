import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="secondary-button gap-2 px-3 py-2"
      aria-label={theme === "light" ? t("themeDark") : t("themeLight")}
    >
      {theme === "light" ? <MoonStar size={16} /> : <SunMedium size={16} />}
      <span className="hidden sm:inline">{theme === "light" ? t("darkMode") : t("lightMode")}</span>
    </button>
  );
};

export default ThemeToggle;
