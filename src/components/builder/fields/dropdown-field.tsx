"use client";

import { FieldComponentProps } from "./field-registry";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

export function DropdownField({ field, mode, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <Select
        value={mode === "renderer" ? (value as string) || "" : ""}
        onValueChange={(v) => onChange?.(v)}
        disabled={mode === "builder"}
      >
        <SelectTrigger className={cn(error && "border-destructive")}>
          <SelectValue placeholder={field.placeholder || "Sélectionner une option..."} />
        </SelectTrigger>
        <SelectContent>
          {(field.options || []).map((option, index) => (
            <SelectItem key={option.id || `opt-${index}`} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
