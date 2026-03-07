"use client";

import { FieldComponentProps } from "./field-registry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export function ShortTextField({ field, mode, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-[hsl(var(--destructive))] ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{field.description}</p>
      )}
      <Input
        placeholder={field.placeholder || "Votre réponse..."}
        disabled={mode === "builder"}
        value={mode === "renderer" ? (value as string) || "" : ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(error && "border-[hsl(var(--destructive))]")}
      />
      {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
    </div>
  );
}
