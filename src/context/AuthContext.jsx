/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
// src/context/AuthContext.jsx
import { useLocalStorage } from "@/hook/useLocalStorage";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children, user: userData }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const [token, setToken] = useLocalStorage("token", null);
  const navigate = useNavigate();
  const isInitialized = useRef(false);
  // const { setData } = useNav();

  const login = async ({ token: t, ...data }) => {
    console.log("로그인 처리:", {
      role: data.role,
      characterId: data.characterId,
    });
    setUser({ ...data });
    setToken(t);
    isInitialized.current = true; // 로그인 시 초기화 플래그 설정
    const { role } = data;
    if (role === "student") {
      const targetPath = `/learn/${data.characterId}`;
      console.log("학생 로그인 리다이렉트:", targetPath);
      navigate(targetPath);
    } else {
      console.log("교사 로그인 리다이렉트: /manage");
      navigate("/manage");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    isInitialized.current = false; // 로그아웃 시 초기화 플래그 리셋
    navigate("/", { replace: true });
  };

  const getRole = () => user?.role || null;
  const getId = () => user?._id || null;
  const getUserId = () => user?.userId || null;
  const getName = () => user?.name || null;

  useEffect(() => {
    // userData가 없거나 이미 초기화된 경우 무시
    if (!userData || isInitialized.current) {
      return;
    }

    const { token: newToken, ...rest } = userData;

    // userData가 유효한 경우 localStorage에 저장
    if (newToken && rest.role) {
      console.log("사용자 데이터 초기화:", {
        role: rest.role,
        characterId: rest.characterId,
      });
      setToken(newToken);
      setUser(rest);
      isInitialized.current = true;

      // 현재 경로가 로그인 페이지나 홈페이지인 경우 역할에 맞는 페이지로 리다이렉트
      const currentPath = window.location.pathname;
      if (
        ["/", "/login", "/login/student", "/login/teacher"].includes(
          currentPath
        )
      ) {
        const targetPath =
          rest.role === "student" ? `/learn/${rest.characterId}` : "/manage";
        console.log("리다이렉트:", { from: currentPath, to: targetPath });
        navigate(targetPath, { replace: true });
      }
    }
  }, [userData, navigate, setToken, setUser]);

  useEffect(() => {
    // userData가 null이고 현재 사용자가 로그인된 상태인 경우 로그아웃 처리
    // 단, 이미 초기화된 경우에는 처리하지 않음
    // 또한 로그인 직후에는 처리하지 않음 (userData가 일시적으로 null이 될 수 있음)
    if (!userData && user && !isInitialized.current) {
      console.log("로그아웃 처리:", {
        userData,
        user,
        isInitialized: isInitialized.current,
      });

      // 로그인 직후인지 확인 (localStorage에 유효한 토큰이 있는지)
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        console.log("토큰이 존재하므로 로그아웃 처리하지 않음");
        return;
      }

      setUser(null);
      setToken(null);
      const currentPath = window.location.pathname;
      if (currentPath !== "/" && currentPath !== "/login") {
        navigate("/", { replace: true });
      }
    }
  }, [userData, user, navigate, setUser, setToken]);

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
