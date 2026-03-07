"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { FieldComponentProps } from "./field-registry";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PenLine, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SignatureField({ field, mode, value, onChange, error }: FieldComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  // Properly size the canvas to match its CSS layout dimensions.
  // Uses ResizeObserver to keep the canvas in sync if the container resizes.
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Only resize if dimensions actually changed
    const newW = Math.floor(rect.width * dpr);
    const newH = Math.floor(rect.height * dpr);
    if (canvas.width === newW && canvas.height === newH) return;

    // Save old content
    const ctx = canvas.getContext("2d");
    let imageData: ImageData | null = null;
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    canvas.width = newW;
    canvas.height = newH;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "hsl(var(--foreground))";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Restore old content if we had any
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
    }
  }, []);

  useEffect(() => {
    if (mode !== "renderer") return;

    // Initial size after layout
    const raf = requestAnimationFrame(() => resizeCanvas());

    // Keep in sync on resize
    const container = containerRef.current;
    if (!container) return () => cancelAnimationFrame(raf);

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [mode, resizeCanvas]);

  // Restore signature from saved base64 value (e.g. when navigating back)
  useEffect(() => {
    if (mode !== "renderer" || !value || typeof value !== "string") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHasStrokes(true);
    };
    img.src = value;
  }, [mode]); // only on mount, not on every value change

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasStrokes(false);
    onChange?.("");
  }, [onChange]);

  function getPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (mode === "builder") return;
    e.preventDefault(); // prevent scroll on touch
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing || mode === "builder") return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    if (!isDrawing) return;
    setIsDrawing(false);
    setHasStrokes(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export as PNG data URL
    const dataUrl = canvas.toDataURL("image/png");
    onChange?.(dataUrl);
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

      {mode === "builder" ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center gap-2",
            "bg-muted/30 border-muted-foreground/25 cursor-not-allowed"
          )}
        >
          <PenLine className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Signature area</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            ref={containerRef}
            className={cn(
              "border-2 rounded-lg relative overflow-hidden",
              error ? "border-destructive" : "border-input",
              "bg-background"
            )}
            style={{ height: "128px" }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasStrokes && !value && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-muted-foreground">Signez ici</p>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Effacer
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
