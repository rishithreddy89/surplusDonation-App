import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ss_theme";

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved === "dark";
    } catch (e) {
      // ignore
    }
    // default to prefers-color-scheme if available
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      try {
        localStorage.setItem(STORAGE_KEY, "dark");
      } catch {}
    } else {
      root.classList.remove("dark");
      try {
        localStorage.setItem(STORAGE_KEY, "light");
      } catch {}
    }
  }, [isDark]);

  // Keep system-change in sync
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    if (mq && mq.addEventListener) mq.addEventListener("change", handler);
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener("change", handler);
    };
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setIsDark((v) => !v)}
      title={isDark ? "Light mode" : "Dark mode"}
      className="!p-2"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
};

export default ThemeToggle;
