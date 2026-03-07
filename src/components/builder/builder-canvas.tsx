"use client";

import { useFormBuilderStore } from "@/stores/form-builder-store";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CanvasFieldWrapper } from "./canvas-field-wrapper";
import { cn } from "@/lib/utils/cn";
import { MousePointerClick } from "lucide-react";

export function BuilderCanvas() {
  const { fields, fieldOrder, currentPageId, pages } = useFormBuilderStore();
  const currentPage = pages.find((p) => p.id === currentPageId);
  const currentFieldIds = currentPageId ? fieldOrder[currentPageId] || [] : [];

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
    data: { pageId: currentPageId },
  });

  if (!currentPage) {
    return <div className="flex items-center justify-center h-64 text-[hsl(var(--muted-foreground))]">Aucune page sélectionnée</div>;
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
      <div className="mb-6 p-4 bg-card rounded-xl border border-[hsl(var(--border))]">
        <h2 className="text-lg font-semibold">{currentPage.title}</h2>
        {currentPage.description && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{currentPage.description}</p>}
      </div>
      
      <div
        ref={setNodeRef}
        className={cn(
          "space-y-3 min-h-[200px] rounded-xl transition-all duration-200 p-2",
          isOver && "bg-[hsl(var(--primary))]/5 ring-2 ring-[hsl(var(--primary))]/20 ring-dashed animate-pulse-soft"
        )}
      >
        <SortableContext items={currentFieldIds} strategy={verticalListSortingStrategy}>
          {currentFieldIds.map((fieldId, i) => {
            const field = fields[fieldId];
            if (!field) return null;
            return (
              <div key={fieldId} className={`animate-fade-in-up animate-stagger-${Math.min(i + 1, 6)}`}>
                <CanvasFieldWrapper field={field} />
              </div>
            );
          })}
        </SortableContext>
        {currentFieldIds.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-20 text-[hsl(var(--muted-foreground))] border-2 border-dashed border-[hsl(var(--border))] rounded-xl animate-fade-in-up">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10">
              <MousePointerClick className="h-8 w-8 text-[hsl(var(--primary))] animate-float" />
            </div>
            <p className="text-sm font-medium">Glissez les champs ici pour créer votre formulaire</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]/70 mt-1">Ou cliquez sur un type de champ dans la palette</p>
          </div>
        )}
      </div>
    </div>
  );
}
