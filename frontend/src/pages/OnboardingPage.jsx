import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  completeOnboarding,
  saveAddressInfo,
  saveBasicInfo,
  saveFinancialInfo,
  saveKycInfo,
  saveLanguagePreference,
} from "../services/onboardingService";

const stepOrder = ["basic", "address", "financial", "kyc", "language", "review"];

const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboarding, updateOnboarding, refreshSession } = useAuth();
  const [formData, setFormData] = useState(() => onboarding || {});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const stepIndex = useMemo(() => stepOrder.indexOf(onboarding?.currentStep || "basic"), [onboarding]);
  const currentStep = stepOrder[Math.max(stepIndex, 0)];

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const saveCurrentStep = async () => {
    if (currentStep === "basic") {
      return saveBasicInfo({
        fullName: formData.fullName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      });
    }
    if (currentStep === "address") {
      return saveAddressInfo({
        addressLine: formData.addressLine,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pinCode: formData.pinCode,
      });
    }
    if (currentStep === "financial") {
      return saveFinancialInfo({
        occupation: formData.occupation,
        monthlyIncomeRange: formData.monthlyIncomeRange,
        walletUsagePurpose: formData.walletUsagePurpose,
      });
    }
    if (currentStep === "kyc") {
      return saveKycInfo({
        governmentIdType: formData.governmentIdType,
        governmentIdNumber: formData.governmentIdNumber,
        profilePhoto: formData.profilePhoto || "",
      });
    }
    if (currentStep === "language") {
      return saveLanguagePreference({
        preferredLanguage: formData.preferredLanguage,
      });
    }
    return onboarding;
  };

  const handleNext = async () => {
    setSubmitting(true);
    setError("");
    try {
      const updated = await saveCurrentStep();
      updateOnboarding(updated);
      setFormData(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    setError("");
    try {
      const response = await completeOnboarding();
      updateOnboarding(null);
      await refreshSession();
      if (response.sessionState === "authenticated") {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitleMap = {
    basic: t("basicInfoStep"),
    address: t("addressInfoStep"),
    financial: t("financialInfoStep"),
    kyc: t("kycStep"),
    language: t("languageStep"),
    review: t("reviewStep"),
  };

  return (
    <div className="app-shell py-8">
      <div className="mx-auto max-w-3xl">
        <div className="glass-panel">
          <div className="mb-6">
            <p className="pill-chip">{t("onboardingFlow")}</p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{stepTitleMap[currentStep]}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("onboardingSubtitle")}</p>
          </div>

          <div className="mb-6 grid grid-cols-6 gap-2">
            {stepOrder.map((step, index) => (
              <div
                key={step}
                className={`h-2 rounded-full ${
                  index <= stepIndex ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>

          <div className="space-y-4">
            {currentStep === "basic" ? (
              <>
                <input className="field-input" value={formData.fullName || ""} onChange={(e) => updateField("fullName", e.target.value)} placeholder={t("fullName")} />
                <input className="field-input" value={formData.email || ""} onChange={(e) => updateField("email", e.target.value)} placeholder={t("email")} />
                <input className="field-input" type="date" value={formData.dateOfBirth || ""} onChange={(e) => updateField("dateOfBirth", e.target.value)} />
                <select className="field-input" value={formData.gender || ""} onChange={(e) => updateField("gender", e.target.value)}>
                  <option value="">{t("gender")}</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </>
            ) : null}

            {currentStep === "address" ? (
              <>
                <input className="field-input" value={formData.addressLine || ""} onChange={(e) => updateField("addressLine", e.target.value)} placeholder={t("addressLine")} />
                <input className="field-input" value={formData.city || ""} onChange={(e) => updateField("city", e.target.value)} placeholder={t("city")} />
                <input className="field-input" value={formData.state || ""} onChange={(e) => updateField("state", e.target.value)} placeholder={t("state")} />
                <input className="field-input" value={formData.country || ""} onChange={(e) => updateField("country", e.target.value)} placeholder={t("country")} />
                <input className="field-input" value={formData.pinCode || ""} onChange={(e) => updateField("pinCode", e.target.value)} placeholder={t("pinCode")} />
              </>
            ) : null}

            {currentStep === "financial" ? (
              <>
                <input className="field-input" value={formData.occupation || ""} onChange={(e) => updateField("occupation", e.target.value)} placeholder={t("occupation")} />
                <select className="field-input" value={formData.monthlyIncomeRange || ""} onChange={(e) => updateField("monthlyIncomeRange", e.target.value)}>
                  <option value="">{t("monthlyIncomeRange")}</option>
                  <option value="Below 20,000">Below 20,000</option>
                  <option value="20,000 - 50,000">20,000 - 50,000</option>
                  <option value="50,000 - 1,00,000">50,000 - 1,00,000</option>
                  <option value="Above 1,00,000">Above 1,00,000</option>
                </select>
                <input className="field-input" value={formData.walletUsagePurpose || ""} onChange={(e) => updateField("walletUsagePurpose", e.target.value)} placeholder={t("walletUsagePurpose")} />
              </>
            ) : null}

            {currentStep === "kyc" ? (
              <>
                <select className="field-input" value={formData.governmentIdType || ""} onChange={(e) => updateField("governmentIdType", e.target.value)}>
                  <option value="">{t("governmentIdType")}</option>
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                </select>
                <input className="field-input" value={formData.governmentIdNumber || ""} onChange={(e) => updateField("governmentIdNumber", e.target.value)} placeholder={t("governmentIdNumber")} />
                <input className="field-input" value={formData.profilePhoto || ""} onChange={(e) => updateField("profilePhoto", e.target.value)} placeholder={t("profilePhotoUrl")} />
              </>
            ) : null}

            {currentStep === "language" ? (
              <select className="field-input" value={formData.preferredLanguage || "en"} onChange={(e) => updateField("preferredLanguage", e.target.value)}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </select>
            ) : null}

            {currentStep === "review" ? (
              <div className="rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <p><strong>{t("fullName")}:</strong> {formData.fullName}</p>
                <p><strong>{t("phoneNumber")}:</strong> {onboarding?.phoneNumber}</p>
                <p><strong>{t("email")}:</strong> {formData.email}</p>
                <p><strong>{t("occupation")}:</strong> {formData.occupation}</p>
                <p><strong>{t("governmentIdType")}:</strong> {formData.governmentIdType}</p>
                <p><strong>{t("governmentIdNumber")}:</strong> {formData.governmentIdNumber}</p>
                <p><strong>{t("language")}:</strong> {formData.preferredLanguage}</p>
              </div>
            ) : null}
          </div>

          {error ? <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p> : null}

          <div className="mt-6 flex justify-end">
            {currentStep === "review" ? (
              <button type="button" className="primary-button" onClick={handleComplete} disabled={submitting}>
                {submitting ? t("creatingAccount") : t("completeRegistration")}
              </button>
            ) : (
              <button type="button" className="primary-button" onClick={handleNext} disabled={submitting}>
                {submitting ? t("savingStep") : t("nextStep")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
