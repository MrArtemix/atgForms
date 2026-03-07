"use client";

import { useFormBuilderStore } from "@/stores/form-builder-store";
import { FieldPalette } from "./field-palette";
import { BuilderCanvas } from "./builder-canvas";
import { PropertiesPanel } from "./properties-panel";
import { BuilderToolbar } from "./builder-toolbar";
import { PageNavigator } from "./page-navigator";
import { ErrorBoundary } from "@/components/common/error-boundary";

export function BuilderLayout() {
  const selectedFieldId = useFormBuilderStore((s) => s.selectedFieldId);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <BuilderToolbar />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden lg:block w-[280px] border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 overflow-y-auto custom-scrollbar transition-all duration-300">
            <FieldPalette />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <PageNavigator />
            <div className="flex-1 overflow-y-auto bg-[hsl(var(--muted))]/20 p-4 md:p-8 custom-scrollbar" onClick={() => useFormBuilderStore.getState().selectField(null)}>
              <ErrorBoundary>
                <BuilderCanvas />
              </ErrorBoundary>
            </div>
          </div>
          <div
            className={`hidden lg:block border-l border-[hsl(var(--border))] overflow-y-auto custom-scrollbar transition-all duration-300 ${
              selectedFieldId ? "w-[320px]" : "w-0"
            }`}
          >
            {selectedFieldId && (
              <ErrorBoundary>
                <PropertiesPanel />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
