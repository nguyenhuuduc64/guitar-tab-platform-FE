import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-card-bg border border-border-subtle transition-all"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
