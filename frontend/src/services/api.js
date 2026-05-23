import axios from "axios";

const AUTH_STORAGE_KEY = "finlink-auth-session";
const LEGACY_PHONE_AUTH_STORAGE_KEY = "finlink-phone-session";
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const defaultBaseURL = import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:5000/api" : "/api");

const api = axios.create({
  baseURL: defaultBaseURL,
});

api.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (storedAuth) {
    try {
      const parsedAuth = JSON.parse(storedAuth);
      if (parsedAuth?.accessToken) {
        config.headers.Authorization = `Bearer ${parsedAuth.accessToken}`;
      } else if (parsedAuth?.onboardingToken) {
        config.headers.Authorization = `Bearer ${parsedAuth.onboardingToken}`;
      }
    } catch (error) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_PHONE_AUTH_STORAGE_KEY);
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
          if (parsedAuth?.refreshToken) {
            originalRequest._retry = true;
            const refreshResponse = await axios.post(`${defaultBaseURL}/auth/refresh`, {
              refreshToken: parsedAuth.refreshToken,
            });
            const nextTokens = refreshResponse.data.data;
            const nextAuth = { ...parsedAuth, ...nextTokens };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
            originalRequest.headers.Authorization = `Bearer ${nextTokens.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    }

    const message = error.response?.data?.message || error.message || "Request failed.";
    return Promise.reject(new Error(message));
  }
);

export default api;
