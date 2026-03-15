"use client";

import { FieldComponentProps } from "./field-registry";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function SingleChoiceField({ field, mode, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-[hsl(var(--destructive))] ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{field.description}</p>
      )}
      <RadioGroup
        value={mode === "renderer" ? (value as string) || "" : ""}
        onValueChange={(v) => onChange?.(v)}
        disabled={mode === "builder"}
        className="space-y-2"
      >
        {(field.options || []).map((option, index) => {
          const key = option.id || `opt-${index}`;
          return (
            <div key={key} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${field.id}-${key}`} />
              <Label htmlFor={`${field.id}-${key}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
    </div>
  );
}
