import api from "./api";

export const getOnboardingSession = async () => {
  const response = await api.get("/onboarding/session");
  return response.data.data;
};

export const saveBasicInfo = async (payload) => {
  const response = await api.put("/onboarding/basic-info", payload);
  return response.data.data;
};

export const saveAddressInfo = async (payload) => {
  const response = await api.put("/onboarding/address", payload);
  return response.data.data;
};

export const saveFinancialInfo = async (payload) => {
  const response = await api.put("/onboarding/financial", payload);
  return response.data.data;
};

export const saveKycInfo = async (payload) => {
  const response = await api.put("/onboarding/kyc", payload);
  return response.data.data;
};

export const saveLanguagePreference = async (payload) => {
  const response = await api.put("/onboarding/language", payload);
  return response.data.data;
};

export const completeOnboarding = async () => {
  const response = await api.post("/onboarding/complete");
  return response.data;
};
