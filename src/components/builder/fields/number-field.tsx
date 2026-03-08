"use client";

import { FieldComponentProps } from "./field-registry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export function NumberField({ field, mode, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <Input
        type="number"
        placeholder={field.placeholder || "Entrer un nombre..."}
        disabled={mode === "builder"}
        value={mode === "renderer" ? (value as string) ?? "" : ""}
        onChange={(e) => onChange?.(e.target.value === "" ? "" : Number(e.target.value))}
        min={field.field_config.min}
        max={field.field_config.max}
        step={field.field_config.step}
        className={cn(error && "border-destructive")}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
