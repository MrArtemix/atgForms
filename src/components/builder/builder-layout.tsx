"use client";

import { useState } from "react";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { FieldPalette } from "./field-palette";
import { BuilderCanvas } from "./builder-canvas";
import { PropertiesPanel } from "./properties-panel";
import { BuilderToolbar } from "./builder-toolbar";
import { PageNavigator } from "./page-navigator";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function BuilderLayout() {
  const selectedFieldId = useFormBuilderStore((s) => s.selectedFieldId);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <BuilderToolbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop: Palette sidebar */}
          <div className="hidden lg:block w-[280px] border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 overflow-y-auto custom-scrollbar transition-all duration-300">
            <FieldPalette />
          </div>

          {/* Main canvas area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <PageNavigator />
            <div
              className="flex-1 overflow-y-auto bg-dots bg-[hsl(var(--muted))]/20 p-4 md:p-8 custom-scrollbar"
              onClick={() => useFormBuilderStore.getState().selectField(null)}
            >
              <ErrorBoundary>
                <BuilderCanvas />
              </ErrorBoundary>
            </div>

            {/* Mobile: FAB to open palette */}
            <button
              onClick={() => setMobilePaletteOpen(!mobilePaletteOpen)}
              className={cn(
                "lg:hidden fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
                "bg-[hsl(var(--primary))] text-white hover:shadow-xl active-press animate-fab-pop",
                mobilePaletteOpen && "rotate-45"
              )}
              aria-label={mobilePaletteOpen ? "Fermer la palette" : "Ajouter un champ"}
            >
              {mobilePaletteOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </button>

            {/* Mobile: Palette overlay */}
            {mobilePaletteOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="lg:hidden fixed inset-0 z-40 bg-black/30 animate-fade-in"
                  onClick={() => setMobilePaletteOpen(false)}
                />
                {/* Palette panel */}
                <div className="lg:hidden fixed bottom-24 right-4 left-4 z-40 max-h-[60vh] overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl animate-slide-in-up custom-scrollbar">
                  <FieldPalette />
                </div>
              </>
            )}
          </div>

          {/* Desktop: Properties panel with slide animation */}
          <div
            className={cn(
              "hidden lg:block border-l border-[hsl(var(--border))] overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out",
              selectedFieldId ? "w-[320px] opacity-100" : "w-0 opacity-0"
            )}
          >
            {selectedFieldId && (
              <div className="animate-slide-in-right">
                <ErrorBoundary>
                  <PropertiesPanel />
                </ErrorBoundary>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
