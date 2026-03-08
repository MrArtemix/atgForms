"use client";

import { Form } from "@/types/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ClipboardList,
  EllipsisVertical,
  PenLine,
  ScanEye,
  Share,
  CopyPlus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatRelative } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

interface FormCardProps {
  form: Form;
  onDuplicate?: (formId: string) => void;
  onDelete?: (formId: string) => void;
  onShare?: (form: Form) => void;
}

const statusConfig: Record<string, { badge: string; border: string; label: string }> = {
  draft: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    border: "status-border-draft",
    label: "Brouillon",
  },
  published: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    border: "status-border-published",
    label: "Publié",
  },
  closed: {
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    border: "status-border-closed",
    label: "Fermé",
  },
  archived: {
    badge: "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300",
    border: "status-border-archived",
    label: "Archivé",
  },
};

export function FormCard({ form, onDuplicate, onDelete, onShare }: FormCardProps) {
  const status = statusConfig[form.status] || statusConfig.draft;

  return (
    <Card className={cn("card-hover-glow group", status.border)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link href={`/forms/${form.id}/edit`} className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[hsl(var(--primary))]/10 rounded-lg flex items-center justify-center shrink-0">
                <ClipboardList className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm truncate">{form.title}</CardTitle>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {formatRelative(form.updated_at)}
                </p>
              </div>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scale-in">
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/edit`}>
                  <PenLine className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/preview`}>
                  <ScanEye className="h-4 w-4 mr-2" />
                  Aperçu
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/analytics`}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytiques
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(form)}>
                <Share className="h-4 w-4 mr-2" />
                Partager
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void onDuplicate?.(form.id)}>
                <CopyPlus className="h-4 w-4 mr-2" />
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void onDelete?.(form.id)}
                className="text-[hsl(var(--destructive))]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {form.status === "published" && <span className="status-dot-live" />}
            <Badge
              variant="secondary"
              className={cn("text-xs", status.badge)}
            >
              {status.label}
            </Badge>
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {form.response_count} réponse{form.response_count !== 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
