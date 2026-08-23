import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type ThemeValue = {
  isDark: boolean;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Arranca leyendo la clase que ya puso el script de index.html
  const [isDark, setIsDark] = useState<boolean>(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggle = () => setIsDark((d) => !d);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Tira error si se usa fuera del Provider (patrón de la materia)
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return ctx;
}
