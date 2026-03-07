"use client";

import { FieldComponentProps } from "./field-registry";

export function ParagraphTextField({ field }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-foreground leading-relaxed">{field.label}</p>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}
