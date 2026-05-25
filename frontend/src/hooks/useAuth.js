import { useEffect, useMemo, useState } from "react";

export default function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  useEffect(() => {
    const syncAuthState = () => {
      setToken(localStorage.getItem("token"));

      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("auth-updated", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("auth-updated", syncAuthState);
    };
  }, []);

  const isAdmin = useMemo(() => {
    return user?.role === "admin";
  }, [user]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-updated"));
  };

  return { token, user, isAdmin, logout };
}
