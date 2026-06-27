"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 border border-border bg-card rounded-xs" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 border border-border bg-card text-foreground hover:bg-muted transition-colors rounded-xs focus:outline-none focus:ring-1 focus:ring-primary flex items-center justify-center cursor-pointer"
      title="Toggle dark/light mode"
    >
      {theme === "dark" ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-slate-700" />}
    </button>
  );
}
