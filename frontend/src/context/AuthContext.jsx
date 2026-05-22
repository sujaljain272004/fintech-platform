import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAuthStatus, loginWithPhone } from "../services/authService";
import { getOnboardingSession } from "../services/onboardingService";

const AuthContext = createContext(null);
const PHONE_AUTH_STORAGE_KEY = "finlink-phone-session";
const LEGACY_DEMO_AUTH_STORAGE_KEY = "finlink-demo-auth";

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionMode, setSessionMode] = useState("guest");

  const hydrateSession = useCallback((sessionData) => {
    setProfile(sessionData.user);
    setWallet(sessionData.wallet);
    setUnreadNotifications(sessionData.unreadNotifications || 0);
    setOnboarding(null);
    setSessionMode("authenticated");
  }, []);

  const hydrateOnboarding = useCallback((onboardingData) => {
    setOnboarding(onboardingData);
    setProfile(null);
    setWallet(null);
    setUnreadNotifications(0);
    setSessionMode("onboarding");
  }, []);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem(PHONE_AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_DEMO_AUTH_STORAGE_KEY);
    setAuthUser(null);
    setProfile(null);
    setWallet(null);
    setOnboarding(null);
    setUnreadNotifications(0);
    setSessionMode("guest");
  }, []);

  const refreshSession = useCallback(async () => {
    const storedAuth = localStorage.getItem(PHONE_AUTH_STORAGE_KEY);

    if (!storedAuth) {
      clearAuthState();
      return null;
    }

    const authStatus = await getAuthStatus();
    if (authStatus.sessionState === "authenticated") {
      hydrateSession(authStatus.data);
      return authStatus.data;
    }
    hydrateOnboarding(authStatus.data);
    return authStatus.data;
  }, [clearAuthState, hydrateOnboarding, hydrateSession]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      localStorage.removeItem(LEGACY_DEMO_AUTH_STORAGE_KEY);
      const storedAuth = localStorage.getItem(PHONE_AUTH_STORAGE_KEY);

      if (!storedAuth) {
        setLoading(false);
        return;
      }

      try {
        const parsedAuth = JSON.parse(storedAuth);
        setAuthUser(parsedAuth);
        const authStatus = await getAuthStatus();
        if (authStatus.sessionState === "authenticated") {
          hydrateSession(authStatus.data);
        } else {
          hydrateOnboarding(authStatus.data);
        }
      } catch (error) {
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, [clearAuthState, hydrateSession]);

  const signInWithPhone = useCallback(
    async ({ phoneNumber, fullName, preferredLanguage }) => {
      setLoading(true);

      try {
        const authResponse = await loginWithPhone({
          phoneNumber,
          fullName,
          preferredLanguage,
        });
        const storedAuth = {
          phoneNumber,
          fullName: fullName || "",
        };

        localStorage.setItem(PHONE_AUTH_STORAGE_KEY, JSON.stringify(storedAuth));
        setAuthUser(storedAuth);
        if (authResponse.sessionState === "authenticated") {
          hydrateSession(authResponse.data);
        } else {
          hydrateOnboarding(authResponse.data);
        }
        return authResponse;
      } finally {
        setLoading(false);
      }
    },
    [hydrateOnboarding, hydrateSession]
  );

  const refreshOnboarding = useCallback(async () => {
    const sessionData = await getOnboardingSession();
    hydrateOnboarding(sessionData);
    return sessionData;
  }, [hydrateOnboarding]);

  const updateOnboarding = useCallback(
    (onboardingData) => {
      if (!onboardingData) {
        setOnboarding(null);
        return;
      }
      hydrateOnboarding(onboardingData);
    },
    [hydrateOnboarding]
  );

  const signOutUser = useCallback(() => {
    clearAuthState();
    window.location.replace("/login");
  }, [clearAuthState]);

  const value = useMemo(
    () => ({
      authUser,
      user: profile,
      wallet,
      onboarding,
      unreadNotifications,
      loading,
      sessionMode,
      isAuthenticated: sessionMode === "authenticated" && Boolean(authUser && profile && wallet),
      requiresOnboarding: sessionMode === "onboarding",
      signInWithPhone,
      signOutUser,
      refreshSession,
      refreshOnboarding,
      updateOnboarding,
      setUnreadNotifications,
    }),
    [
      authUser,
      loading,
      onboarding,
      profile,
      refreshOnboarding,
      refreshSession,
      signInWithPhone,
      signOutUser,
      sessionMode,
      unreadNotifications,
      updateOnboarding,
      wallet,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
