import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeCtx {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ dark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("appTheme");
    if (!stored) {
      localStorage.setItem("appTheme", "dark");
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
      localStorage.setItem("appTheme", d ? "light" : "dark");
      return !d;
    });
  };
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
