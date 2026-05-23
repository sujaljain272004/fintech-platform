import api from "./api";

export const requestEmailOtp = async (payload) => {
  const response = await api.post("/auth/request-otp", payload);
  return response.data;
};

export const loginWithEmailOtp = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const refreshAuthTokens = async (refreshToken) => {
  const response = await api.post("/auth/refresh", { refreshToken });
  return response.data.data;
};

export const getSession = async () => {
  const response = await api.get("/auth/session");
  return response.data.data;
};

export const getAuthStatus = async () => {
  const response = await api.get("/auth/status");
  return response.data;
};
