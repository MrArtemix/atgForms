"use client";

import { FieldComponentProps } from "./field-registry";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function MultipleChoiceField({ field, mode, value, onChange, error }: FieldComponentProps) {
  const selectedValues = (value as string[]) || [];

  function handleToggle(optionValue: string) {
    if (mode === "builder") return;
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange?.(newValues);
  }

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-[hsl(var(--destructive))] ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{field.description}</p>
      )}
      <div className="space-y-2">
        {(field.options || []).map((option, index) => {
          const key = option.id || `opt-${index}`;
          return (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.id}-${key}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={() => handleToggle(option.value)}
                disabled={mode === "builder"}
              />
              <Label
                htmlFor={`${field.id}-${key}`}
                className="font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
      {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
    </div>
  );
}
