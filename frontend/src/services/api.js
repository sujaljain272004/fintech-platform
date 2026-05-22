import axios from "axios";

const PHONE_AUTH_STORAGE_KEY = "finlink-phone-session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem(PHONE_AUTH_STORAGE_KEY);

  if (storedAuth) {
    try {
      const parsedAuth = JSON.parse(storedAuth);
      if (parsedAuth?.phoneNumber) {
        config.headers["x-user-phone"] = parsedAuth.phoneNumber;
      }
    } catch (error) {
      localStorage.removeItem(PHONE_AUTH_STORAGE_KEY);
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Request failed.";
    return Promise.reject(new Error(message));
  }
);

export default api;
