import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "No data found",
  description = "There are no records to display at the moment.",
  icon: Icon = Inbox,
  className = ""
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xs bg-card/20 ${className}`}>
      <div className="p-4 bg-muted/50 rounded-xs mb-3 text-muted-foreground">
        <Icon size={28} />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
