"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface LogoUploaderProps {
  currentUrl: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
  uploading?: boolean;
  bucket?: string;
  path?: string;
  size?: "sm" | "md";
}

export function LogoUploader({
  currentUrl,
  onUpload,
  onRemove,
  uploading: externalUploading,
  bucket = "form-assets",
  path = "logos",
  size = "md",
}: LogoUploaderProps) {
  const [internalUploading, setInternalUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploading = externalUploading ?? internalUploading;
  const sizeClasses = size === "sm" ? "w-16 h-16" : "w-20 h-20";

  const handleFileSelect = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 2 Mo.");
      return;
    }

    setInternalUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const randomName = Math.random().toString(36).substring(2, 10);
      const filePath = `${path}/${randomName}.${ext}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(`${urlData.publicUrl}?t=${Date.now()}`);
    } catch (error) {
      console.error("Failed to upload logo:", error);
    } finally {
      setInternalUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <div
          className={cn(
            sizeClasses,
            "rounded-xl border-2 border-dashed border-[hsl(var(--border))] flex items-center justify-center overflow-hidden transition-all",
            !currentUrl && "bg-[hsl(var(--muted))]",
            "group-hover:border-[hsl(var(--primary))]/50"
          )}
        >
          {currentUrl ? (
            <img
              src={currentUrl}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
          )}
        </div>

        {/* Upload overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Upload className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Remove button */}
        {currentUrl && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[hsl(var(--destructive))] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFileSelect(file);
          }}
        />
      </div>

      <div className="text-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-[hsl(var(--primary))]"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-3 w-3 mr-1" />
          {currentUrl ? "Changer" : "Ajouter un logo"}
        </Button>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
          PNG, JPG. Max 2 Mo.
        </p>
      </div>
    </div>
  );
}
