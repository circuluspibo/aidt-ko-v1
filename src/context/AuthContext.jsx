/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
// src/context/AuthContext.jsx
import { useLocalStorage } from "@/hook/useLocalStorage";
import { createContext, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children, user: userData }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const [token, setToken] = useLocalStorage("token", null);
  const navigate = useNavigate();
  // const { setData } = useNav();

  const login = async ({ token: t, ...data }) => {
    setUser({ ...data });
    setToken(t);
    const { role } = data;
    if (role === "student") {
      navigate("/learn");
    } else {
      navigate("/manage");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    navigate("/", { replace: true });
  };

  const getRole = () => user?.role || null;
  const getId = () => user?._id || null;
  const getUserId = () => user?.userId || null;
  const getName = () => user?.name || null;

  useEffect(() => {
    if (userData) {
      const { token: newToken, ...rest } = userData;
      if (newToken) setToken(newToken);
      setUser(rest);
    } else {
      setUser(null);
      setToken("");
      if (user) {
        window.location.reload();
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [userData]);

  // useEffect(() => {
  //   setData(user);
  // }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      getRole,
      getId,
      getName,
      getUserId,
    }),
    [user, token]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
