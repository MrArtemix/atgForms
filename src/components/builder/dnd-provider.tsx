"use client";

import { ReactNode } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { FieldType } from "@/types/field-types";

export function DndProvider({ children }: { children: ReactNode }) {
  const { addField, reorderFields, currentPageId, fieldOrder } = useFormBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
