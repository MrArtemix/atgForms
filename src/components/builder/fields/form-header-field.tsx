"use client";

import { FieldComponentProps } from "./field-registry";
import { cn } from "@/lib/utils/cn";
import { LayoutPanelTop, Image, Palette } from "lucide-react";

const HEIGHT_CLASSES = {
  medium: "h-36 sm:h-48",
  large: "h-48 sm:h-56 md:h-64",
  hero: "h-64 sm:h-72 md:h-80",
};

const PATTERN_CLASSES: Record<string, string> = {
  dots: "bg-dots",
  grid: "bg-grid",
  lines: "bg-grid",
  waves: "bg-grid",
  mesh: "bg-dots",
  diagonal: "bg-dots",
};

export function FormHeaderField({ field, mode }: FieldComponentProps) {
  const cfg = field.field_config;
  const style = cfg?.header_style ?? "default";
  const height = cfg?.header_height ?? "large";
  const imageUrl = cfg?.header_image_url?.trim();
  const pattern = cfg?.header_pattern ?? "dots";
  const hasImage = style === "image" && imageUrl;

  if (mode === "renderer") {
    return null;
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 text-xs font-medium text-[hsl(var(--muted-foreground))]">
        <LayoutPanelTop className="h-3.5 w-3.5" />
        En-tête du formulaire
      </div>
      <div className="flex flex-col w-full">
        {/* Top Image/Pattern Area */}
        <div
          className={cn(
            "relative w-full overflow-hidden shrink-0",
            HEIGHT_CLASSES[height as keyof typeof HEIGHT_CLASSES] ?? HEIGHT_CLASSES.large
          )}
        >
          {hasImage ? (
            <div className="absolute inset-0 bg-[hsl(var(--muted))]">
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.2)] via-[hsl(var(--primary)/0.08)] to-[hsl(var(--primary)/0.15)]">
              {(style === "pattern" || style === "default") && (
                <div
                  className={cn(
                    "absolute inset-0 opacity-40",
                    PATTERN_CLASSES[pattern] ?? PATTERN_CLASSES.dots
                  )}
                />
              )}
              <div className="pointer-events-none absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-[hsl(var(--primary)/0.25)] blur-2xl" />
            </div>
          )}
        </div>

        {/* Bottom Text Area */}
        <div className="bg-[#162447] text-white p-4">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight line-clamp-2">
            {field.label || "Titre du formulaire"}
          </h2>
          {field.description && (
            <p className="text-sm mt-1 line-clamp-2 text-white/90">
              {field.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 px-3 py-2 text-[10px] text-[hsl(var(--muted-foreground))]">
        {hasImage ? (
          <span className="flex items-center gap-1">
            <Image className="h-3 w-3" /> Image de fond
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            {style === "pattern" ? `Motif: ${pattern}` : "Dégradé"}
          </span>
        )}
        <span>Hauteur: {height}</span>
      </div>
    </div>
  );
}
