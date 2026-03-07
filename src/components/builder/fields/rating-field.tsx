"use client";

import { useState } from "react";
import { FieldComponentProps } from "./field-registry";
import { Label } from "@/components/ui/label";
import { Star, Heart, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const iconMap = {
  star: Star,
  heart: Heart,
  thumbsup: ThumbsUp,
};

export function RatingField({ field, mode, value, onChange, error }: FieldComponentProps) {
  const [hovered, setHovered] = useState<number>(0);
  const ratingMax = field.field_config.rating_max ?? 5;
  const ratingIcon = field.field_config.rating_icon ?? "star";
  const Icon = iconMap[ratingIcon] || Star;
  const currentValue = (value as number) || 0;

  function handleClick(rating: number) {
    if (mode === "builder") return;
    onChange?.(rating === currentValue ? 0 : rating);
  }

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <div className="flex gap-1">
        {Array.from({ length: ratingMax }, (_, i) => i + 1).map((rating) => {
          const isFilled = mode === "builder"
            ? false
            : rating <= (hovered || currentValue);

          return (
            <button
              key={rating}
              type="button"
              disabled={mode === "builder"}
              onClick={() => handleClick(rating)}
              onMouseEnter={() => mode === "renderer" && setHovered(rating)}
              onMouseLeave={() => mode === "renderer" && setHovered(0)}
              className={cn(
                "p-1 transition-colors rounded",
                "disabled:cursor-not-allowed",
                mode === "renderer" && "hover:scale-110 transition-transform"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isFilled
                    ? ratingIcon === "heart"
                      ? "fill-red-500 text-red-500"
                      : ratingIcon === "thumbsup"
                        ? "fill-blue-500 text-blue-500"
                        : "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
