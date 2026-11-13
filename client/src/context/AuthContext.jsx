/** Authentication UI integration owner: AHSAS ZAIDI with API support by NIHAL AHMED. */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("campusconnect_user") || "null"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("campusconnect_token")));

  useEffect(() => {
    if (!localStorage.getItem("campusconnect_token")) return;
    api("/auth/me").then(({ user }) => setUser(user)).catch(() => logout()).finally(() => setLoading(false));
  }, []);

  function storeSession(data) {
    localStorage.setItem("campusconnect_token", data.token);
    localStorage.setItem("campusconnect_user", JSON.stringify(data.user));
    setUser(data.user);
  }
  async function login(email, password) { const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); storeSession(data); }
  async function register(name, email, password) { const data = await api("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }); storeSession(data); }
  function logout() { localStorage.removeItem("campusconnect_token"); localStorage.removeItem("campusconnect_user"); setUser(null); setLoading(false); }
  const value = useMemo(() => ({ user, setUser, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
