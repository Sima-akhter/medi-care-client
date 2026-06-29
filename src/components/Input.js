export default function Input({
  label,
  name,
  type = "text",
  placeholder = "",
  error = "",
  register = () => ({}),
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        suppressHydrationWarning
        className={`w-full bg-background border ${error ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'} rounded-xs px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-muted/30 ${className}`}
        {...register(name)}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-destructive mt-0.5">{error}</span>
      )}
    </div>
  );
}
