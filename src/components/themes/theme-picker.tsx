"use client";

import { useState, useEffect } from "react";
import { FormTheme } from "@/types/theme";
import { themeService } from "@/lib/services/theme-service";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ThemePickerProps {
  /** Thème actuellement appliqué au formulaire (pour afficher la sélection) */
  currentTheme?: FormTheme | null;
  onSelectTheme: (theme: FormTheme) => void;
}

export function ThemePicker({ currentTheme, onSelectTheme }: ThemePickerProps) {
  const [themes, setThemes] = useState<FormTheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await themeService.getSystemThemes();
      setThemes(data);
      setLoading(false);
    }
    void load();
  }, []);

  /** Un thème système est considéré sélectionné si le thème du formulaire a le même nom (après sauvegarde d'un preset) */
  const isSelected = (theme: FormTheme) =>
    Boolean(
      currentTheme &&
        currentTheme.name === theme.name &&
        currentTheme.primary_color === theme.primary_color
    );

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-[hsl(var(--muted))] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {themes.map((theme) => (
        <Card
          key={theme.id}
          className={cn(
            "cursor-pointer relative overflow-hidden transition-all duration-200 hover:border-[hsl(var(--primary))]/40",
            isSelected(theme)
              ? "ring-2 ring-[hsl(var(--primary))] border-[hsl(var(--primary))]"
              : ""
          )}
          onClick={() => onSelectTheme(theme)}
        >
          <div
            className="h-20 flex items-end p-3"
            style={{ backgroundColor: theme.background_color }}
          >
            <div
              className="w-full h-3 rounded-full"
              style={{ backgroundColor: theme.primary_color }}
            />
          </div>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{theme.name}</span>
              {isSelected(theme) && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))]">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex gap-1 mt-2">
              {[theme.primary_color, theme.background_color, theme.text_color, theme.accent_color].filter(Boolean).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border border-[hsl(var(--border))]"
                  style={{ backgroundColor: color! }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
