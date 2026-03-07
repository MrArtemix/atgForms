"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormField } from "@/types/field-types";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { FieldRegistry } from "./fields/field-registry";
import { cn } from "@/lib/utils/cn";
import { GripVertical, Copy, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasFieldWrapperProps {
  field: FormField;
}

export function CanvasFieldWrapper({ field }: CanvasFieldWrapperProps) {
  const { selectedFieldId, selectField, duplicateField, removeField } = useFormBuilderStore();
  const isSelected = selectedFieldId === field.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { type: "canvas-field", field },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const FieldComponent = FieldRegistry[field.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border bg-[hsl(var(--card))] p-4 transition-all duration-200",
        isSelected
          ? "ring-2 ring-[hsl(var(--primary))] border-[hsl(var(--primary))] shadow-md shadow-[hsl(var(--primary))]/10"
          : "hover:border-[hsl(var(--primary))]/30 hover:shadow-sm",
        isDragging && "opacity-50 shadow-lg scale-[1.02]"
      )}
      onClick={(e) => { e.stopPropagation(); selectField(field.id); }}
    >
      <div {...attributes} {...listeners} className="absolute -left-0 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-[hsl(var(--muted))]">
        <GripVertical className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
      </div>
      <div className="absolute -right-1 top-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-0.5">
        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-[hsl(var(--primary))]/10 hover:text-[hsl(var(--primary))] transition-colors" onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 transition-colors" onClick={(e) => { e.stopPropagation(); removeField(field.id); }}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {field.required && <span className="absolute top-2 right-14 text-xs text-[hsl(var(--destructive))] font-medium">Required</span>}
      {field.conditional_logic && (
        <span className="absolute top-2 right-28 text-xs text-amber-600 font-medium flex items-center gap-1">
          <Zap className="h-3 w-3" />Logic
        </span>
      )}
      <div className="pointer-events-none">
        {FieldComponent ? <FieldComponent field={field} mode="builder" /> : <div className="text-[hsl(var(--muted-foreground))] text-sm">Unknown: {field.type}</div>}
      </div>
    </div>
  );
}
