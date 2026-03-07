"use client";

import { FormTheme } from "@/types/theme";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import { Check, Palette } from "lucide-react";
import { useState } from "react";

interface ThemeCustomizerProps {
  theme: Partial<FormTheme>;
  onChange: (updates: Partial<FormTheme>) => void;
}

const FONT_OPTIONS = [
  "Inter, system-ui, sans-serif",
  "Georgia, serif",
  "Merriweather, serif",
  "Roboto, sans-serif",
  "Open Sans, sans-serif",
  "Lato, sans-serif",
  "Poppins, sans-serif",
  "Montserrat, sans-serif",
  "system-ui, sans-serif",
];

const PRESET_COLORS = [
  "#162447", // Brobroli Dark Blue
  "#F05E09", // Brobroli Orange
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
  "#1F2937", // Dark
  "#FFFFFF", // White
];

const ACCENT_PRESETS = [
  { name: "Brobroli", colors: ["#162447", "#F05E09", "#152346"] },
  { name: "Ocean", colors: ["#0EA5E9", "#0284C7", "#0369A1"] },
  { name: "Sunset", colors: ["#F97316", "#EA580C", "#C2410C"] },
  { name: "Forest", colors: ["#22C55E", "#16A34A", "#15803D"] },
  { name: "Lavender", colors: ["#A78BFA", "#8B5CF6", "#7C3AED"] },
  { name: "Rose", colors: ["#FB7185", "#F43F5E", "#E11D48"] },
  { name: "Slate", colors: ["#64748B", "#475569", "#334155"] },
];

export function ThemeCustomizer({ theme, onChange }: ThemeCustomizerProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {/* Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Couleurs
          </h3>
          <ColorPickerInput
            label="Couleur principale"
            value={theme.primary_color || "#3B82F6"}
            onChange={(v) => onChange({ primary_color: v })}
          />
          <ColorPickerInput
            label="Couleur d'arrière-plan"
            value={theme.background_color || "#FFFFFF"}
            onChange={(v) => onChange({ background_color: v })}
          />
          <ColorPickerInput
            label="Couleur du texte"
            value={theme.text_color || "#1F2937"}
            onChange={(v) => onChange({ text_color: v })}
          />
          <ColorPickerInput
            label="Couleur d'accent"
            value={theme.accent_color || "#8B5CF6"}
            onChange={(v) => onChange({ accent_color: v })}
          />
        </div>

        <Separator />

        {/* Typography */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Typographie</h3>
          <div className="space-y-2">
            <Label className="text-xs">Police</Label>
            <Select
              value={theme.font_family || FONT_OPTIONS[0]}
              onValueChange={(v) => onChange({ font_family: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font.split(",")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Taille de police: {theme.font_size_base || 16}px</Label>
            <Slider
              value={[theme.font_size_base || 16]}
              onValueChange={([v]) => onChange({ font_size_base: v })}
              min={12}
              max={24}
              step={1}
            />
          </div>
        </div>

        <Separator />

        {/* Layout */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Mise en page</h3>
          <div className="space-y-2">
            <Label className="text-xs">Arrondi des bordures: {theme.border_radius || 8}px</Label>
            <Slider
              value={[theme.border_radius || 8]}
              onValueChange={([v]) => onChange({ border_radius: v })}
              min={0}
              max={24}
              step={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Espacement des champs: {theme.field_spacing || 24}px</Label>
            <Slider
              value={[theme.field_spacing || 24]}
              onValueChange={([v]) => onChange({ field_spacing: v })}
              min={8}
              max={48}
              step={4}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Largeur max: {theme.page_max_width || 720}px</Label>
            <Slider
              value={[theme.page_max_width || 720]}
              onValueChange={([v]) => onChange({ page_max_width: v })}
              min={480}
              max={1200}
              step={40}
            />
          </div>
        </div>

        <Separator />

        {/* Background */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Arrière-plan</h3>
          <div className="space-y-2">
            <Label className="text-xs">Motif</Label>
            <Select
              value={theme.background_pattern || "none"}
              onValueChange={(v) => onChange({ background_pattern: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
                <SelectItem value="dots">Points</SelectItem>
                <SelectItem value="lines">Lignes</SelectItem>
                <SelectItem value="grid">Grille</SelectItem>
                <SelectItem value="hexagons">Hexagones</SelectItem>
                <SelectItem value="circuit">Circuit</SelectItem>
                <SelectItem value="topography">Topographie</SelectItem>
                <SelectItem value="waves">Vagues</SelectItem>
                <SelectItem value="crosshatch">Croisillons</SelectItem>
                <SelectItem value="diagonal">Diagonales</SelectItem>
                <SelectItem value="mesh">Mesh</SelectItem>
                <SelectItem value="noise">Bruit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Custom CSS */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">CSS personnalisé</h3>
          <Textarea
            value={theme.custom_css || ""}
            onChange={(e) => onChange({ custom_css: e.target.value })}
            placeholder="/* Add custom CSS */"
            rows={6}
            className="font-mono text-xs"
          />
        </div>
      </div>
    </ScrollArea>
  );
}

function ColorPickerInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        {/* Color Preview Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="w-10 h-10 rounded-lg border-2 border-[hsl(var(--border))] shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor: value }}
          />
          {showPresets && (
            <div className="absolute top-12 left-0 z-50 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-lg p-3 w-64 animate-scale-in">
              {/* Hex Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <Input
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 text-xs font-mono uppercase"
                  placeholder="#000000"
                />
              </div>

              {/* Preset Colors Grid */}
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    className={cn(
                      "w-7 h-7 rounded-md border border-[hsl(var(--border))] transition-transform hover:scale-110",
                      value.toUpperCase() === color.toUpperCase() && "ring-2 ring-[hsl(var(--primary))] ring-offset-2"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Color Palettes */}
              <div className="space-y-2">
                {ACCENT_PRESETS.map((preset) => (
                  <div key={preset.name}>
                    <p className="text-xs text-muted-foreground mb-1">{preset.name}</p>
                    <div className="flex gap-1">
                      {preset.colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => onChange(color)}
                          className={cn(
                            "flex-1 h-6 rounded transition-transform hover:scale-105",
                            value.toUpperCase() === color.toUpperCase() && "ring-2 ring-[hsl(var(--primary))] ring-offset-1"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hex Input */}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs font-mono uppercase"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
