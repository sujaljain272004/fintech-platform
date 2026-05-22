import api from "./api";

export const loginWithPhone = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const getSession = async () => {
  const response = await api.get("/auth/session");
  return response.data.data;
};

export const getAuthStatus = async () => {
  const response = await api.get("/auth/status");
  return response.data;
};
