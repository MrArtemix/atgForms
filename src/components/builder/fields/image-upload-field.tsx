"use client";

import { useRef, useState, useEffect } from "react";
import { FieldComponentProps } from "./field-registry";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ImageUploadField({ field, mode, value, onChange, error }: FieldComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = field.field_config.max_file_size || 10485760; // 10MB default
  const allowedTypes = field.field_config.allowed_file_types || ["image/*"];
  const maxFiles = field.field_config.max_files ?? 1;

  const [previews, setPreviews] = useState<string[]>([]);
  
  // Create object URLs for previews when value changes
  useEffect(() => {
    if (value && Array.isArray(value) && value.length > 0) {
      if (value[0] instanceof File) {
        const objectUrls = (value as File[]).map(file => URL.createObjectURL(file));
        setPreviews(objectUrls);

        // Cleanup URLs
        return () => {
          objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
      } else if (typeof value[0] === 'string') {
        // Handle pre-uploaded URLs
        setPreviews(value as string[]);
      }
    } else {
      setPreviews([]);
    }
  }, [value]);

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleClick() {
    if (mode === "builder") return;
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (mode === "builder") return;
    const files = e.target.files;
    if (files && files.length > 0) {
      // Limit to maxFiles
      const selectedFiles = Array.from(files).slice(0, maxFiles);
      onChange?.(selectedFiles);
    }
  }

  function handleRemove(index: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (mode === "builder") return;
    
    if (value && Array.isArray(value)) {
      const newValues = [...value];
      newValues.splice(index, 1);
      onChange?.(newValues.length > 0 ? newValues : undefined);
    }
  }

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      
      {previews.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {previews.map((preview, i) => (
            <div key={i} className="relative group w-32 h-32 rounded-lg overflow-hidden border">
              <img src={preview} alt={`Upload preview ${i+1}`} className="w-full h-full object-cover" />
              {mode === "renderer" && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(i, e)}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          {mode === "renderer" && previews.length < maxFiles && (
            <div
              onClick={handleClick}
              className={cn(
                "w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors",
                error && "border-destructive"
              )}
            >
              <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add more</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            mode === "builder"
              ? "cursor-not-allowed opacity-70 border-muted-foreground/25"
              : "cursor-pointer hover:border-primary/50 hover:bg-accent/50 border-muted-foreground/25",
            error && "border-destructive"
          )}
        >
          <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            {mode === "builder" ? "Image upload area" : "Click to select an image or drag and drop"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {allowedTypes && allowedTypes.length > 0
              ? `Accepted: ${allowedTypes.join(", ")}`
              : "Images only"}
            {maxFileSize && ` (max ${formatFileSize(maxFileSize)})`}
            {maxFiles > 1 && ` - Up to ${maxFiles} images`}
          </p>
        </div>
      )}
      
      {mode === "renderer" && (
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={allowedTypes?.join(",")}
          multiple={maxFiles > 1}
          onChange={handleChange}
        />
      )}
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
