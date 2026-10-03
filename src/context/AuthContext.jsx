import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import LoadingScreen from "../components/common/LoadingScreen";
import {
  getCurrentUser,
  logoutUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken")
  );
  const [loading, setLoading] = useState(true);

  const login = useCallback((userData, token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
      setAccessToken(token);
    }

    setUser(userData);
  }, []);

  const demoLogin = useCallback((role) => {
    const demoUsers = {
      merchant: {
        id: "demo-merchant",
        name: "Demo Merchant",
        email: "merchant@demo.com",
        role: "merchant",
      },
      supplier: {
        id: "demo-supplier",
        name: "Demo Supplier",
        email: "supplier@demo.com",
        role: "supplier",
      },
      admin: {
        id: "demo-admin",
        name: "Demo Admin",
        email: "admin@demo.com",
        role: "admin",
      },
    };

    const demoUser = demoUsers[role];

    if (!demoUser) {
      throw new Error("Invalid demo role");
    }

    const demoToken = `demo-token-${role}`;

    localStorage.setItem("accessToken", demoToken);
    setAccessToken(demoToken);
    setUser(demoUser);

    return demoUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Continue with local logout even if the API request fails.
    } finally {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const hasRole = useCallback(
    (roles) => {
      if (!user?.role) return false;

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      return allowedRoles.some(
        (role) =>
          String(role).toLowerCase() ===
          String(user.role).toLowerCase()
      );
    },
    [user]
  );

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      if (!accessToken) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      // Demo sessions should not call the real backend.
      if (accessToken.startsWith("demo-token-")) {
        const role = accessToken.replace("demo-token-", "");

        const demoUsers = {
          merchant: {
            id: "demo-merchant",
            name: "Demo Merchant",
            email: "merchant@demo.com",
            role: "merchant",
          },
          supplier: {
            id: "demo-supplier",
            name: "Demo Supplier",
            email: "supplier@demo.com",
            role: "supplier",
          },
          admin: {
            id: "demo-admin",
            name: "Demo Admin",
            email: "admin@demo.com",
            role: "admin",
          },
        };

        if (mounted) {
          setUser(demoUsers[role] || null);
          setLoading(false);
        }

        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        if (mounted) {
          localStorage.removeItem("accessToken");
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      isAuthenticated: Boolean(user && accessToken),
      login,
      demoLogin,
      logout,
      hasRole,
    }),
    [
      user,
      accessToken,
      loading,
      login,
      demoLogin,
      logout,
      hasRole,
    ]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}

export default AuthContext;