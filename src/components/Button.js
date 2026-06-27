import { Loader2 } from "lucide-react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary", // "primary" | "secondary" | "outline" | "danger" | "ghost"
  size = "md", // "sm" | "md" | "lg"
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-1 focus:ring-primary rounded-xs cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
    outline: "border border-border bg-background text-foreground hover:bg-muted active:scale-[0.98]",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]",
    ghost: "text-foreground hover:bg-muted active:scale-[0.98]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
