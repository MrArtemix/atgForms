"use client";

import { useState } from "react";
import { FIELD_CATEGORIES, getFieldsByCategory } from "@/lib/constants/field-types";
import { FieldTypeConfig, FieldCategory } from "@/types/field-types";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils/cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import * as LucideIcons from "lucide-react";

function DraggableFieldType({ config }: { config: FieldTypeConfig }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${config.type}`,
    data: { type: config.type, fromPalette: true },
  });
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[config.icon] || LucideIcons.HelpCircle;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing",
        "border border-transparent transition-all duration-200 text-sm",
        "hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]/50 hover:shadow-sm hover:-translate-y-0.5",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <IconComponent className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0" />
      <span>{config.label}</span>
    </div>
  );
}

function CategorySection({ category }: { category: { key: FieldCategory; label: string } }) {
  const [isOpen, setIsOpen] = useState(true);
  const fields = getFieldsByCategory(category.key);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 hover:text-[hsl(var(--foreground))] transition-colors"
      >
        {category.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
      </button>
      <div
        className={cn(
          "space-y-0.5 overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {fields.map((fieldConfig) => (
          <DraggableFieldType key={fieldConfig.type} config={fieldConfig} />
        ))}
      </div>
    </div>
  );
}

export function FieldPalette() {
  return (
    <ScrollArea className="h-full custom-scrollbar">
      <div className="p-4 space-y-5">
        <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Add Fields</h3>
        {FIELD_CATEGORIES.map((category) => (
          <CategorySection key={category.key} category={category} />
        ))}
      </div>
    </ScrollArea>
  );
}
