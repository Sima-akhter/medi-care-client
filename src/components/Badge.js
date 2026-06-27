export default function Badge({
  children,
  variant = "primary", // "primary" | "secondary" | "outline" | "success" | "warning" | "danger" | "info"
  className = "",
  ...props
}) {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider rounded-xs border select-none transition-colors";
  
  const variants = {
    primary: "bg-primary/10 border-primary/20 text-primary",
    secondary: "bg-secondary border-border text-secondary-foreground",
    outline: "border-border text-foreground bg-transparent",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    danger: "bg-destructive/10 border-destructive/20 text-destructive",
    info: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400"
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
