// contexts/AuthContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

const PUBLISHABLE_KEY =
  "pk_65a5797d46e2f415f0c415d2455096e6b2204dc052e4c7803a5bda0083cb69d4";

// Use environment variable for Medusa backend URL
const MEDUSA_BACKEND_URL =
  import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000";
const MEDUSA_PUBLISHABLE_KEY =
  import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || PUBLISHABLE_KEY;

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  //Auth modal control (new unified API)
  authModalOpen: boolean;
  authModalMode: "login" | "signup";
  authReason: string | null;
  openAuthModal: (mode?: "login" | "signup", reason?: string | null) => void;
  closeAuthModal: () => void;

  // Legacy aliases (for backward compatibility)
  showAuthModal: boolean;
  authMode: "login" | "signup";
  setShowAuthModal: (show: boolean) => void;
  setAuthMode: (mode: "login" | "signup") => void;
  promptAuth: (mode?: "login" | "signup", redirectUrl?: string | null) => void;

  // Post‑login redirect
  postLoginRedirect: string | null;
  setPostLoginRedirect: (url: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ------------------- User state -------------------
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  // ------------------- Modal state (new) -------------------
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">(
    "login",
  );
  const [authReason, setAuthReason] = useState<string | null>(null);

  // ------------------- Redirect after login -------------------
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(
    null,
  );

  // ------------------- Medusa helpers -------------------
  const medusaFetch = (endpoint: String, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");
    headers.set("x-publishable-api-key", MEDUSA_PUBLISHABLE_KEY);

    const url = `${MEDUSA_BACKEND_URL}${endpoint}`;
    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  // Helper to set auth token
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem("medusa_auth_token", token);
    } else {
      localStorage.removeItem("medusa_auth_token");
    }
  };

  const fetchCurrentCustomer = async (token: string) => {
    try {
      const response = await medusaFetch("/store/customers/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const customer = data.customer;
        // Medusa returns first_name, last_name – combine into a name
        const fullName =
          `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
        setUser({
          id: customer.id,
          name: fullName || customer.email,
          email: customer.email,
          createdAt: customer.created_at,
        });
      } else {
        // Token invalid
        localStorage.removeItem("medusa_auth_token");
      }
    } catch (error) {
      console.error("Failed to fetch customer", error);
    }
  };

  // ------------------- Authentication methods -------------------
  // Medusa signup (register customer)
  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    // 1. Get registration token
    const tokenResponse = await medusaFetch(
      "/auth/customer/emailpass/register",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error("Registration token error:", tokenData);
      throw new Error(
        tokenData.message || "Failed to obtain registration token",
      );
    }

    const registrationToken = tokenData.token;

    // 2. Create customer
    // Split name into first and last (simple version)
    const nameParts = name.trim().split(" ");
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    const response = await medusaFetch("/store/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${registrationToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        // password,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Signup error:", data);
      throw new Error(data.message || "Signup failed");
    }

    // Automatically login after signup
    // await login(email, password);

    // Do NOT auto‑login – user must call login separately
    return {
      success: true,
      message: "Account created successfully! Please log in.",
    };
  };

  // Medusa login (get token)
  const login = async (email: string, password: string) => {
    const response = await medusaFetch("/auth/customer/emailpass", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Medusa 2.x returns { token: "..." } instead of access_token
    const token = data.token;
    if (token) {
      setAuthToken(token);

      // Fetch the full customer object using the token
      const customerResponse = await medusaFetch("/store/customers/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const customerData = await customerResponse.json();

      if (!customerResponse.ok) {
        throw new Error(customerData.message || "Failed to fetch customer");
      }

      // Fetch customer details using the token
      const customer = customerData;
      const fullName =
        `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
      setUser({
        id: customer.id,
        name: fullName || customer.email,
        email: customer.email,
        createdAt: customer.created_at,
      });

      // ⚠️ Do NOT close modal or navigate here. Let the component do that.
    } else {
      throw new Error("No token received from server");
    }
  };

  const logout = () => {
    localStorage.removeItem("medusa_auth_token");
    setUser(null);
  };

  // ------------------- Modal control (new API) -------------------
  const openAuthModal = (
    mode: "login" | "signup" = "login",
    reason?: string,
  ) => {
    setAuthModalMode(mode);
    setAuthReason(reason ?? null);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthReason(null);
    setPostLoginRedirect(null);
  };

  // ------------------- Legacy compatibility -------------------
  const promptAuth = (
    mode: "login" | "signup" = "login",
    redirectUrl: string | null,
  ) => {
    openAuthModal(mode);
    if (redirectUrl) setPostLoginRedirect(redirectUrl);
  };

  // Legacy state getters/setters (they just read/write the new ones)
  const showAuthModal = authModalOpen;
  const authMode = authModalMode;
  const setShowAuthModal = (show: boolean) => {
    if (show) setAuthModalOpen(true);
    else closeAuthModal();
  };
  const setAuthMode = (mode: "login" | "signup") => setAuthModalMode(mode);

  // ------------------- On mount: check token -------------------
  // On mount, check if we have a token and fetch customer
  useEffect(() => {
    const token = localStorage.getItem("medusa_auth_token");
    if (token) {
      fetchCurrentCustomer(token);
    }
  }, []);

  // ------------------- Context value -------------------
  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    authModalOpen,
    authModalMode,
    authReason,
    openAuthModal,
    closeAuthModal,
    showAuthModal,
    authMode,
    setShowAuthModal,
    setAuthMode,
    promptAuth,
    postLoginRedirect,
    setPostLoginRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
