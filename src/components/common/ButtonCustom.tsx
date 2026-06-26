import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface ButtonProps {
  name?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "orange";
  icon?: IconDefinition;
  className?: string; // Để ông chủ có thể ghi đè CSS khi cần
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
}

const ButtonCustom = ({
  name,
  onClick,
  variant,
  icon,
  className = "",
  type = "button",
  children,
}: ButtonProps) => {
  const baseStyles =
    "flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-200 active:scale-95 shadow-sm cursor-pointer";

  const variants = {
    primary:
      "bg-[var(--button-color)] dark:bg-blue-600 text-white hover:bg-[var(--button-color)]/80 dark:hover:bg-blue-500 shadow-blue-200/50 dark:shadow-none",
    secondary:
      "bg-yellow-400 dark:bg-yellow-500 text-blue-900 dark:text-slate-900 hover:bg-yellow-300 dark:hover:bg-yellow-400 shadow-yellow-100/50 dark:shadow-none",
    outline:
      "border-2 border-blue-600 dark:border-slate-700 text-blue-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800/50",
    ghost:
      "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 shadow-none",
    danger:
      "bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-500 shadow-red-200/55 dark:shadow-none",
    orange:
      "bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-500 shadow-orange-200/55 dark:shadow-none",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variant ? variants[variant] : ""} ${className} cursor-pointer`}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
      {name}
      {children}
    </button>
  );
};

export default ButtonCustom;
