import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AdminThemeCtx {
  dark: boolean;
  toggle: () => void;
}

const AdminThemeContext = createContext<AdminThemeCtx>({ dark: true, toggle: () => {} });

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("adminTheme");
    if (!stored) {
      localStorage.setItem("adminTheme", "dark");
      return true;
    }
    return stored !== "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);

  const toggle = () => {
    setDark((d) => {
      localStorage.setItem("adminTheme", d ? "light" : "dark");
      return !d;
    });
  };

  return (
    <AdminThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export const useAdminTheme = () => useContext(AdminThemeContext);
