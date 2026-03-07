"use client";

import { useRef } from "react";
import { FieldComponentProps } from "./field-registry";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function FileUploadField({ field, mode, value, onChange, error }: FieldComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = field.field_config.max_file_size;
  const allowedTypes = field.field_config.allowed_file_types;
  const maxFiles = field.field_config.max_files ?? 1;

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
    if (files) {
      onChange?.(Array.from(files));
    }
  }

  const selectedFiles = value as File[] | undefined;

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
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
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">
          {mode === "builder" ? "File upload area" : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {allowedTypes && allowedTypes.length > 0
            ? `Accepted: ${allowedTypes.join(", ")}`
            : "Any file type"}
          {maxFileSize && ` (max ${formatFileSize(maxFileSize)})`}
          {maxFiles > 1 && ` - Up to ${maxFiles} files`}
        </p>
      </div>
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
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="space-y-1">
          {selectedFiles.map((file, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {file.name} ({formatFileSize(file.size)})
            </p>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
