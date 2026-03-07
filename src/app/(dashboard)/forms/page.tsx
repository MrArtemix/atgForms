"use client";

import { useState } from "react";
import Link from "next/link";
import { useForms } from "@/lib/hooks/use-forms";
import { FormCard } from "@/components/common/form-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, LayoutGrid, List, FileText, Loader2 } from "lucide-react";
import { formService } from "@/lib/services/form-service";
import { workspaceService } from "@/lib/services/workspace-service";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Form } from "@/types/form";
import { formatRelative } from "@/lib/utils/date";
import { PageHeader, PageShell } from "@/components/layout/page-shell";

export default function FormsPage() {
  const { forms, loading, refetch } = useForms();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const filteredForms = forms.filter((form) => {
    const matchesSearch = form.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateForm = async () => {
    setCreating(true);
    try {
      const workspace = await workspaceService.ensurePersonalWorkspace();
      const form = await formService.createForm(
        workspace.id,
        newFormTitle || "Untitled Form"
      );
      setCreateDialogOpen(false);
      setNewFormTitle("");
      router.push(`/forms/${form.id}/edit`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Failed to create form:", msg, error);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (formId: string) => {
    try {
      const newId = await formService.duplicateForm(formId);
      await refetch();
      router.push(`/forms/${newId}/edit`);
    } catch (error) {
      console.error("Failed to duplicate form:", error);
    }
  };

  const handleDelete = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      await formService.deleteForm(formId);
      await refetch();
    } catch (error) {
      console.error("Failed to delete form:", error);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Library"
        title="Forms"
        description="Browse, search, and manage all your forms in one place."
        primaryAction={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="active-press hover-lift">
                <Plus className="mr-2 h-4 w-4" />
                New Form
              </Button>
            </DialogTrigger>
            <DialogContent className="animate-scale-in">
              <DialogHeader>
                <DialogTitle>Create New Form</DialogTitle>
                <DialogDescription>
                  Give your form a name to get started.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="form-title">Form Title</Label>
                  <Input
                    id="form-title"
                    placeholder="Customer satisfaction survey"
                    value={newFormTitle}
                    onChange={(e) => setNewFormTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void handleCreateForm(); }}
                    className="h-11 transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleCreateForm()}
                  disabled={creating}
                  className="active-press"
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Form
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in-up animate-stagger-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 transition-all duration-200"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 transition-all duration-200"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-48 skeleton animate-stagger-${i}`} />
          ))}
        </div>
      ) : filteredForms.length === 0 ? (
        forms.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No forms yet"
            description="Create your first form to start collecting responses."
            action={
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="active-press"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Form
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<Search className="h-12 w-12" />}
            title="No forms found"
            description="Try adjusting your search or filter criteria."
          />
        )
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredForms.map((form, i) => (
            <div
              key={form.id}
              className={`animate-fade-in-up animate-stagger-${Math.min(
                i + 1,
                6
              )}`}
            >
              <FormCard
                form={form}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredForms.map((form, i) => (
            <div
              key={form.id}
              className={`animate-fade-in-up animate-stagger-${Math.min(
                i + 1,
                6
              )}`}
            >
              <FormListItem
                form={form}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function FormListItem({
  form,
  onDuplicate: _onDuplicate,
  onDelete: _onDelete,
}: {
  form: Form;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const statusColors: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
    closed: "bg-red-100 text-red-800",
    archived: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] p-4 transition-all duration-200 hover:bg-[hsl(var(--muted))]/50 hover:shadow-sm hover:border-[hsl(var(--primary))]/20">
      <Link href={`/forms/${form.id}/edit`} className="flex flex-1 items-center gap-4 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 shrink-0">
          <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium truncate">{form.title}</h4>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {form.response_count} responses &middot; Updated {formatRelative(form.updated_at)}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusColors[form.status]
          )}
        >
          {form.status}
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/forms/${form.id}/edit`}>Edit</Link>
        </Button>
      </div>
    </div>
  );
}
