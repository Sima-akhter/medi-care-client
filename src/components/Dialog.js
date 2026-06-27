"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  className = ""
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative bg-card text-card-foreground border border-border rounded-xs shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto z-10 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-150 ${className}`}>
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
