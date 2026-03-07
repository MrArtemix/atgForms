"use client";

import { FieldComponentProps } from "./field-registry";
import { cn } from "@/lib/utils/cn";

export function SectionHeaderField({ field }: FieldComponentProps) {
  const headerSize = field.field_config.header_size ?? "h2";

  const headingClasses: Record<string, string> = {
    h2: "text-2xl font-bold",
    h3: "text-xl font-semibold",
    h4: "text-lg font-semibold",
  };

  return (
    <div className="space-y-1">
      {headerSize === "h2" && (
        <h2 className={cn(headingClasses.h2)}>{field.label}</h2>
      )}
      {headerSize === "h3" && (
        <h3 className={cn(headingClasses.h3)}>{field.label}</h3>
      )}
      {headerSize === "h4" && (
        <h4 className={cn(headingClasses.h4)}>{field.label}</h4>
      )}
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}
