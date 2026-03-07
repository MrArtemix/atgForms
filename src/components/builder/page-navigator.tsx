"use client";

import { useFormBuilderStore } from "@/stores/form-builder-store";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function PageNavigator() {
  const { pages, currentPageId, setCurrentPage, addPage, removePage } = useFormBuilderStore();

  if (pages.length <= 1 && pages.length > 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-background/50">
        <span className="text-sm font-medium">{pages[0]?.title}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addPage()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b bg-background/50 overflow-x-auto">
      {pages.map((page, index) => (
        <div
          key={page.id}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors shrink-0",
            currentPageId === page.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
          )}
          onClick={() => setCurrentPage(page.id)}
        >
          <span>{page.title || `Page ${index + 1}`}</span>
          {pages.length > 1 && (
            <button className="ml-1 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); removePage(page.id); }}>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => addPage()}>
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
