export default function Card({
  children,
  className = "",
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-card text-card-foreground border border-border rounded-xs shadow-xs p-6 ${onClick ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`flex flex-col gap-1.5 pb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-bold tracking-tight text-foreground ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={`flex items-center pt-4 border-t border-border mt-4 ${className}`}>{children}</div>;
}
