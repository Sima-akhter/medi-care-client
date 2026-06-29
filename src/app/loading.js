"use client";

import { Loader2, HeartPulse } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 space-y-4 select-none transition-colors duration-150">
      <div className="relative flex items-center justify-center">
        {/* Pulsing hospital logo backdrop */}
        <div className="absolute w-16 h-16 bg-primary/10 rounded-xs animate-ping duration-1000 opacity-75" />
        <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xs relative z-10">
          <HeartPulse size={28} className="animate-pulse" />
        </div>
      </div>
      
      <div className="flex flex-col items-center text-center space-y-1">
        <h2 className="text-sm font-bold text-foreground tracking-tight">MediCare Connect</h2>
        <div className="flex items-center gap-1.5 text-2xs text-muted-foreground font-semibold uppercase tracking-wider">
          <Loader2 size={13} className="animate-spin text-primary" />
          Loading Health Data Files
        </div>
      </div>
    </div>
  );
}
