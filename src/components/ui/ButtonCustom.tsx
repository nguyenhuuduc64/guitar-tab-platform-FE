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
    "flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm cursor-pointer";

  const variants = {
    primary:
      "bg-[var(--button-color)] text-white hover:bg-[var(--button-color)]/80 shadow-blue-200",
    secondary:
      "bg-yellow-400 text-blue-900 hover:bg-yellow-300 shadow-yellow-100 text-white",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-gray-600 hover:bg-gray-100 shadow-none",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-200",
    orange: "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className} cursor-pointer`}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
      {name}
      {children}
    </button>
  );
};

export default ButtonCustom;
