"use client";

import { FieldComponentProps } from "./field-registry";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export function LinearScaleField({ field, mode, value, onChange, error }: FieldComponentProps) {
  const scaleMin = field.field_config.scale_min ?? 1;
  const scaleMax = field.field_config.scale_max ?? 5;
  const scaleMinLabel = field.field_config.scale_min_label;
  const scaleMaxLabel = field.field_config.scale_max_label;

  const scaleValues: number[] = [];
  for (let i = scaleMin; i <= scaleMax; i++) {
    scaleValues.push(i);
  }

  function handleSelect(num: number) {
    if (mode === "builder") return;
    onChange?.(num);
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
      <div className="flex items-center gap-2">
        {scaleMinLabel && (
          <span className="text-sm text-muted-foreground shrink-0">{scaleMinLabel}</span>
        )}
        <div className="flex gap-1 flex-1 justify-center">
          {scaleValues.map((num) => (
            <button
              key={num}
              type="button"
              disabled={mode === "builder"}
              onClick={() => handleSelect(num)}
              className={cn(
                "h-10 w-10 rounded-md border text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "disabled:cursor-not-allowed disabled:opacity-70",
                value === num
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-input"
              )}
            >
              {num}
            </button>
          ))}
        </div>
        {scaleMaxLabel && (
          <span className="text-sm text-muted-foreground shrink-0">{scaleMaxLabel}</span>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
