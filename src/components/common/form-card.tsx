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
  FileText,
  MoreHorizontal,
  Pencil,
  Eye,
  Share2,
  Copy,
  Trash2,
  BarChart3,
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

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  closed: "bg-red-100 text-red-800",
  archived: "bg-gray-100 text-gray-800",
};

export function FormCard({ form, onDuplicate, onDelete, onShare }: FormCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link href={`/forms/${form.id}/edit`} className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm truncate">{form.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
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
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/preview`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/analytics`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(form)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void onDuplicate?.(form.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void onDelete?.(form.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={cn("text-xs", statusColors[form.status])}
          >
            {form.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {form.response_count} responses
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
