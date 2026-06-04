import { useEffect, useState } from "react";
import { Shield, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DemoLoginForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { sendEmailOtp, signInWithEmailOtp, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const response = await sendEmailOtp({
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        fullName: fullName.trim(),
        preferredLanguage: i18n.language,
      });
      setOtpSent(true);
      setNotice(response.message || "OTP sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await signInWithEmailOtp({
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        otp: otp.trim(),
        fullName: fullName.trim(),
        preferredLanguage: i18n.language,
      });
      navigate(response.sessionState === "onboarding" ? "/onboarding" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-banner w-full max-w-xl">
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

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="metric-tile">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">Zero fee</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Transfers without hidden charges.</p>
        </div>
        <div className="metric-tile">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">Fast setup</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">One phone number starts the wallet.</p>
        </div>
        <div className="metric-tile">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">Always on</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Session persistence across visits.</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp}>
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
          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setOtpSent(false);
              setOtp("");
              setNotice("");
            }}
            placeholder="ravi@example.com"
            required
          />
        </div>

        <div>
          <label className="field-label">{t("phoneNumber")}</label>
          <input
            className="field-input"
            type="tel"
            value={phoneNumber}
            onChange={(event) => {
              setPhoneNumber(event.target.value);
              setOtpSent(false);
              setOtp("");
              setNotice("");
            }}
            placeholder="+919876543210"
            required
          />
        </div>

        {otpSent ? (
          <div>
            <label className="field-label">Email OTP</label>
            <input
              className="field-input"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              required
            />
          </div>
        ) : null}

        <div className="rounded-3xl bg-teal-50 p-4 text-sm text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
          <p className="font-semibold">{t("phoneLoginHintTitle")}</p>
          <p>Email OTP verification protects your phone-linked wallet before login or signup.</p>
        </div>

        {notice ? <p className="text-sm font-semibold text-emerald-600">{notice}</p> : null}
        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

        <button type="submit" className="primary-button w-full" disabled={submitting}>
          {submitting ? t("signingIn") : otpSent ? "Verify OTP and continue" : "Send email OTP"}
        </button>

        {otpSent ? (
          <button
            type="button"
            className="secondary-button w-full"
            disabled={submitting}
            onClick={() => {
              setOtpSent(false);
              setOtp("");
              setNotice("");
            }}
          >
            Change email or resend OTP
          </button>
        ) : null}
      </form>
    </div>
  );
};

export default DemoLoginForm;
