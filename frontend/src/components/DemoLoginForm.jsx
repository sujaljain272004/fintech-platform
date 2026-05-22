import { useEffect, useState } from "react";
import { Shield, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DemoLoginForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signInWithPhone, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInWithPhone({
        phoneNumber: phoneNumber.trim(),
        fullName: fullName.trim(),
        preferredLanguage: i18n.language,
      });
      navigate("/dashboard", { replace: true });
      setTimeout(() => {
        if (window.location.pathname === "/login") {
          window.location.replace("/dashboard");
        }
      }, 150);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel w-full max-w-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="pill-chip mb-3 gap-2">
            <Shield size={14} />
            {t("secureLedger")}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t("authTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t("authSubtitle")}</p>
        </div>
        <div className="hidden h-14 w-14 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-700 md:flex dark:text-teal-300">
          <Smartphone size={26} />
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="field-label">{t("fullName")}</label>
          <input
            className="field-input"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ravi Kumar"
            required
          />
        </div>

        <div>
          <label className="field-label">{t("phoneNumber")}</label>
          <input
            className="field-input"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+919876543210"
            required
          />
        </div>

        <div className="rounded-3xl bg-teal-50 p-4 text-sm text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
          <p className="font-semibold">{t("phoneLoginHintTitle")}</p>
          <p>{t("phoneLoginHintBody")}</p>
        </div>

        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

        <button type="submit" className="primary-button w-full" disabled={submitting}>
          {submitting ? t("signingIn") : t("signIn")}
        </button>
      </form>
    </div>
  );
};

export default DemoLoginForm;
