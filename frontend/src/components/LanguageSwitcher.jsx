import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  return (
    <label className="secondary-button gap-2 px-3 py-2">
      <Languages size={16} />
      <span className="hidden sm:inline">{t("language")}</span>
      <select
        value={i18n.language}
        onChange={(event) => i18n.changeLanguage(event.target.value)}
        className="bg-transparent text-sm outline-none"
      >
        <option value="en">EN</option>
        <option value="hi">HI</option>
        <option value="mr">MR</option>
      </select>
    </label>
  );
};

export default LanguageSwitcher;
