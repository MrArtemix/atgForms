"use client";

import { FieldComponentProps } from "./field-registry";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export function LongTextField({ field, mode, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-[hsl(var(--destructive))] ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{field.description}</p>
      )}
      <Textarea
        placeholder={field.placeholder || "Votre réponse..."}
        disabled={mode === "builder"}
        value={mode === "renderer" ? (value as string) || "" : ""}
        onChange={(e) => onChange?.(e.target.value)}
        rows={field.field_config.rows || 4}
        className={cn(error && "border-[hsl(var(--destructive))]")}
      />
      {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
    </div>
  );
}
