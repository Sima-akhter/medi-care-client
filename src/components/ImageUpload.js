"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import toast from "react-hot-toast";

export default function ImageUpload({
  label,
  value,
  onChange,
  disabled = false,
  error = "",
  className = ""
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;

    // Validate type and size (max 5MB)
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, JPEG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setIsUploading(true);
    
    try {
      // 1. Read file as base64 string
      const reader = new FileReader();
      
      const uploadPromise = new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Data = reader.result;
            // 2. Send base64 to server API
            const res = await apiRequest("/uploads/image", {
              method: "POST",
              body: JSON.stringify({ image: base64Data }),
            });
            if (res.success && res.url) {
              resolve(res.url);
            } else {
              reject(new Error(res.message || "Failed to upload."));
            }
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("File reading failed."));
        reader.readAsDataURL(file);
      });

      const url = await uploadPromise;
      onChange(url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Unable to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      )}

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled && !isUploading ? triggerFileInput : undefined}
        className={`w-full min-h-[120px] bg-background border border-dashed rounded-xs p-4 flex flex-col items-center justify-center gap-2 transition-all select-none relative ${
          disabled ? "opacity-50 cursor-not-allowed bg-muted/20" : "cursor-pointer"
        } ${
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        } ${error ? "border-destructive" : ""}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <Loader2 className="animate-spin text-primary" size={20} />
            <span>Uploading Photo...</span>
          </div>
        ) : value ? (
          <div className="relative w-full flex items-center justify-center p-2">
            <img
              src={value}
              alt="Uploaded Preview"
              className="max-h-24 object-cover rounded-xs border border-border"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-0 right-0 p-1 bg-destructive hover:bg-destructive/95 text-destructive-foreground rounded-xs shadow-xs transition-colors cursor-pointer"
                title="Remove Photo"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-1 text-muted-foreground">
            <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xs mb-1">
              <Upload size={16} />
            </div>
            <p className="text-xs font-bold text-foreground">Click to upload photo</p>
            <p className="text-3xs leading-none">JPEG or PNG (Max 5MB)</p>
          </div>
        )}
      </div>

      {error && <span className="text-xs font-medium text-destructive mt-0.5">{error}</span>}
    </div>
  );
}
