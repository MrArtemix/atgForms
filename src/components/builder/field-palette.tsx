"use client";

import { useState } from "react";
import { FIELD_CATEGORIES, getFieldsByCategory } from "@/lib/constants/field-types";
import { FieldTypeConfig, FieldCategory } from "@/types/field-types";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils/cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";
import * as LucideIcons from "lucide-react";

const Icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

function DraggableFieldType({ config }: { config: FieldTypeConfig }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${config.type}`,
    data: { type: config.type, fromPalette: true },
  });
  const IconComponent = Icons[config.icon] || LucideIcons.HelpCircle;

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          className={cn(
            "flex flex-col items-center gap-1.5 p-2.5 rounded-lg cursor-grab active:cursor-grabbing",
            "border border-transparent transition-all duration-200 text-center min-w-0",
            "hover:border-[hsl(var(--primary))]/30 hover:bg-[hsl(var(--primary))]/5 hover:shadow-sm hover:-translate-y-0.5",
            isDragging && "opacity-50 scale-95"
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--muted))] transition-colors group-hover:bg-[hsl(var(--primary))]/10">
            <IconComponent className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </div>
          <span className="text-[11px] leading-tight font-medium text-[hsl(var(--foreground))]/80 w-full truncate">
            {config.label}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[200px]">
        <p className="font-medium text-xs">{config.label}</p>
        <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function CategorySection({ category }: { category: { key: FieldCategory; label: string } }) {
  const [isOpen, setIsOpen] = useState(true);
  const fields = getFieldsByCategory(category.key);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2 px-1 hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <span>{category.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="grid grid-cols-3 gap-1">
          {fields.map((fieldConfig) => (
            <DraggableFieldType key={fieldConfig.type} config={fieldConfig} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FieldPalette() {
  return (
    <TooltipProvider>
      <ScrollArea className="h-full custom-scrollbar">
        <div className="p-3 space-y-4">
          <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider px-1">
            Champs disponibles
          </h3>
          {FIELD_CATEGORIES.map((category) => (
            <CategorySection key={category.key} category={category} />
          ))}
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
