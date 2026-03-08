"use client";

import { ReactNode, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { FieldType } from "@/types/field-types";
import { FIELD_TYPE_CONFIGS } from "@/lib/constants/field-types";
import * as LucideIcons from "lucide-react";

const Icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

export function DndProvider({ children }: { children: ReactNode }) {
  const { addField, reorderFields, currentPageId, fieldOrder, fields } = useFormBuilderStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<Record<string, unknown> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
    setActiveDragData((event.active.data.current as Record<string, unknown>) || null);
  }

  function handleDragCancel() {
    setActiveId(null);
    setActiveDragData(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);
    setActiveDragData(null);

    if (!over || !currentPageId) return;

    const activeData = active.data.current;

    // Dropping from palette
    if (activeData?.fromPalette) {
      const fieldType = activeData.type as FieldType;
      const overIndex = fieldOrder[currentPageId]?.indexOf(over.id as string) ?? -1;
      addField(fieldType, currentPageId, overIndex >= 0 ? overIndex : undefined);
      return;
    }

    // Reordering within canvas
    if (active.id !== over.id) {
      const oldOrder = fieldOrder[currentPageId] || [];
      const oldIndex = oldOrder.indexOf(active.id as string);
      const newIndex = oldOrder.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...oldOrder];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, active.id as string);
        reorderFields(currentPageId, newOrder);
      }
    }
  }

  // Build overlay content
  function renderOverlay() {
    if (!activeId || !activeDragData) return null;

    let iconName: string;
    let label: string;

    if (activeDragData.fromPalette) {
      const type = activeDragData.type as FieldType;
      const config = FIELD_TYPE_CONFIGS[type];
      iconName = config.icon;
      label = config.label;
    } else {
      const field = fields[activeId];
      if (!field) return null;
      const config = FIELD_TYPE_CONFIGS[field.type];
      iconName = config.icon;
      label = field.label || config.label;
    }

    const IconComponent = Icons[iconName] || LucideIcons.HelpCircle;

    return (
      <div className="flex items-center gap-2 px-3 py-2 max-w-[220px] rounded-lg border-2 border-[hsl(var(--primary))] bg-[hsl(var(--card))] shadow-lg shadow-[hsl(var(--primary))]/20 pointer-events-none">
        <IconComponent className="h-4 w-4 text-[hsl(var(--primary))] shrink-0" />
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {renderOverlay()}
      </DragOverlay>
    </DndContext>
  );
}
