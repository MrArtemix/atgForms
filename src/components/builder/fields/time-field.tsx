"use client";

import { FieldComponentProps } from "./field-registry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function TimeField({ field, mode, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="time"
          placeholder={field.placeholder || "Select a time"}
          disabled={mode === "builder"}
          value={mode === "renderer" ? (value as string) || "" : ""}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn("pl-10", error && "border-destructive")}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
