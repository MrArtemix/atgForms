"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";

interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  title: string;
  subtitle?: string;
  onDownload: () => void;
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  pdfUrl,
  title,
  subtitle,
  onDownload,
}: PdfPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden animate-scale-in">
        <DialogHeader className="p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base">{title}</DialogTitle>
              {subtitle && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 w-full bg-[hsl(var(--muted))]/20 relative">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0`}
              className="w-full h-full border-0"
              title={`Preview PDF - ${title}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          )}
        </div>
        <DialogFooter className="p-4 border-t border-[hsl(var(--border))]">
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button
              onClick={onDownload}
              disabled={!pdfUrl}
              className="hover-lift active-press"
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
